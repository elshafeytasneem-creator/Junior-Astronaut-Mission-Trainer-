/**
 * Phaser scene for the outpost map.
 *
 * `public/assets/images` and `public/assets/audio` are empty, so every pixel here is
 * drawn procedurally. React never touches Phaser objects: the shell pushes
 * `SceneInputData` on `SCENE_INBOUND.input` and receives clicks on `SCENE_OUTBOUND.*`.
 */

import Phaser from "phaser";
import type { BuildingInstance, PowerUpCollectible, StepResult } from "../types/outpost";
import type { LayoutSlot, SceneInputData } from "../types/game";
import { GAME_SCENE_KEY, OUTPOST_SLOTS, SCENE_INBOUND, SCENE_OUTBOUND } from "../types/game";

const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

/** Per-type palette plus a shape id; keeps the map readable without any art files. */
const STYLE: Record<string, { body: number; trim: number; shape: "dome" | "box" | "panel" | "cylinder" | "dish" | "wheel" | "tank" }> = {
  pressurized_habitat: { body: 0xd8dee9, trim: 0x5c7cfa, shape: "dome" },
  airlock: { body: 0xb9c2cf, trim: 0x4c6ef5, shape: "box" },
  greenhouse: { body: 0x74c08a, trim: 0x2f9e44, shape: "dome" },
  solar_array: { body: 0x2b3f8c, trim: 0x7aa2ff, shape: "panel" },
  battery_bank: { body: 0xf0b64c, trim: 0x8a5a00, shape: "cylinder" },
  power_distribution: { body: 0xfacc6b, trim: 0x6b4b00, shape: "box" },
  rover_charger: { body: 0xffb35c, trim: 0x7a4300, shape: "box" },
  water_recovery: { body: 0x6bb7e8, trim: 0x1b5f8c, shape: "tank" },
  oxygen_generator: { body: 0x8fd6d0, trim: 0x1f7a72, shape: "tank" },
  co2_removal: { body: 0x9aa6c8, trim: 0x394769, shape: "cylinder" },
  sabatier: { body: 0xc3a2e8, trim: 0x5b3a86, shape: "tank" },
  thermal_control: { body: 0xf3a6a6, trim: 0x8c2f2f, shape: "panel" },
  radiation_monitor: { body: 0xe8e3a6, trim: 0x7a7018, shape: "dish" },
  radiation_shelter: { body: 0x9c8f7f, trim: 0x5d4c3b, shape: "dome" },
  cargo_module: { body: 0xc8b79a, trim: 0x6b563b, shape: "box" },
  communications: { body: 0xdfe3ea, trim: 0x495569, shape: "dish" },
  rover: { body: 0xf1f3f5, trim: 0x343a40, shape: "wheel" },
  spare_parts_storage: { body: 0xbfae8f, trim: 0x63503a, shape: "box" },
};

const FALLBACK_STYLE = { body: 0xcccccc, trim: 0x666666, shape: "box" as const };

const STATUS_COLOR: Record<string, number> = {
  ON: 0x37b24d,
  PROCESSING: 0x37b24d,
  GROWING: 0x37b24d,
  CHARGING: 0x4dabf7,
  DEPLOYED: 0x4dabf7,
  ACTIVE: 0x4dabf7,
  MOVING: 0x4dabf7,
  CYCLING: 0x4dabf7,
  IDLE: 0xf59f00,
  PARKED: 0x868e96,
  OFF: 0x868e96,
  INACTIVE: 0x868e96,
  STOWED: 0x868e96,
  DAMAGED: 0xe8590c,
  REPAIRING: 0xf08c00,
  UNDER_CONSTRUCTION: 0xffd43b,
  DESTROYED: 0xc92a2a,
};

interface PadVisual {
  slot: LayoutSlot;
  zone: Phaser.GameObjects.Zone;
  label: Phaser.GameObjects.Text;
}

export class GameScene extends Phaser.Scene {
  private art?: Phaser.GameObjects.Graphics;
  private pads: PadVisual[] = [];
  private crateObjects = new Map<string, Phaser.GameObjects.Container>();
  private overlay?: Phaser.GameObjects.Graphics;
  private last: SceneInputData | null = null;

  constructor() {
    super(GAME_SCENE_KEY);
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#05070d");
    this.drawStars();
    this.drawGround();

    this.art = this.add.graphics();
    this.overlay = this.add.graphics();

    const ground = this.add.zone(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2, DESIGN_WIDTH, DESIGN_HEIGHT);
    ground.setOrigin(0.5);
    ground.setInteractive({ useHandCursor: true });
    ground.on("pointerdown", () => this.game.events.emit(SCENE_OUTBOUND.select, { instanceId: null }));
    this.add.existing(ground);

    for (const slot of OUTPOST_SLOTS) {
      const pad = this.add.graphics();
      pad.fillStyle(0x46536b, 0.9);
      pad.fillCircle(slot.x, slot.y, 6);
      pad.lineStyle(2, 0x46536b, 0.35);
      pad.strokeCircle(slot.x, slot.y, 34);

      const zone = this.add.zone(slot.x, slot.y, 92, 92);
      zone.setOrigin(0.5);
      zone.setInteractive({ useHandCursor: true });
      const label = this.add
        .text(slot.x, slot.y + 46, slot.label, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
          color: "#8fa0bd",
        })
        .setOrigin(0.5);

      zone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        pointer.event?.stopPropagation?.();
        const building = this.buildingAtSlot(slot.slotId);
        if (building) {
          this.game.events.emit(SCENE_OUTBOUND.select, { instanceId: building.instanceId });
        } else {
          this.game.events.emit(SCENE_OUTBOUND.build, { slotId: slot.slotId });
        }
      });

      this.pads.push({ slot, zone, label });
    }

    this.game.events.on(SCENE_INBOUND.input, this.applyInput, this);
    this.events.once("shutdown", this.teardown, this);
    this.game.events.emit(SCENE_OUTBOUND.ready);
    if (this.last) this.applyInput(this.last);
  }

  private teardown(): void {
    this.game.events.off(SCENE_INBOUND.input, this.applyInput, this);
  }

  private buildingAtSlot(slotId: string): BuildingInstance | undefined {
    return this.last?.instances.find((instance) => instance.slotId === slotId);
  }

  private drawStars(): void {
    const stars = this.add.graphics();
    for (let index = 0; index < 140; index += 1) {
      // Deterministic pseudo-random starfield: the scene must look identical every run.
      const t = (index * 2654435761) % 4294967296;
      const x = (t % DESIGN_WIDTH) + ((index % 7) * 3);
      const y = ((t >> 8) % (DESIGN_HEIGHT * 0.55)) | 0;
      const size = (index % 3) + 1;
      stars.fillStyle(0xffffff, 0.25 + (index % 5) * 0.12);
      stars.fillRect(x % DESIGN_WIDTH, y, size, size);
    }
  }

  private drawGround(): void {
    const ground = this.add.graphics();
    ground.fillStyle(0x2a2f3a, 1);
    ground.fillRect(0, DESIGN_HEIGHT * 0.24, DESIGN_WIDTH, DESIGN_HEIGHT * 0.76);
    ground.fillStyle(0x32384453 & 0xffffff, 0.5);
    for (let index = 0; index < 26; index += 1) {
      const x = ((index * 379) % DESIGN_WIDTH) + 12;
      const y = DESIGN_HEIGHT * 0.3 + ((index * 137) % (DESIGN_HEIGHT * 0.62));
      const r = 8 + (index % 5) * 6;
      ground.fillCircle(x, y, r);
    }
    ground.lineStyle(1, 0x4b5566, 0.55);
    for (let row = 0; row < 6; row += 1) {
      const y = DESIGN_HEIGHT * 0.3 + row * 62;
      ground.lineBetween(0, y, DESIGN_WIDTH, y + 18);
    }
  }

  private applyInput(data: SceneInputData): void {
    this.last = data;
    const art = this.art;
    const overlay = this.overlay;
    if (!art || !overlay) return;

    art.clear();
    overlay.clear();

    for (const pad of this.pads) {
      const building = data.instances.find((instance) => instance.slotId === pad.slot.slotId);
      const type = building?.typeId;
      pad.label.setText(building ? this.shortName(type) : pad.slot.label);
      pad.label.setColor(building ? "#dfe7ff" : "#8fa0bd");
    }

    for (const instance of data.instances) {
      const pad = this.pads.find((item) => item.slot.slotId === instance.slotId);
      const position = pad ? pad.slot : { x: 640, y: 360 };
      this.drawStructure(art, instance, position.x, position.y);
    }

    this.drawSun(art, data.view, data.sunlightFactor);
    this.syncCrates(data.collectibles);

    if (data.sunlightFactor <= 0.05) {
      overlay.fillStyle(0x0a1a3a, 0.42);
      overlay.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    }
    if (data.view.radiationExposure === "exposed") {
      overlay.fillStyle(0xd7263d, 0.2 + 0.08 * Math.sin(Date.now() / 220));
      overlay.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    } else if (data.view.radiationExposure === "sheltered") {
      overlay.fillStyle(0x1c7ed6, 0.16);
      overlay.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    }
    if (data.view.powerStatus.brownout) {
      overlay.lineStyle(6, 0xffb703, 0.75);
      overlay.strokeRect(6, 6, DESIGN_WIDTH - 12, DESIGN_HEIGHT - 12);
    }
    if (data.crewSheltered) {
      overlay.fillStyle(0x2b8a3e, 0.1);
      overlay.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    }
  }

  private shortName(typeId?: string): string {
    if (!typeId) return "empty";
    const words = typeId.split("_");
    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }

  private drawStructure(
    art: Phaser.GameObjects.Graphics,
    instance: BuildingInstance,
    x: number,
    y: number
  ): void {
    const style = STYLE[instance.typeId] ?? FALLBACK_STYLE;
    const selected = this.last?.selectedInstanceId === instance.instanceId;
    const statusColor = STATUS_COLOR[instance.status] ?? 0x868e96;
    const scale = instance.level >= 2 ? 1.18 : 1;

    art.fillStyle(style.body, 0.95);
    switch (style.shape) {
      case "dome":
        art.fillCircle(x, y, 30 * scale);
        break;
      case "panel":
        art.fillRoundedRect(x - 34 * scale, y - 14 * scale, 68 * scale, 28 * scale, 4);
        break;
      case "cylinder":
        art.fillRoundedRect(x - 18 * scale, y - 26 * scale, 36 * scale, 52 * scale, 10);
        break;
      case "tank":
        art.fillRoundedRect(x - 22 * scale, y - 20 * scale, 44 * scale, 40 * scale, 18);
        break;
      case "dish":
        art.fillCircle(x, y, 22 * scale);
        break;
      case "wheel":
        art.fillRoundedRect(x - 30, y - 14, 60, 26, 6);
        break;
      default:
        art.fillRoundedRect(x - 28 * scale, y - 20 * scale, 56 * scale, 40 * scale, 6);
    }

    art.lineStyle(3, style.trim, 1);
    if (style.shape === "panel") {
      for (let column = 0; column < 4; column += 1) {
        const offset = x - 30 + column * 20;
        art.lineBetween(offset, y - 12, offset, y + 12);
      }
    }
    if (style.shape === "wheel") {
      art.strokeCircle(x - 20, y + 12, 7);
      art.strokeCircle(x + 20, y + 12, 7);
    }
    if (style.shape === "dish") {
      art.lineBetween(x, y, x, y + 18);
    }

    // Status dot: colour plus the first letter of the status, never colour alone.
    art.fillStyle(statusColor, 1);
    art.fillCircle(x + 26, y - 24, 7);

    if (instance.damage !== "none") {
      art.lineStyle(3, instance.damage === "destroyed" ? 0xc92a2a : 0xe8590c, 1);
      art.lineBetween(x - 14, y - 14, x + 14, y + 14);
    }
    if (instance.status === "UNDER_CONSTRUCTION") {
      art.lineStyle(3, 0xffd43b, 0.9);
      art.strokeRect(x - 36, y - 30, 72, 60);
    }
    if (instance.isStarved) {
      art.lineStyle(2, 0xf59f00, 1);
      art.strokeCircle(x, y, 40);
    }
    if (selected) {
      art.lineStyle(4, 0x22d3ee, 1);
      art.strokeCircle(x, y, 46);
    }
  }

  private drawSun(art: Phaser.GameObjects.Graphics, view: StepResult, sunlight: number): void {
    const x = 96 + ((view.hour % 24) / 24) * (DESIGN_WIDTH - 192);
    const arc = Math.sin(((view.hour % 24) / 24) * Math.PI);
    const y = DESIGN_HEIGHT * 0.16 - arc * 46;
    art.fillStyle(sunlight > 0.05 ? 0xffe066 : 0xadb5bd, 1);
    art.fillCircle(x, y, sunlight > 0.05 ? 16 : 11);
    if (sunlight > 0.05) {
      art.lineStyle(2, 0xffe066, 0.6);
      for (let ray = 0; ray < 8; ray += 1) {
        const angle = (ray / 8) * Math.PI * 2;
        art.lineBetween(x + Math.cos(angle) * 20, y + Math.sin(angle) * 20, x + Math.cos(angle) * 27, y + Math.sin(angle) * 27);
      }
    }
  }

  private syncCrates(collectibles: PowerUpCollectible[]): void {
    const wanted = new Set(collectibles.map((crate) => crate.collectibleId));
    for (const [id, object] of this.crateObjects) {
      if (!wanted.has(id)) {
        object.destroy();
        this.crateObjects.delete(id);
      }
    }

    for (const crate of collectibles) {
      if (this.crateObjects.has(crate.collectibleId)) continue;
      const body = this.add.graphics();
      body.fillStyle(0x5c7cfa, 1);
      body.fillRoundedRect(-14, -14, 28, 28, 4);
      body.lineStyle(3, 0xd0ebff, 1);
      body.strokeRect(-14, -14, 28, 28);
      const tag = this.add.text(0, -26, "kit", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "11px",
        color: "#d0ebff",
      });
      tag.setOrigin(0.5);

      const container = this.add.container(crate.position.x, crate.position.y, [body, tag]);
      container.setInteractive({ useHandCursor: true });
      container.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        pointer.event?.stopPropagation?.();
        this.game.events.emit(SCENE_OUTBOUND.collect, { collectibleId: crate.collectibleId });
      });
      this.tweens.add({
        targets: container,
        y: crate.position.y - 6,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      this.crateObjects.set(crate.collectibleId, container);
    }
  }
}

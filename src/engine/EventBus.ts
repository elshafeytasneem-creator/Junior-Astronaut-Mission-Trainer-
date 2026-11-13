import type { EventHandler, SimEvent, SimEventName } from "../types/outpost";

type AnyHandler = EventHandler<unknown>;

export class EventBus {
  private handlers = new Map<SimEventName, Set<AnyHandler>>();

  subscribe<T = unknown>(name: SimEventName, handler: EventHandler<T>): () => void {
    let set = this.handlers.get(name);
    if (!set) {
      set = new Set();
      this.handlers.set(name, set);
    }
    const wrapped = handler as AnyHandler;
    set.add(wrapped);
    return () => set!.delete(wrapped);
  }

  emit(name: SimEventName, payload: unknown): SimEvent {
    const event: SimEvent = { name, payload };
    const set = this.handlers.get(name);
    if (set) {
      for (const handler of set) handler(payload);
    }
    return event;
  }
}

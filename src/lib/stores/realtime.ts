import { writable, type Writable } from 'svelte/store';
import { getChannel, releaseChannel } from './channel';

type Row = { [key: string]: boolean | string | number };
type StoreMap<T extends Row, K extends keyof Row> = Map<T[K], T>;

// ---- Store factory ----
export const realtimeStore = <T extends Row, K extends keyof T>(
  table: string,
  key: K
) => {
  const store: Writable<StoreMap<T, K>> = writable(new Map());

  let subscribed = false;

  function subscribeToTable() {
    if (subscribed) return;
    const ch = getChannel();
    ch.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        store.update((map) => {
          if (payload.eventType === 'DELETE') {
            map.delete(payload.old.id);
          } else {
            map.set(payload.new.id, payload.new as T);
          }
          return new Map(map); // force reactivity
        });
      }
    ).subscribe();
    subscribed = true;
  }

  function unsubscribeFromTable() {
    if (!subscribed) return;
    releaseChannel();
    subscribed = false;
  }

  return {
    subscribe: store.subscribe,
    // initialize subscription
    init: () => subscribeToTable(),
    // cleanup manually
    destroy: () => unsubscribeFromTable(),
    // convenience getters
    get: (id: T['id']) => {
      let val: T | undefined;
      store.subscribe((map) => (val = map.get(id)))();
      return val;
    }
  };
}

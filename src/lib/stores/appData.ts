import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { user } from './user';
import { getChannel, releaseChannel } from './channel';
import { usersMap } from './usersMap';

export const todos = writable<any[]>([]);

// watch user changes
user.subscribe(($user) => {
  if ($user) {


    const ch = getChannel();

    ch.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          todos.update((current) => {
            if (payload.eventType === 'INSERT') {
              return [...current, payload.new];
            }
            if (payload.eventType === 'UPDATE') {
              return current.map((t) => (t.id === payload.new.id ? payload.new : t));
            }
            if (payload.eventType === 'DELETE') {
              return current.filter((t) => t.id !== payload.old.id);
            }
            return current;
          });
        }
      )
      .subscribe();
  } else {
    releaseChannel();
    usersMap.set(new Map());
  }
});

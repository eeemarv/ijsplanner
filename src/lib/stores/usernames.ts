import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { user } from './user';
import { SvelteMap } from 'svelte/reactivity';

export const usernamesMap = writable<SvelteMap<string, string>>(new SvelteMap());

user.subscribe(async ($user) => {
  if (!$user){
    usernamesMap.set(new SvelteMap());
    return;
  }

  const u = new SvelteMap<string, string>();

  const { data, error } = await supabase
    .from('usernames')
    .select('user_id, username');

  if (error){
    throw error;
  }

  if (data) {
    for (const d of data) {
      u.set(d.user_id, d.username);
    }
  }

  usernamesMap.set(u);
});

export const channelUsernamesMap = () => {
  const ch = supabase.channel('usernames')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'usernames' },
    (payload) => {
      console.log('-- delete usernames', payload);
      usernamesMap.update((u) => {
        u.delete(payload.old.user_id);
        return u;
      });
    }
  ).on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'usernames' },
    (payload) => {
      console.log('-- update usernames', payload);
      usernamesMap.update((u) => {
        u.set(payload.new.user_id, payload.new.username);
        return u;
      });
    }
  ).on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'usernames' },
    (payload) => {
      console.log('-- insert usernames', payload);
      usernamesMap.update((u) => {
        u.set(payload.new.user_id, payload.new.username);
        return u;
      });
    }
  ).subscribe();
};

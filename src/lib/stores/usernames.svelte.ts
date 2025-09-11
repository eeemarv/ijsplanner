import { supabase } from '$lib/supabase';
import { SvelteMap } from 'svelte/reactivity';

let ch: ReturnType<typeof supabase.channel> | null = null;

export const usernames = $state({
  map: new SvelteMap<string,string>()
});

export const loadUsernames = async () => {
  usernames.map.clear();

  const { data, error } = await supabase
    .from('usernames')
    .select('user_id, username')
    .order('created_at', {ascending: true});

  if (error){
    throw error;
  }

  if (data) {
    for (const d of data) {
      usernames.map.set(d.user_id, d.username);
    }
  }
};

const subscribeUsernames = () => {
  ch = supabase.channel('usernames')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'usernames' },
    (payload) => {
      console.log('-- delete usernames', payload);
      usernames.map.delete(payload.old.user_id);
    }
  ).on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'usernames' },
    (payload) => {
      console.log('-- update usernames', payload);
      usernames.map.set(payload.new.user_id, payload.new.username);
    }
  ).on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'usernames' },
    (payload) => {
      console.log('-- insert usernames', payload);
      usernames.map.set(payload.new.user_id, payload.new.username);
    }
  ).subscribe();
};

export const initUsernames = async () => {
  await loadUsernames();
  if (!ch){
    subscribeUsernames();
  }
};

export const clearUsernames = async () => {
  if (ch){
    supabase.removeChannel(ch);
    ch = null;
  }
  usernames.map.clear();
};

import { supabase } from '$lib/supabase';
import { SvelteMap } from 'svelte/reactivity';

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

export const clearUsernames = async () => {
  usernames.map.clear();
};

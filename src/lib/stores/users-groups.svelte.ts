import { supabase } from '$lib/supabase';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';

export const usersGroups = $state({
  set: new SvelteSet<string>()
});

export const loadUsersGroups = async () => {
  usersGroups.set.clear();

  const { data, error } = await supabase
    .from('users_groups')
    .select('user_id, group_id')
    .order('created_at', {ascending: true});

  if (error){
    throw error;
  }

  for (const d of data) {
    usersGroups.set.add(id2(d.group_id, d.user_id));
  }
};

export const clearUsersGroups = async () => {
  usersGroups.set.clear();
};

import { supabase } from '$lib/supabase';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';

export const roleTasks = $state({
  set: new SvelteSet<string>()
});

export const loadRoleTasks = async () => {
  roleTasks.set.clear();

  const { data, error } = await supabase
    .from('role_tasks')
    .select('group_id, user_id');

  if (error) {
    throw error;
  }

  for (const d of data) {
    roleTasks.set.add(id2(d.group_id, d.user_id));
  }
};

export const clearRoleTasks = async () => {
  roleTasks.set.clear();
};
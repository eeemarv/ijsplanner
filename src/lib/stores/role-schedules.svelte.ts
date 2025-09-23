import { supabase } from '$lib/supabase';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';

export const roleSchedules = $state({
  set: new SvelteSet<string>()
});

export const loadRoleSchedules = async () => {
  roleSchedules.set.clear();

  const { data, error } = await supabase
    .from('role_schedules')
    .select('group_id, user_id');

  if (error) {
    throw error;
  }

  for (const d of data) {
    roleSchedules.set.add(id2(d.group_id, d.user_id));
  }
};

export const clearRoleSchedules = async () => {
  roleSchedules.set.clear();
};
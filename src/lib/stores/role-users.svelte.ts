import { supabase } from '$lib/supabase';
import { SvelteSet } from 'svelte/reactivity';

export const roleUsers = $state({
  set: new SvelteSet<string>()
});

export const loadRoleUsers = async () => {
  roleUsers.set.clear();

  const { data, error } = await supabase
    .from('role_users')
    .select('user_id');

  if (error) {
    throw error;
  }

  for (const d of data) {
    roleUsers.set.add(d.user_id);
  }
};

export const clearRoleUsers = async () => {
  roleUsers.set.clear();
};
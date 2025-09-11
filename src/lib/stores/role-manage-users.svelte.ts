import { supabase } from '$lib/supabase';
import { user } from './user';
import { SvelteSet } from 'svelte/reactivity';

export const roleManageUsers = $state({
  set: new SvelteSet<string>()
});

export const loadRoleManageUsers = async () => {
  roleManageUsers.set.clear();

  const { data, error } = await supabase
    .from('role_manage_users')
    .select('user_id');

  if (error) {
    throw error;
  }

  for (const d of data) {
    roleManageUsers.set.add(d.user_id);
  }
};

user.subscribe(async ($user) => {
  if (!$user){
    roleManageUsers.set.clear();
    return;
  }

  await loadRoleManageUsers();
});

export const channelRoleManageUsers = () => {
  const ch = supabase.channel('role-manage-users')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'role_manage_users' },
    (payload) => {
      console.log('-- delete role-manage-users', payload);
      const user_id = payload.old.user_id;
      roleManageUsers.set.delete(user_id);
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'role_manage_users' },
    (payload) => {
      console.log('-- insert role-manage-users', payload);
      const user_id = payload.new.user_id;
      roleManageUsers.set.add(user_id);
    }
  ).subscribe();
};
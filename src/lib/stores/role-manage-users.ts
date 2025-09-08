import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { user } from './user';
import { SvelteSet } from 'svelte/reactivity';

export const roleManageUsersSet = writable<SvelteSet<string>>(new SvelteSet());

user.subscribe(async ($user) => {
  if (!$user){
    roleManageUsersSet.set(new SvelteSet<string>());
    return;
  }

  const sa = new SvelteSet<string>();

  const { data, error } = await supabase
    .from('role_manage_users')
    .select('user_id');

  if (error) {
    throw error;
  }

  for (const d of data) {
    sa.add(d.user_id);
  }

  roleManageUsersSet.set(sa);
});

export const channelRoleManageUsersSet = () => {
  const ch = supabase.channel('role-manage-users')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'role_manage_users' },
    (payload) => {
      console.log('-- delete role-manage-users', payload);
      roleManageUsersSet.update((su) => {
        const user_id = payload.old.user_id;
        su.delete(user_id);
        return su;
      });
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'role_manage_users' },
    (payload) => {
      console.log('-- insert role-manage-users', payload);
      roleManageUsersSet.update((su) => {
        const user_id = payload.new.user_id;
        if (user_id){
          su.add(user_id);
        }
        return su;
      });
    }
  ).subscribe();
};
import { supabase } from '$lib/supabase';
import { SvelteSet } from 'svelte/reactivity';

let ch: ReturnType<typeof supabase.channel> | null = null;

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

const subscribeRoleUsers = () => {
  ch = supabase.channel('role-users')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'role_users' },
    (payload) => {
      console.log('-- delete role-users', payload);
      const user_id = payload.old.user_id;
      roleUsers.set.delete(user_id);
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'role_users' },
    (payload) => {
      console.log('-- insert role-users', payload);
      const user_id = payload.new.user_id;
      roleUsers.set.add(user_id);
    }
  ).subscribe();
};

export const initRoleUsers = async () => {
  await loadRoleUsers();
  if (!ch){
    subscribeRoleUsers();
  }
};

export const clearRoleUsers = async () => {
  if (ch){
    supabase.removeChannel(ch);
    ch = null;
  }
  roleUsers.set.clear();
};
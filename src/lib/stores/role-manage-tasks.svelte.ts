import { supabase } from '$lib/supabase';
import { user } from './user';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';

export const roleManageTasks = $state({
  set: new SvelteSet<string>()
});

export const loadRoleManageTasks = async () => {
  roleManageTasks.set.clear();

  const { data, error } = await supabase
    .from('role_manage_tasks')
    .select('group_id, user_id');

  if (error) {
    throw error;
  }

  for (const d of data) {
    roleManageTasks.set.add(id2(d.group_id, d.user_id));
  }
};

user.subscribe(async ($user) => {
  if (!$user){
    roleManageTasks.set.clear();
    return;
  }

  await loadRoleManageTasks();
});

export const channelRoleManageTasks = () => {
  const ch = supabase.channel('role-manage-tasks')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'role_manage_tasks' },
    (payload) => {
      console.log('-- delete role-manage-tasks', payload);
      const group_id = payload.old.group_id;
      const user_id = payload.old.user_id;
      roleManageTasks.set.delete(id2(group_id, user_id));
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'role_manage_tasks' },
    (payload) => {
      console.log('-- insert role-manage-tasks', payload);
      const group_id = payload.new.group_id;
      const user_id = payload.new.user_id;
      roleManageTasks.set.add(id2(group_id, user_id));
    }
  ).subscribe();
};
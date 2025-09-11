import { supabase } from '$lib/supabase';
import { user } from './user';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';

export const roleManageSchedules = $state({
  set: new SvelteSet<string>()
});

export const loadRoleManageSchedules = async () => {
  roleManageSchedules.set.clear();

  const { data, error } = await supabase
    .from('role_manage_schedules')
    .select('group_id, user_id');

  if (error) {
    throw error;
  }

  for (const d of data) {
    roleManageSchedules.set.add(id2(d.group_id, d.user_id));
  }
};

user.subscribe(async ($user) => {
  if (!$user){
    roleManageSchedules.set.clear();
    return;
  }

  await loadRoleManageSchedules();
});

export const channelRoleManageSchedules = () => {
  const ch = supabase.channel('role-manage-schedules')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'role_manage_schedules' },
    (payload) => {
      console.log('-- delete role-manage-schedules', payload);
      const group_id = payload.old.group_id;
      const user_id = payload.old.user_id;
      roleManageSchedules.set.delete(id2(group_id, user_id));
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'role_manage_schedules' },
    (payload) => {
      console.log('-- insert role-manage-schedules', payload);
      const group_id = payload.new.group_id;
      const user_id = payload.new.user_id;
      roleManageSchedules.set.add(id2(group_id, user_id));
    }
  ).subscribe();
};
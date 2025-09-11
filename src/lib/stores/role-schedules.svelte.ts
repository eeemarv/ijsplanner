import { supabase } from '$lib/supabase';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';

let ch: ReturnType<typeof supabase.channel> | null = null;

export const roleSchedules = $state({
  set: new SvelteSet<string>()
});

export const loadRoleSchedules = async () => {
  roleSchedules.set.clear();

  const { data, error } = await supabase
    .from('role_manage_schedules')
    .select('group_id, user_id');

  if (error) {
    throw error;
  }

  for (const d of data) {
    roleSchedules.set.add(id2(d.group_id, d.user_id));
  }
};

const subscribeRoleSchedules = () => {
  ch = supabase.channel('role-manage-schedules')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'role_manage_schedules' },
    (payload) => {
      console.log('-- delete role-manage-schedules', payload);
      const group_id = payload.old.group_id;
      const user_id = payload.old.user_id;
      roleSchedules.set.delete(id2(group_id, user_id));
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'role_manage_schedules' },
    (payload) => {
      console.log('-- insert role-manage-schedules', payload);
      const group_id = payload.new.group_id;
      const user_id = payload.new.user_id;
      roleSchedules.set.add(id2(group_id, user_id));
    }
  ).subscribe();
};

export const initRoleSchedules = async () => {
  await loadRoleSchedules();
  if (!ch){
    subscribeRoleSchedules();
  }
};

export const clearRoleSchedules = async () => {
  if (ch){
    supabase.removeChannel(ch);
    ch = null;
  }
  roleSchedules.set.clear();
};
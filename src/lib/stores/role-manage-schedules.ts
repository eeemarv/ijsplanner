import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { user } from './user';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';

export const roleManageSchedulesSet = writable<SvelteSet<string>>(new SvelteSet());

user.subscribe(async ($user) => {
  if (!$user){
    roleManageSchedulesSet.set(new SvelteSet<string>());
    return;
  }

  const sa = new SvelteSet<string>();

  const { data, error } = await supabase
    .from('role_manage_schedules')
    .select('group_id, user_id');

  if (error) {
    throw error;
  }

  for (const d of data) {
    sa.add(id2(d.group_id, d.user_id));
  }

  roleManageSchedulesSet.set(sa);
});

export const channelRoleManageSchedules = () => {
  const ch = supabase.channel('role-manage-schedules')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'role_manage_schedules' },
    (payload) => {
      console.log('-- delete role-manage-schedules', payload);
      roleManageSchedulesSet.update((su) => {
        const group_id = payload.old.group_id;
        const user_id = payload.old.user_id;
        su.delete(id2(group_id, user_id));
        return su;
      });
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'role_manage_schedules' },
    (payload) => {
      console.log('-- insert role-manage-schedules', payload);
      roleManageSchedulesSet.update((su) => {
        const group_id = payload.new.group_id;
        const user_id = payload.new.user_id;
        if (group_id && user_id){
          su.add(id2(group_id, user_id));
        }
        return  su;
      });
    }
  ).subscribe();
};
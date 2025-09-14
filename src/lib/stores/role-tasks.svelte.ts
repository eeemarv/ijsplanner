import { supabase } from '$lib/supabase';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';

let ch: ReturnType<typeof supabase.channel> | null = null;

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

const subscribeRoleTasks = () => {
  ch = supabase.channel('role-tasks')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'role_tasks' },
    (payload) => {
      console.log('-- delete role-tasks', payload);
      const group_id = payload.old.group_id;
      const user_id = payload.old.user_id;
      roleTasks.set.delete(id2(group_id, user_id));
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'role_tasks' },
    (payload) => {
      console.log('-- insert role-tasks', payload);
      const group_id = payload.new.group_id;
      const user_id = payload.new.user_id;
      roleTasks.set.add(id2(group_id, user_id));
    }
  ).subscribe();
};

export const initRoleTasks = async () => {
  await loadRoleTasks();
  if (!ch){
    subscribeRoleTasks();
  }
};

export const clearRoleTasks = async () => {
  if (ch){
    supabase.removeChannel(ch);
    ch = null;
  }
  roleTasks.set.clear();
};
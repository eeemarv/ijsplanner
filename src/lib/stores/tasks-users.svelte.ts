import { supabase } from '$lib/supabase';
import { SvelteSet } from 'svelte/reactivity';
import { SvelteMap } from 'svelte/reactivity';

let ch: ReturnType<typeof supabase.channel> | null = null;

export const tasksUsers = $state({
  map: new SvelteMap<string,SvelteSet<string>>()
});

export const loadTasksUsers = async () => {
  const { data, error } = await supabase
    .from('tasks_users')
    .select('user_id, task_id')
    .order('created_at', {ascending: true});

  if (error){
    throw error;
  }

  for (const d of data) {

    const s = tasksUsers.map.get(d.task_id);
    if (!s){
      tasksUsers.map.set(d.task_id, new SvelteSet([d.user_id]));
      continue;
    }
    s.add(d.user_id);
  }
};

const subscribeTasksUsers = () => {
  ch = supabase.channel('tasks-users')
  ch.on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'tasks_users' },
    (payload) => {
      console.log('-- delete tasks-users', payload);
      const user_id = payload.old.user_id;
      const task_id = payload.old.task_id;
      const s = tasksUsers.map.get(task_id);
      if (!s){
        return;
      }
      s.delete(user_id);
      if (s.size){
        return;
      }
      tasksUsers.map.delete(task_id);
    }
  ).on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'tasks_users' },
    (payload) => {
      console.log('-- insert tasks-users', payload);
      const user_id = payload.new.user_id;
      const task_id = payload.new.task_id;
      const s = tasksUsers.map.get(task_id);
      if (!s){
        tasksUsers.map.set(task_id, new SvelteSet([user_id]));
        return;
      }
      s.add(user_id);
    }
  ).subscribe();
};

export const initTasksUsers = async () => {
  await loadTasksUsers();
  if (!ch){
    subscribeTasksUsers();
  }
};

export const clearTasksUsers = async () => {
  if (ch){
    supabase.removeChannel(ch);
    ch = null;
  }
  tasksUsers.map.clear();
};

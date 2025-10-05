import { supabase } from '$lib/supabase';
import { SvelteSet } from 'svelte/reactivity';
import { SvelteMap } from 'svelte/reactivity';
import type { SyncEvent } from '$lib/stores/sync-events.svelte';

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

export const applyToTasksUsers = (evt: SyncEvent) => {
  const p = evt.payload;
  if (!p.user_id){
    const err = 'user_id missing from payload';
    console.error(err);
    throw err;
  }
  if (!p.task_id){
    const err = 'task_id missing from payload';
    console.error(err);
    throw err;
  }
  if (evt.table_name !== 'tasks_users'){
    const err = 'table_name should be tasks_users';
    console.error(err);
    throw err;
  }
  if (evt.operation === 'UPDATE'){
    throw 'UPDATE is illegal for tasks_users';
  }
  if (evt.operation === 'DELETE'){
    const s = tasksUsers.map.get(p.task_id);
    if (!s){
      return;
    }
    s.delete(p.user_id);
    if (s.size){
      return;
    }
    tasksUsers.map.delete(p.task_id);
    return;
  }
  const s = tasksUsers.map.get(p.task_id);
  if (!s){
    tasksUsers.map.set(p.task_id, new SvelteSet([p.user_id]));
    return;
  }
  s.add(p.user_id);
};

export const clearTasksUsers = async () => {
  tasksUsers.map.clear();
};

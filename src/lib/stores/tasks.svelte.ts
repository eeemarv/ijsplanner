import type { Database } from '$lib/database';
import { supabase } from '$lib/supabase';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

type TaskRow = Database['public']['Tables']['tasks']['Row'];

type Task = {
  comment: string | null
  max_users: number | null
  min_users: number | null
  schedule_id: string | null
  minutes_day_start: number
  hours_start: number
  minutes_start: number
  hours_end: number
  minutes_end: number
};

let ch: ReturnType<typeof supabase.channel> | null = null;

export const tasks = $state({
  map: new SvelteMap<string, Task>(),
  set: new SvelteSet<string>()
});

export const groupJDays = $state({
  map: new SvelteMap<string, number[]>([]),
});
export const jDays = $state({

});

const getCutoff = ():Date => {
  const now = new Date();
  // 12 hours earlier
  return new Date(now.getTime() - (12 * 60 * 60 * 1000));
};

const setTask = (d: TaskRow) => {
  const dStart = new Date(d.t_start + 'Z');
  const dEnd = new Date(d.t_end + 'Z');
  const julian = 2440588 + Math.trunc((new Date(d.t_start + 'Z')).getTime() / 86400000);
  const hours_start = dStart.getUTCHours();
  const minutes_start = dStart.getUTCMinutes();
  const hours_end = dEnd.getUTCHours();
  const minutes_end = dEnd.getUTCMinutes();
  const min_day_start = (hours_start * 60) + minutes_start;
  const min_users = d.min_users;
  const max_users = d.max_users;
  const schedule_id = d.schedule_id;
  const comment = d.comment;

  tasks.map.set(d.id, {
    hours_start, minutes_start,
    hours_end, minutes_end,
    min_day_start,
    min_users, max_users,
    schedule_id, comment
  });

};

export const loadTasks = async () => {
  tasks.map.clear();
  tasks.set.clear();


  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .gte('t_start', getCutoff().toISOString())
    .order('t_start', {ascending: true});

  if (error) {
    throw error;
  }

  for (const d of data) {
    setTask(d);


  }
};

const subscribeGroups = () => {
  ch = supabase.channel('tasks')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'groups' },
    (payload) => {
      console.log('-- delete tasks', payload);
      tasks.map.delete(payload.old.id);

    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'tasks' },
    (payload) => {
      console.log('-- insert tasks', payload);
      if (new Date(payload.new.t_start).getTime() < getCutoff().getTime()) {
        console.log('-- insert ignored, t_start too old');
        return;
      }
      setTask(payload.new as TaskRow);
    }
  ).on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'tasks' },
    (payload) => {
      console.log('-- update groups', payload);
      // only the comment can be updated
      const t = tasks.map.get(payload.new.id);
      if (!t){
        return;
      }
      // ?
      t.comment = payload.new.comment;
    }
  ).subscribe();
};

export const initGroups = async () => {
  await loadGroups();
  if (!ch){
    subscribeGroups();
  }
};

export const clearGroups = async () => {
  if (ch){
    supabase.removeChannel(ch);
    ch = null;
  }
  groups.map.clear();
  groups.rev.clear();
};

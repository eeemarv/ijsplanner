import type { Database } from '$lib/database';
import { dateStrToJulian, dateToISOWeek, dateToJulian, id2, julianToDate } from '$lib/func';
import { supabase } from '$lib/supabase';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import type { SyncEvent } from './sync-events.svelte';

type TaskRow = Database['public']['Tables']['tasks']['Row'];

export type Task = {
  comment: string | null
  max_users: number | null
  min_users: number | null
  schedule_id: string | null
  minutes_day_start: number
  hours_start: number
  minutes_start: number
  hours_end: number
  minutes_end: number
  group_id: string,
  t_start: string
};

type DayInfo = {
  week: number,
  label: string,
  day_of_week: number
};

let ch: ReturnType<typeof supabase.channel> | null = null;

export const tasks = $state({
  map: new SvelteMap<string, Task>()
});

/**
 * group_id => jdays[]
 */
export const groupsJDays = $state({
  map: new SvelteMap<string, SvelteSet<number>>(),
});
/**
 * jday => dayinfo
 */
export const jDays = $state({
  map: new SvelteMap<number,DayInfo>()
});
/**
 * group_id:jday => task_id[]
 */
export const groupsJDaysTasks = $state({
  map: new SvelteMap<string, SvelteSet<string>>()
});

const getCutoff = ():Date => {
  const now = new Date();
  // 12 hours earlier
  return new Date(now.getTime() - (12 * 60 * 60 * 1000));
};

const setTask = (d: TaskRow) => {
  const task_id = d.id;
  const t_start = d.t_start;
  const dStart = new Date(d.t_start + 'Z');
  const dEnd = new Date(d.t_end + 'Z');
  const julian = dateToJulian(dStart);
  const hours_start = dStart.getUTCHours();
  const minutes_start = dStart.getUTCMinutes();
  const hours_end = dEnd.getUTCHours();
  const minutes_end = dEnd.getUTCMinutes();
  const minutes_day_start = (hours_start * 60) + minutes_start;
  const min_users = d.min_users;
  const max_users = d.max_users;
  const schedule_id = d.schedule_id;
  const comment = d.comment;
  const group_id = d.group_id;

  tasks.map.set(task_id, {
    hours_start, minutes_start,
    hours_end, minutes_end,
    minutes_day_start,
    min_users, max_users,
    schedule_id, comment,
    group_id, t_start
  });

  const gjId = id2(group_id, julian.toString());
  const gjt = groupsJDaysTasks.map.get(gjId);
  if (!gjt){
    groupsJDaysTasks.map.set(gjId, new SvelteSet([task_id]));
  } else {
    gjt.add(task_id);
  }

  const gJ = groupsJDays.map.get(group_id);

  if (gJ && gJ.has(julian)){
    return;
  }

  const gA = [...gJ ?? []];

  const dayOfWeek = julian % 7;
  const jDayStart = julian - dayOfWeek;
  const jDayEnd = jDayStart + 7;

  for (let jDay = jDayStart; jDay < jDayEnd; jDay++){
    gA.push(jDay);
  }

  gA.sort((a, b) => a - b);

  groupsJDays.map.set(group_id, new SvelteSet(gA));

  const jd = jDays.map.get(julian);

  if (jd){
    return;
  }

  const dF = new Intl.DateTimeFormat("nl-NL",{
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });

  for (let jDay = jDayStart; jDay < jDayEnd; jDay++){
    const d = julianToDate(jDay);
    jDays.map.set(jDay, {
      week: dateToISOWeek(d),
      label: dF.format(d),
      day_of_week: jDay % 7
    });
  }
};

export const loadTasks = async () => {
  tasks.map.clear();

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

export const applyToTasks = (evt: SyncEvent) => {
  const p = evt.payload;
  if (!p.id){
    const err = 'id missing from payload';
    console.error(err);
    throw err;
  }
  if (evt.table_name !== 'tasks'){
    const err = 'table_name should be tasks';
    console.error(err);
    throw err;
  }
  if (evt.operation === 'DELETE'){
    const t = tasks.map.get(p.id);
    if (t){
      const jd = dateStrToJulian(t.t_start);
      const tset = groupsJDaysTasks.map.get(id2(t.group_id, jd.toString()));
      if (tset){
        tset.delete(p.id);
      }
    }
    tasks.map.delete(p.id);
    return;
  }
  if (evt.operation === 'INSERT'){
    if (new Date(p.t_start).getTime() < getCutoff().getTime()) {
      console.log('-- insert ignored, t_start too old');
      return;
    }
    setTask(p as TaskRow);
    return;
  }
  // only the comment, min_users, max_users can be updated
  const t = tasks.map.get(p.id);
  if (!t){
    return;
  }

  t.comment = p.comment;
  t.min_users = p.min_users;
  t.max_users = p.max_users;
}

const subscribeTasks = () => {
  ch = supabase.channel('tasks')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'tasks' },
    (payload) => {
      console.log('-- delete tasks', payload);
      const id = payload.old.id;
      const t = tasks.map.get(id);
      if (t){
        const jd = dateStrToJulian(t.t_start);
        const tset = groupsJDaysTasks.map.get(id2(t.group_id, jd.toString()));
        if (tset){
          tset.delete(id);
        }
      }
      tasks.map.delete(id);
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
      // only the comment, min_users, max_users can be updated
      const t = tasks.map.get(payload.new.id);
      if (!t){
        return;
      }
      // ?
      t.comment = payload.new.comment;
      t.min_users = payload.new.min_users;
      t.max_users = payload.new.max_users;
    }
  ).subscribe();
};

export const initTasks = async () => {
  await loadTasks();
  if (!ch){
    subscribeTasks();
  }
};

export const clearTasks = async () => {
  if (ch){
    supabase.removeChannel(ch);
    ch = null;
  }
  tasks.map.clear();
};

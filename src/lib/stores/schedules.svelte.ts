import type { Database } from '$lib/database';
import { timeToHM } from '$lib/func';
import { supabase } from '$lib/supabase';
import { SvelteMap } from 'svelte/reactivity';
import type { SyncEvent } from './sync-events.svelte';

type ScheduleRow = Database['public']['Tables']['task_schedules']['Row'];

export type Schedule = {
  group_id: string
  max_users: number | null
  min_users: number | null
  day_of_week: number
  hours_start: number
  minutes_start: number
  hours_end: number
  minutes_end: number
};

export const schedules = $state({
  map: new SvelteMap<string, Schedule>(),
});

const setSchedule = (d: ScheduleRow) => {
  const {hours: hours_start, minutes: minutes_start}
    = timeToHM(d.t_start);
  const {hours: hours_end, minutes: minutes_end}
    = timeToHM(d.t_end);
  const min_users = d.min_users;
  const max_users = d.max_users;
  const day_of_week = d.day_of_week;
  const group_id = d.group_id;

  schedules.map.set(d.id, {
    hours_start, minutes_start,
    hours_end, minutes_end,
    min_users, max_users,
    group_id, day_of_week
  });
};

export const loadSchedules = async () => {
  schedules.map.clear();

  const { data, error } = await supabase
    .from('task_schedules')
    .select('*')
    .order('day_of_week', {ascending: true})
    .order('t_start', {ascending: true});

  if (error) {
    throw error;
  }

  for (const d of data) {
    setSchedule(d);
  }
};

export const applyToSchedules = (evt: SyncEvent) => {
  loadSchedules();
};

export const clearSchedules = async () => {
  schedules.map.clear();
};

import { hmToTime } from "$lib/func";
import { supabase } from "$lib/supabase";

type InsertSchedule = {
  group_id:string,
  hours_start: number,
  minutes_start: number,
  hours_end: number,
  minutes_end: number,
  min_users: number|null,
  max_users: number|null,
  day_of_week: number
};

type UpdateSchedule = {
  id:string,
  min_users: number|null,
  max_users: number|null
};

export const insertSchedules = async (
  s: InsertSchedule
) => {
  const t_start = hmToTime(s.hours_start, s.minutes_start);
  const t_end = hmToTime(s.hours_end, s.minutes_end);

  const group_id = s.group_id;
  const min_users = s.min_users;
  const max_users = s.max_users;
  const day_of_week = s.day_of_week;

  const { error } = await supabase
    .from('task_schedules')
    .insert({group_id, t_start, t_end,
      min_users, max_users, day_of_week
    });

  if (error) {
    throw error;
  }
};

export const updateSchedules = async (
  s: UpdateSchedule
) => {
  const min_users = s.min_users;
  const max_users = s.max_users;
  const { error } = await supabase
    .from('task_schedules')
    .update({min_users, max_users})
    .eq('id', s.id);

  if (error) {
    throw error;
  }
};

export const deleteSchedules = async (id: string) => {
  const { error } = await supabase
    .from('task_schedules')
    .delete()
    .eq('id', id)

  if (error) {
    throw error;
  }
};

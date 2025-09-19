import { supabase } from "$lib/supabase";

type InsertTask = {
  group_id: string,
  schedule_id: string|null,
  t_start: string,
  t_end: string,
  min_users: number|null,
  max_users: number|null,
  comment: string|null
};

type UpdateTask = {
  id:string,
  min_users: number|null,
  max_users: number|null,
  comment: string|null
};

export const insertTasks = async (
  t: InsertTask
) => {
  const group_id = t.group_id;
  const schedule_id = t.schedule_id;
  const t_start = t.t_start;
  const t_end = t.t_end;
  const min_users = t.min_users;
  const max_users = t.max_users;
  const comment = t.comment;

  const [t_day] = t_start.split(' ');

  if (schedule_id){
    /**
     * check if a task already exists
     * for this day and schedule and
     * abort if true
     */

    const day_start = t_day + ' 00:00:00';
    const day_end = t_day + ' 23:59:59';

    const { data, error: err} = await supabase
      .from('tasks')
      .select('id')
      .eq('schedule_id', schedule_id)
      .eq('group_id', group_id)
      .gte('t_start', day_start)
      .lte('t_start', day_end);

    if (err) {
      throw err
    }

    if (data.length){
      console.log('already present task with schedule for ' + t_day);
      return;
    }
  }

  const { error } = await supabase
    .from('tasks')
    .insert({group_id, schedule_id,
      t_start, t_end,
      min_users, max_users, comment
    });

  if (error) {
    throw error;
  }

  console.log('insert task for ' + t_day);
};

export const updateTasks = async (
  t: UpdateTask
) => {
  const min_users = t.min_users;
  const max_users = t.max_users;
  const comment = t.comment;
  const { error } = await supabase
    .from('tasks')
    .update({min_users, max_users, comment})
    .eq('id', t.id);

  if (error) {
    throw error;
  }
};

export const deleteTasks = async (id: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    throw error;
  }
};

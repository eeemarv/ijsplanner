import { supabase } from "$lib/supabase";

type TasksUsers = {
  task_id: string,
  user_id: string,
};

export const insertTasksUsers = async (t: TasksUsers) => {
  const task_id = t.task_id;
  const user_id = t.user_id;
  const { error } = await supabase
    .from('tasks_users')
    .insert({task_id, user_id});

  if (error) {
    throw error;
  }
};

export const deleteTasksUsers = async (t: TasksUsers) => {
  const task_id = t.task_id;
  const user_id = t.user_id;
  const { error } = await supabase
    .from('tasks_users')
    .delete()
    .eq('task_id', task_id)
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }
};

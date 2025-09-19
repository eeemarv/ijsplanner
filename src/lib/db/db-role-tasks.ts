import { supabase } from "$lib/supabase";

type RoleTasks = {
  group_id: string,
  user_id: string
};

export const insertRoleTasks = async (v: RoleTasks) => {
  const group_id = v.group_id;
  const user_id = v.user_id;

  const { error } = await supabase
    .from('role_tasks')
    .insert({group_id, user_id});

  if (error) {
    throw error;
  }
};

export const deleteRoleTasks = async (v: RoleTasks) => {
  const group_id = v.group_id;
  const user_id = v.user_id;

  const { error } = await supabase
    .from('role_tasks')
    .delete()
    .eq('group_id', group_id)
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }
};

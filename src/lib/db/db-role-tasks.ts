import { supabase } from "$lib/supabase";

export const insertRoleTasks = async (group_id:string, user_id:string) => {
  const { error } = await supabase
    .from('role_manage_tasks')
    .insert({group_id, user_id});

  if (error) {
    throw error;
  }
};

export const deleteRoleTasks = async (group_id: string, user_id: string) => {
  const { error } = await supabase
    .from('role_manage_tasks')
    .delete()
    .eq('group_id', group_id)
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }
};

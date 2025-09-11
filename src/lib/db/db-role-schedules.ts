import { supabase } from "$lib/supabase";

export const insertRoleSchedules = async (group_id:string, user_id:string) => {
  const { error } = await supabase
    .from('role_manage_schedules')
    .insert({group_id, user_id});

  if (error) {
    throw error;
  }
};

export const deleteRoleSchedules = async (group_id: string, user_id: string) => {
  const { error } = await supabase
    .from('role_manage_schedules')
    .delete()
    .eq('group_id', group_id)
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }
};

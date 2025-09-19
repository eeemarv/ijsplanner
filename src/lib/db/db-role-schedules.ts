import { supabase } from "$lib/supabase";

type RoleSchedules = {
  group_id: string,
  user_id: string
};

export const insertRoleSchedules = async (v: RoleSchedules) => {
  const group_id = v.group_id;
  const user_id = v.user_id;

  const { error } = await supabase
    .from('role_schedules')
    .insert({group_id, user_id});

  if (error) {
    throw error;
  }
};

export const deleteRoleSchedules = async (v: RoleSchedules) => {
  const group_id = v.group_id;
  const user_id = v.user_id;

  const { error } = await supabase
    .from('role_schedules')
    .delete()
    .eq('group_id', group_id)
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }
};

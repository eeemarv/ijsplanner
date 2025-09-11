import { supabase } from "$lib/supabase";

export const insertUsersGroups = async (group_id:string, user_id:string) => {
  const { error } = await supabase
    .from('users_groups')
    .insert({group_id, user_id});

  if (error) {
    throw error;
  }
};

export const deleteUsersGroups = async (group_id: string, user_id: string) => {
  const { error } = await supabase
    .from('users_groups')
    .delete()
    .eq('group_id', group_id)
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }
};

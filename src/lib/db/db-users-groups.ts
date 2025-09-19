import { supabase } from "$lib/supabase";

type UsersGroups = {
  group_id: string,
  user_id: string
};

export const insertUsersGroups = async (v: UsersGroups) => {
  const group_id = v.group_id;
  const user_id = v.user_id;

  const { error } = await supabase
    .from('users_groups')
    .insert({group_id, user_id});

  if (error) {
    throw error;
  }
};

export const deleteUsersGroups = async (v: UsersGroups) => {
  const group_id = v.group_id;
  const user_id = v.user_id;

  const { error } = await supabase
    .from('users_groups')
    .delete()
    .eq('group_id', group_id)
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }
};

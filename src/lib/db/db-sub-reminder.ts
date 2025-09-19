import { supabase } from "$lib/supabase";

type SubReminder = {
  group_id: string,
  user_id: string
};

export const insertSubReminder = async (v: SubReminder) => {
  const group_id = v.group_id;
  const user_id = v.user_id;

  const { error } = await supabase
    .from('sub_reminder')
    .insert({group_id, user_id});

  if (error) {
    throw error;
  }
};

export const deleteSubReminder = async (v: SubReminder) => {
  const group_id = v.group_id;
  const user_id = v.user_id;

  const { error } = await supabase
    .from('sub_reminder')
    .delete()
    .eq('group_id', group_id)
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }
};

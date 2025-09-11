import { supabase } from "$lib/supabase";

export const insertSubReminder = async (group_id:string, user_id:string) => {
  const { error } = await supabase
    .from('sub_reminder')
    .insert({group_id, user_id});

  if (error) {
    throw error;
  }
};

export const deleteSubReminder = async (group_id: string, user_id: string) => {
  const { error } = await supabase
    .from('sub_reminder')
    .delete()
    .eq('group_id', group_id)
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }
};

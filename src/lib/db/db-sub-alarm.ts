import { supabase } from "$lib/supabase";

export const insertSubAlarm = async (group_id:string, user_id:string) => {
  const { error } = await supabase
    .from('sub_alarm')
    .insert({group_id, user_id});

  if (error) throw error;
};

export const deleteSubAlarm = async (group_id: string, user_id: string) => {
  const { error } = await supabase
    .from('sub_alarm')
    .delete()
    .eq('group_id', group_id)
    .eq('user_id', user_id);

  if (error) throw error;
};

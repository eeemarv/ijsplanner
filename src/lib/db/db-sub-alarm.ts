import { supabase } from "$lib/supabase";

type SubAlarm = {
  group_id: string,
  user_id: string
};

export const insertSubAlarm = async (v: SubAlarm) => {
  const group_id = v.group_id;
  const user_id = v.user_id;

  const { error } = await supabase
    .from('sub_alarm')
    .insert({group_id, user_id});

  if (error) {
    throw error;
  }
};

export const deleteSubAlarm = async (v: SubAlarm) => {
  const group_id = v.group_id;
  const user_id = v.user_id;

  const { error } = await supabase
    .from('sub_alarm')
    .delete()
    .eq('group_id', group_id)
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }
};

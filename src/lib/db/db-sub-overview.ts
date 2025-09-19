import { supabase } from "$lib/supabase";

type SubOverview = {
  group_id: string,
  user_id: string
};

export const insertSubOverview = async (v: SubOverview) => {
  const group_id = v.group_id;
  const user_id = v.user_id;

  const { error } = await supabase
    .from('sub_overview')
    .insert({group_id, user_id});

  if (error) {
    throw error;
  }
};

export const deleteSubOverview = async (v: SubOverview) => {
  const group_id = v.group_id;
  const user_id = v.user_id;

  const { error } = await supabase
    .from('sub_overview')
    .delete()
    .eq('group_id', group_id)
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }
};

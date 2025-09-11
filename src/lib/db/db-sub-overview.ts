import { supabase } from "$lib/supabase";

export const insertSubOverview = async (group_id:string, user_id:string) => {
  const { error } = await supabase
    .from('sub_overview')
    .insert({group_id, user_id});

  if (error) {
    throw error;
  }
};

export const deleteSubOverview = async (group_id: string, user_id: string) => {
  const { error } = await supabase
    .from('sub_overview')
    .delete()
    .eq('group_id', group_id)
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }
};

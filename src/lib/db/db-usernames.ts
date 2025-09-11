import { supabase } from "$lib/supabase";

export const updateUsername = async (user_id:string, username:string) => {
  const { error } = await supabase
    .from('usernames')
    .update({username})
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }
};

import { supabase } from "$lib/supabase";

type Usernames = {
  user_id:string,
  username: string
}

export const updateUsername = async (v:Usernames) => {
  const user_id = v.user_id;
  const username = v.username;
  const { error } = await supabase
    .from('usernames')
    .update({username})
    .eq('user_id', user_id);

  if (error) {
    throw error;
  }
};

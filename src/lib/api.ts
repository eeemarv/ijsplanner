import { supabase } from "$lib/supabase";


export const addUser = async (email: string, username: string) => {
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: JSON.stringify({ email, username }),
    headers: {
      'Authorization': `Bearer ${supabase.auth.getSession()?.access_token}`,
      'Content-Type': 'application/json'
    }
  });

};

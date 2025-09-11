import type { PageLoad } from './$types';
import { supabase } from '$lib/supabase';

export const load : PageLoad = async ({ params }) => {
  const { data, error } = await supabase.functions.invoke('get-user-email', {
    body: { user_id: params.user_id }
  });

  if (error) {
    return { email: null, error: error.message };
  }

  return { email: data.email, error: null };
};

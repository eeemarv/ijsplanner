import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';

export const session = writable<any>(null);

const init = async () => {
  // get initial session
  const { data } = await supabase.auth.getSession();
  session.set(data.session);

  // subscribe to changes (login, logout, refresh)
  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.set(newSession);
  });
}

init();

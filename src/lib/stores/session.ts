// not used


import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';

/*
export const session = $state({
  data: null
});
*/

export const session = writable<any>(null);

const init = async () => {
  const { data } = await supabase.auth.getSession();

  // refresh, login, logout
  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.set(newSession);
  });
}

init();

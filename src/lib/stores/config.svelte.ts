import { supabase } from '$lib/supabase';
import { SvelteMap } from 'svelte/reactivity';

export const config = $state({
  map: new SvelteMap<string, string>()
});

export const loadConfig = async () => {
  config.map.clear();

  const { data, error } = await supabase
    .from('config')
    .select('id, data');

  if (error) {
    throw error;
  }

  for (const d of data) {
    config.map.set(d.id, d.data);
  }
};

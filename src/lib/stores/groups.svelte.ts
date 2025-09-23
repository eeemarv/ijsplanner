import { supabase } from '$lib/supabase';
import { SvelteMap } from 'svelte/reactivity';

export const groups = $state({
  map: new SvelteMap<string, string>()
});

export const loadGroups = async () => {
  groups.map.clear();

  const { data, error } = await supabase
    .from('groups')
    .select('id, name')
    .order('created_at', {ascending: true});

  if (error) {
    throw error;
  }

  for (const d of data) {
    groups.map.set(d.id, d.name);
  }
};

export const clearGroups = async () => {
  groups.map.clear();
};

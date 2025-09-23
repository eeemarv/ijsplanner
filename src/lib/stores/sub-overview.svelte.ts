import { supabase } from '$lib/supabase';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';

export const subOverview = $state({
  set: new SvelteSet<string>()
});

export const loadSubOverview = async () => {
  subOverview.set.clear();

  const { data, error } = await supabase
    .from('sub_overview')
    .select('group_id, user_id');

  if (error) {
    throw error;
  }

  for (const d of data) {
    subOverview.set.add(id2(d.group_id, d.user_id));
  }
};

export const clearSubOverview = async () => {
  subOverview.set.clear();
};

import { supabase } from '$lib/supabase';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';

export const subReminder = $state({
  set: new SvelteSet<string>()
});

export const loadSubReminder = async () => {
  subReminder.set.clear();

  const { data, error } = await supabase
    .from('sub_reminder')
    .select('group_id, user_id');

  if (error) {
    throw error;
  }

  for (const d of data) {
    subReminder.set.add(id2(d.group_id, d.user_id));
  }
};

export const clearSubReminder = async () => {
  subReminder.set.clear();
};

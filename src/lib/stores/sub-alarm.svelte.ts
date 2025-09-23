import { supabase } from '$lib/supabase';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';

export const subAlarm = $state({
  set: new SvelteSet<string>()
});

export const loadSubAlarm = async () => {
  subAlarm.set.clear();

  const { data, error } = await supabase
    .from('sub_alarm')
    .select('group_id, user_id');

  if (error) {
    throw error;
  }

  for (const d of data) {
    subAlarm.set.add(id2(d.group_id, d.user_id));
  }
};

export const clearSubAlarm = async () => {
  subAlarm.set.clear();
};

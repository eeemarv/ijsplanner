import { supabase } from '$lib/supabase';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';

let ch: ReturnType<typeof supabase.channel> | null = null;

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

const subscribeSubAlarm = () => {
  ch = supabase.channel('sub-alarm')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'sub_alarm' },
    (payload) => {
      console.log('-- delete sub-alarm', payload);
      const group_id = payload.old.group_id;
      const user_id = payload.old.user_id;
      subAlarm.set.delete(id2(group_id, user_id));
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'sub_alarm' },
    (payload) => {
      console.log('-- insert sub-alarm', payload);
      const group_id = payload.new.group_id;
      const user_id = payload.new.user_id;
      subAlarm.set.add(id2(group_id, user_id));
    }
  ).subscribe();
};

export const initSubAlarm = async () => {
  await loadSubAlarm();
  if (!ch){
    subscribeSubAlarm();
  }
};

export const clearSubAlarm = async () => {
  if (ch){
    supabase.removeChannel(ch);
    ch = null;
  }
  subAlarm.set.clear();
};

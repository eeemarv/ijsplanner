import { supabase } from '$lib/supabase';
import { user } from './user';
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

user.subscribe(async ($user) => {
  if (!$user){
    subReminder.set.clear();
    return;
  }

  await loadSubReminder();
});

export const channelSubReminder = () => {
  const ch = supabase.channel('sub-reminder')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'sub_reminder' },
    (payload) => {
      console.log('-- delete sub-reminder', payload);
      const group_id = payload.old.group_id;
      const user_id = payload.old.user_id;
      subReminder.set.delete(id2(group_id, user_id));
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'sub_reminder' },
    (payload) => {
      console.log('-- insert sub-reminder', payload);
      const group_id = payload.new.group_id;
      const user_id = payload.new.user_id;
      subReminder.set.add(id2(group_id, user_id));
    }
  ).subscribe();
};

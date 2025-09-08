import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { user } from './user';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';

export const subReminderSet = writable<SvelteSet<string>>(new SvelteSet());

user.subscribe(async ($user) => {
  if (!$user){
    subReminderSet.set(new SvelteSet());
    return;
  }

  const sr = new SvelteSet<string>();

  const { data, error } = await supabase
    .from('sub_reminder')
    .select('group_id, user_id');

  if (error) {
    throw error;
  }

  for (const d of data) {
    sr.add(id2(d.group_id, d.user_id));
  }

  subReminderSet.set(sr);
});

export const channelSubReminderSet = () => {
  const ch = supabase.channel('sub-reminder')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'sub_reminder' },
    (payload) => {
      console.log('-- delete sub-reminder', payload);
      subReminderSet.update((su) => {
        const group_id = payload.old.group_id;
        const user_id = payload.old.user_id;
        su.delete(id2(group_id, user_id));
        return su;
      });
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'sub_reminder' },
    (payload) => {
      console.log('-- insert sub-reminder', payload);
      subReminderSet.update((su) => {
        const group_id = payload.new.group_id;
        const user_id = payload.new.user_id;
        if (group_id && user_id){
          su.add(id2(group_id, user_id));
        }
        return su;
      });
    }
  ).subscribe();
};

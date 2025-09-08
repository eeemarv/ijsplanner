import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { user } from './user';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';

export const subOverviewSet = writable<SvelteSet<string>>(new SvelteSet());

user.subscribe(async ($user)  => {
  if (!$user){
    subOverviewSet.set(new SvelteSet());
    return;
  }

  const so = new SvelteSet<string>();

  const { data, error } = await supabase
    .from('sub_overview')
    .select('group_id, user_id');

  if (error) {
    throw error;
  }

  for (const d of data) {
    so.add(id2(d.group_id, d.user_id));
  }

  subOverviewSet.set(so);
});

export const channelSubOverviewSet = () => {
  const ch = supabase.channel('sub-overview')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'sub_overview' },
    (payload) => {
      console.log('-- delete sub-overview', payload);
      subOverviewSet.update((su) => {
        const group_id = payload.old.group_id;
        const user_id = payload.old.user_id;
        su.delete(id2(group_id, user_id));
        return su;
      });
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'sub_overview' },
    (payload) => {
      console.log('-- insert sub-overview', payload);
      subOverviewSet.update((su) => {
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

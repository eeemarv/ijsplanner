import { supabase } from '$lib/supabase';
import { user } from './user';
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

user.subscribe(async ($user)  => {
  if (!$user){
    subOverview.set.clear();
    return;
  }

  await loadSubOverview();
});

export const channelSubOverview = () => {
  const ch = supabase.channel('sub-overview')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'sub_overview' },
    (payload) => {
      console.log('-- delete sub-overview', payload);
      const group_id = payload.old.group_id;
      const user_id = payload.old.user_id;
      subOverview.set.delete(id2(group_id, user_id));
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'sub_overview' },
    (payload) => {
      console.log('-- insert sub-overview', payload);
      const group_id = payload.new.group_id;
      const user_id = payload.new.user_id;
      subOverview.set.add(id2(group_id, user_id));
    }
  ).subscribe();
};

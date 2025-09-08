import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { user } from './user';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';
import { SvelteMap } from 'svelte/reactivity';

export const usersGroupsSet = writable<SvelteSet<string>>(new SvelteSet());
export const usersGroupsMap = writable<SvelteMap<string, SvelteSet<string>>>(new SvelteMap());

user.subscribe(async ($user) => {

  if (!$user){
    usersGroupsSet.set(new SvelteSet());
    usersGroupsMap.set(new SvelteMap());
    return;
  }

  const ugs = new SvelteSet<string>();
  const ugm = new SvelteMap<string, SvelteSet<string>>();

  const { data, error } = await supabase
    .from('users_groups')
    .select('user_id, group_id')
    .order('created_at', {ascending: true});

  if (error){
    throw error;
  }

  for (const d of data) {
    ugs.add(id2(d.group_id, d.user_id));
    const m = ugm.get(d.user_id);
    if (!m){
      ugm.set(d.user_id, new SvelteSet([d.group_id]));
      continue;
    }
    m.add(d.group_id);
  }

  usersGroupsSet.set(ugs);
  usersGroupsMap.set(ugm);
});

export const channelUsersGroupsSet = () => {
  const ch = supabase.channel('users-groups')
  ch.on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'users_groups' },
    (payload) => {
      console.log('-- delete users-groups', payload);
      usersGroupsSet.update((u) => {
        const user_id = payload.old.user_id;
        const group_id = payload.old.group_id;
        u.delete(id2(group_id, user_id));
        return u;
      });
      usersGroupsMap.update((m) => {
        const um = m.get(payload.old.user_id);
        if (!um){
          return m;
        }
        um.delete(payload.old.group_id);
        if (!um.size){
          // allow no empty Set()
          m.delete(payload.old.user_id);
        }
        return m;
      })
    }
  ).on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'users_groups' },
    (payload) => {
      console.log('-- insert users-groups', payload);
      usersGroupsSet.update((u) => {
        u.add(id2(payload.new.group_id, payload.new.user_id));
        return u;
      });
      usersGroupsMap.update((u) => {
        const user_id = payload.new.user_id;
        const group_id = payload.new.group_id;
        const um = u.get(user_id);
        if (!um){
          u.set(user_id, new SvelteSet([group_id]));
          return u;
        }
        um.add(group_id);
        return u;
      })
    }
  ).subscribe();
};

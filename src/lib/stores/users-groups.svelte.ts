import { supabase } from '$lib/supabase';
import { id2 } from '$lib/func';
import { SvelteSet } from 'svelte/reactivity';
import { SvelteMap } from 'svelte/reactivity';

let ch: ReturnType<typeof supabase.channel> | null = null;

export const usersGroups = $state({
  map: new SvelteMap<string,SvelteSet<string>>(),
  set: new SvelteSet<string>()
});

export const loadUsersGroups = async () => {
  const { data, error } = await supabase
    .from('users_groups')
    .select('user_id, group_id')
    .order('created_at', {ascending: true});

  if (error){
    throw error;
  }

  for (const d of data) {
    usersGroups.set.add(id2(d.group_id, d.user_id));
    const s = usersGroups.map.get(d.user_id);
    if (!s){
      usersGroups.map.set(d.user_id, new SvelteSet([d.group_id]));
      continue;
    }
    s.add(d.group_id);
  }
};

const subscribeUsersGroups = () => {
  ch = supabase.channel('users-groups')
  ch.on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'users_groups' },
    (payload) => {
      console.log('-- delete users-groups', payload);
      const user_id = payload.old.user_id;
      const group_id = payload.old.group_id;
      usersGroups.set.delete(id2(group_id, user_id));
      const s = usersGroups.map.get(user_id);
      if (!s){
        return;
      }
      s.delete(group_id);
      if (s.size){
        return;
      }
      usersGroups.map.delete(user_id);
    }
  ).on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'users_groups' },
    (payload) => {
      console.log('-- insert users-groups', payload);
      const user_id = payload.new.user_id;
      const group_id = payload.new.group_id;
      usersGroups.set.add(id2(group_id, user_id));
      const s = usersGroups.map.get(user_id);
      if (!s){
        usersGroups.map.set(user_id, new SvelteSet([group_id]));
        return;
      }
      s.add(group_id);
    }
  ).subscribe();
};

export const initUsersGroups = async () => {
  await loadUsersGroups();
  if (!ch){
    subscribeUsersGroups();
  }
};

export const clearUsersGroups = async () => {
  if (ch){
    supabase.removeChannel(ch);
    ch = null;
  }
  usersGroups.set.clear();
  usersGroups.map.clear();
};

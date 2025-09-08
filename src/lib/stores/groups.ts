import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { user } from './user';
import { SvelteMap } from 'svelte/reactivity';

export const groupsMap = writable<SvelteMap<string, string>>(new SvelteMap());
export const groupsRevMap = writable<SvelteMap<string, string>>(new SvelteMap());

user.subscribe(async ($user) => {
  if (!$user){
    groupsMap.set(new SvelteMap());
    groupsRevMap.set(new SvelteMap());
    return;
  }

  const g = new SvelteMap<string, string>();
  const r = new SvelteMap<string, string>();

  const { data, error } = await supabase
    .from('groups')
    .select('id, name')
    .order('created_at', {ascending: true});

  if (error) {
    throw error;
  }

  for (const d of data) {
    r.set(d.name, d.id);
    g.set(d.id, d.name);
  }

  groupsMap.set(g);
  groupsRevMap.set(r);
});

export const channelGroupsMap = () => {
  const ch = supabase.channel('groups')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'groups' },
    (payload) => {
      console.log('-- delete groups', payload);
      groupsMap.update((gu) => {
        gu.delete(payload.old.id);
        return gu;
      });

      groupsRevMap.update((ru) => {
        ru.delete(payload.old.name);
        return ru;
      });
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'groups' },
    (payload) => {
      console.log('-- insert groups', payload);
      groupsMap.update((gu) => {
        const name = payload.new.name;
        const id = payload.new.id;
        if (name && id){
          gu.set(id, name);
        }
        return gu;
      });

      groupsRevMap.update((ru) => {
        const id = payload.new.id;
        const name = payload.new.name;
        if (name && id){
          ru.set(name, id);
        }
        return ru;
      });
    }
  ).on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'groups' },
    (payload) => {
      console.log('-- update groups', payload);
      groupsMap.update((gu) => {
        const name = payload.new.name;
        const id = payload.new.id;
        if (name && id){
          gu.set(id, name);
        }
        return gu;
      });

      groupsRevMap.update((ru) => {
        const id = payload.new.id;
        const name = payload.new.name;
        if (name && id){
          ru.set(name, id);
        }
        return ru;
      });
    }
  ).subscribe();
};

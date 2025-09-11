import { supabase } from '$lib/supabase';
import { user } from './user';
import { SvelteMap } from 'svelte/reactivity';

export const groups = $state({
  map: new SvelteMap<string, string>(),
  rev: new SvelteMap<string, string>()
});

export const loadGroups = async () => {
  groups.map.clear();
  groups.rev.clear();

  const { data, error } = await supabase
    .from('groups')
    .select('id, name')
    .order('created_at', {ascending: true});

  if (error) {
    throw error;
  }

  for (const d of data) {
    groups.rev.set(d.name, d.id);
    groups.map.set(d.id, d.name);
  }
};

user.subscribe(async ($user) => {
  if (!$user){
    groups.map.clear();
    groups.rev.clear();
    return;
  }

  await loadGroups();
});

export const channelGroups = () => {
  const ch = supabase.channel('groups')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'groups' },
    (payload) => {
      console.log('-- delete groups', payload);
      groups.map.delete(payload.old.id);
      groups.rev.delete(payload.old.name);
    }
  ).on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'groups' },
    (payload) => {
      console.log('-- insert groups', payload);
      groups.map.set(payload.new.id, payload.new.name);
      groups.rev.set(payload.new.name, payload.new.id);
    }
  ).on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'groups' },
    (payload) => {
      console.log('-- update groups', payload);
      groups.map.set(payload.new.id, payload.new.name);
      groups.rev.set(payload.new.name, payload.new.id);
    }
  ).subscribe();
};

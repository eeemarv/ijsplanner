import { supabase } from '$lib/supabase';
import { SvelteMap } from 'svelte/reactivity';

let ch: ReturnType<typeof supabase.channel> | null = null;

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

const subscribeGroups = () => {
  ch = supabase.channel('groups')
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

export const initGroups = async () => {
  await loadGroups();
  if (!ch){
    subscribeGroups();
  }
};

export const clearGroups = async () => {
  if (ch){
    supabase.removeChannel(ch);
    ch = null;
  }
  groups.map.clear();
  groups.rev.clear();
};

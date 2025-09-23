import { supabase } from "$lib/supabase";
import type { SvelteMap, SvelteSet } from "svelte/reactivity";
import { roleSchedules } from "./role-schedules.svelte";
import { usernames } from "./usernames.svelte";
import { roleTasks } from "./role-tasks.svelte";
import { roleUsers } from "./role-users.svelte";
import { subOverview } from "./sub-overview.svelte";
import { subReminder } from "./sub-reminder.svelte";
import { subAlarm } from "./sub-alarm.svelte";
import { groups } from "./groups.svelte";
import { usersGroups } from "./users-groups.svelte";
import { applyToTasksUsers } from "./tasks-users.svelte";
import { applyToTasks } from "./tasks.svelte";
import { applyToSchedules } from "./schedules.svelte";

let chSyncEv: ReturnType<typeof supabase.channel> | null = null;
let syncInterval: ReturnType<typeof setInterval> | null = null;

export const sync = $state({
  seq: 0
});

export type SyncEvent = {
  seq: number;
  table_name: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  payload: any;
};

let pollCount = $state(0);

const applyToSet = (
  sset:SvelteSet<string>,
  evt: SyncEvent,
  keyField: string[]
) => {
  for (const k of keyField){
    if (!evt.payload[k]){
      const err = 'key ' + k + ' missing from payload';
      console.error(err);
      throw err;
    }
  }
  const key = keyField.map((k) => evt.payload[k]).join(':');
  if (evt.operation === 'DELETE') {
    sset.delete(key);
    return;
  }
  sset.add(key);
};

const applyToMap = (
  smap:SvelteMap<string, string>,
  evt: SyncEvent,
  keyField: string[],
  valueField: string
) => {
  for (const k of keyField){
    if (!evt.payload[k]){
      const err = 'key ' + k + ' missing from payload';
      console.error(err);
      throw err;
    }
  }
  const key = keyField.map((k) => evt.payload[k]).join(':');
  if (evt.operation === 'DELETE') {
    smap.delete(key);
    return;
  }
  if (!evt.payload[valueField]){
    const err = 'valueField ' + valueField + ' not in payload';
    console.error(err);
    throw err;
  }
  smap.set(key, evt.payload[valueField]);
};

// Dispatcher registry
const syncEventHandlers: Record<string, (evt: SyncEvent) => void> = {
  role_schedules: (evt) => applyToSet(roleSchedules.set, evt, ['group_id', 'user_id']),
  role_tasks: (evt) => applyToSet(roleTasks.set, evt, ['group_id', 'user_id']),
  role_users: (evt) => applyToSet(roleUsers.set, evt, ['user_id']),
  sub_overview: (evt) => applyToSet(subOverview.set, evt, ['group_id', 'user_id']),
  sub_reminder: (evt) => applyToSet(subReminder.set, evt, ['group_id', 'user_id']),
  sub_alarm: (evt) => applyToSet(subAlarm.set, evt, ['group_id', 'user_id']),
  users_groups: (evt) => applyToSet(usersGroups.set, evt, ['group_id', 'user_id']),
  groups: (evt) => applyToMap(groups.map, evt, ['id'], 'name'),
  usernames: (evt) => applyToMap(usernames.map, evt, ['user_id'], 'username'),
  tasks_users: (evt) => applyToTasksUsers(evt),
  tasks: (evt) => applyToTasks(evt),
  task_schedules: (evt) => applyToSchedules(evt),
};

const dispatchSyncEvent = (evt: SyncEvent) => {
  if (sync.seq >= evt.seq){
    console.log('seq ' + evt.seq + ' already processed');
    return;
  }
  if (!syncEventHandlers[evt.table_name]){
    throw 'no handler for table ' + evt.table_name;
  }
  syncEventHandlers[evt.table_name](evt);
  sync.seq = evt.seq;
};

const fetchSyncEvents = async () => {
  const { data, error } = await supabase
    .from('sync_events')
    .select('payload, seq, table_name, operation')
    .gt('seq', sync.seq)
    .order('seq', {ascending: true});

  if (error) {
    console.log(error);
    throw error;
  }

  console.log('poll ' + pollCount + ' f sync > ' + sync.seq, data );

  for (const d of data){
    const operation = d.operation as 'DELETE' | 'UPDATE' | 'INSERT';
    const evt: SyncEvent = {...d, operation};
    dispatchSyncEvent(evt);
  }
};

export const syncSeq = async () => {
  const { data, error } = await supabase
    .from('sync_events')
    .select('seq.max()')
    .single();

  if (error){
    throw error;
  }

  sync.seq = data.max;
};

export const initSyncEvents = () => {
  if (!chSyncEv){
    chSyncEv = supabase
    .channel('sync_events', {
      config: { private: true },
    })
    .on('broadcast', { event: 'INSERT' }, (payload) => {
      console.log('--sync-events--', payload);
      const p = payload.payload;
      if (!p){
        console.error('no payload');
        return;
      }
      const r = p.record;
      if (!r){
        console.error('no record defined');
        return;
      }
      if (!r.seq){
        console.error('no seq defined');
        return;
      }
      if (!r.operation){
        console.error('no operation defined');
        return;
      }
      if (!r.payload){
        console.error('no payload defined.');
        return;
      }
      if (!r.table_name){
        console.error('no table_name defined');
        return;
      }
      if (sync.seq >= r.seq){
        console.log('seq ' + r.seq + ' already processed');
        return;
      }
      if (sync.seq !== r.seq - 1){
        console.log('missing seq, fetching sync_events');
        fetchSyncEvents();
        return;
      }
      const evt: SyncEvent = {
        seq: r.seq,
        operation: r.operation,
        payload: r.payload,
        table_name: r.table_name
      };
      dispatchSyncEvent(evt);
    })
    .subscribe();
  }

  if (!syncInterval){
    syncInterval = setInterval(() => {
      fetchSyncEvents();
      pollCount++;
    }, 10_000);
  }
};

export const clearSyncEvents = async () => {
  if (chSyncEv){
    supabase.removeChannel(chSyncEv);
    chSyncEv = null;
  }
  if (syncInterval){
    clearInterval(syncInterval);
    syncInterval = null;
    pollCount = 0;
  }
  sync.seq = 0;
}
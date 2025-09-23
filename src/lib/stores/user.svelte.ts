import { goto } from '$app/navigation';
import { supabase } from '$lib/supabase';
import { clearGroups, loadGroups } from './groups.svelte';
import { clearRoleSchedules, loadRoleSchedules } from './role-schedules.svelte';
import { clearRoleTasks, loadRoleTasks } from './role-tasks.svelte';
import { clearRoleUsers, loadRoleUsers } from './role-users.svelte';
import { clearSchedules, loadSchedules } from './schedules.svelte';
import { clearSubAlarm, loadSubAlarm } from './sub-alarm.svelte';
import { clearSubOverview, loadSubOverview } from './sub-overview.svelte';
import { clearSubReminder, loadSubReminder } from './sub-reminder.svelte';
import { clearSyncEvents, initSyncEvents, sync, syncSeq } from './sync-events.svelte';
import { clearTasksUsers, loadTasksUsers } from './tasks-users.svelte';
import { clearTasks, loadTasks } from './tasks.svelte';
import { clearUsernames, loadUsernames, usernames } from './usernames.svelte';
import { clearUsersGroups, loadUsersGroups } from './users-groups.svelte';

export const user = $state<{id: null|string, email: null|string}>({
  id: null,
  email: null
});

let manualLogout = $state(false);
let initialized = $state(false);

export const userStatus = () => {
  if (!initialized){
    return false;
  }
  if (!user.id){
    return false;
  }
  return usernames.map.has(user.id);
};

export const initAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  user.id = session?.user?.id ?? null;
  user.email = session?.user?.email ?? null;

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
      manualLogout = false;
      if (sync.seq){
        return;
      }
      user.id = session?.user?.id ?? null;
      user.email = session?.user?.email ?? null;
      console.log('sign-in');
      if (initialized){
        console.log('-- already initialized --');
        return;
      }
      await supabase.realtime.setAuth();
      await syncSeq(); // current seq from sync_events

      Promise.all([
        loadRoleSchedules(),
        loadRoleTasks(),
        loadRoleUsers(),
        loadSubOverview(),
        loadSubReminder(),
        loadSubAlarm(),
        loadGroups(),
        loadUsernames(),
        loadUsersGroups(),
        loadSchedules(),
        loadTasksUsers(),
        loadTasks(),
      ]).then(() => {
        console.log('-- init data --');
        return initSyncEvents();
      }).then(() => {
        initialized = true;
        console.log('-- init sync-events --');
      }).catch((err) => {
        console.log(err);
      });
    }
    if (event === 'SIGNED_OUT') {
      user.id = null;
      user.email = null;
      initialized = false;
      if (manualLogout) {
      console.log('sign-out');
        //clearStores(); // only clear when real logout
        Promise.all([
          clearSyncEvents(),
          clearRoleSchedules(),
          clearRoleTasks(),
          clearRoleUsers(),
          clearSubOverview(),
          clearSubReminder(),
          clearSubAlarm(),
          clearGroups(),
          clearUsernames(),
          clearUsersGroups(),
          clearSchedules(),
          clearTasksUsers(),
          clearTasks(),
        ]).then(() => {
          console.log('-- clear data --');
          console.log('--user.id--', user.id);
          goto('/');
        }).catch((err) => {
          console.log(err);
        });;
      }
    }
  });
};

export const logout = async () => {
  manualLogout = true;
  const { error } = await supabase.auth.signOut({scope: 'local'});
  if (error){
    console.log(error);
  }
};

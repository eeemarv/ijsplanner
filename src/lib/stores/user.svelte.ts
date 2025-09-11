import { supabase } from '$lib/supabase';
import { clearGroups, initGroups } from './groups.svelte';
import { clearRoleSchedules, initRoleSchedules } from './role-schedules.svelte';
import { clearRoleTasks, initRoleTasks } from './role-tasks.svelte';
import { clearRoleUsers, initRoleUsers } from './role-users.svelte';
import { clearSubAlarm, initSubAlarm } from './sub-alarm.svelte';
import { clearSubOverview, initSubOverview } from './sub-overview.svelte';
import { clearSubReminder, initSubReminder } from './sub-reminder.svelte';
import { clearUsernames, initUsernames } from './usernames.svelte';
import { clearUsersGroups, initUsersGroups } from './users-groups.svelte';

export const user = $state<{id: null|string, email: null|string}>({
  id: null,
  email: null
});

let manualLogout = false;

export const initAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  user.id = session?.user?.id ?? null;
  user.email = session?.user?.email ?? null;

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      manualLogout = false;
      user.id = session?.user?.id ?? null;
      user.email = session?.user?.email ?? null;
      console.log('sign-in');
      Promise.all([
        initRoleSchedules(),
        initRoleTasks(),
        initRoleUsers(),
        initSubOverview(),
        initSubReminder(),
        initSubAlarm(),
        initGroups(),
        initUsernames(),
        initUsersGroups(),
      ]).then(() => {
        console.log('-- init --');
      }).catch((err) => {
        console.log(err);
      });
    }
    if (event === 'SIGNED_OUT') {
      user.id = null;
      user.email = null;
      if (manualLogout) {
      console.log('sign-out');
        //clearStores(); // only clear when real logout
        Promise.all([
          clearRoleSchedules(),
          clearRoleTasks(),
          clearRoleUsers(),
          clearSubOverview(),
          clearSubReminder(),
          clearSubAlarm(),
          clearGroups(),
          clearUsernames(),
          clearUsersGroups(),
        ]).then(() => {
          console.log('- clear -');
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

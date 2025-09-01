import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { user } from './user';
import { getChannel, releaseChannel } from './channel';

type UserData = {
  name: string;
  groups: Set<string>;
  roleManageUsers: boolean;
  roleManageSchedulesGroups: Set<string>;
  roleManageTasksGroups: Set<string>;
  subOverviewGroups: Set<string>;
  subReminderGroups: Set<string>;
  subAlarmGroups: Set<string>;
};

export const usersMap = writable<Map<string, UserData>>(new Map());

// get user data and watch changes
user.subscribe(async ($user) => {
  if ($user) {
    const u = new Map();

    const { data:dataA, error:errorA } = await supabase
      .from('usernames')
      .select('user_id, username');
    if (!errorA && dataA) {
      for (const d of dataA) {
        const uData = <UserData>{
          name: d.username,
          groups: new Set(),
          roleManageUsers: false,
          roleManageSchedulesGroups: new Set(),
          roleManageTasksGroups: new Set(),
          subOverviewGroups: new Set(),
          subReminderGroups: new Set(),
          subAlarmGroups: new Set(),
        };
        u.set(d.user_id, uData);
      }
    }

    usersMap.set(u);

    const { data:dataB, error:errorB } = await supabase
      .from('users_groups')
      .select('user_id, group_id');
    if (!errorB && dataB) {
      usersMap.update((u) => {
        for (const d of dataB) {
          const uOb = u.get(d.user_id);
          if (!uOb) {
            continue;
          }
          uOb.groups.add(d.group_id);
        }
        return u;
      });
    }

    const { data:dataC, error:errorC } = await supabase
      .from('role_manage_users')
      .select('user_id');
    if (!errorC && dataC) {
      usersMap.update((u) => {
        for (const d of dataC) {
          const uOb = u.get(d.user_id);
          if (!uOb){
            continue;
          }
          uOb.roleManageUsers = true;
        }
        return u;
      });
    }

    const { data:dataD, error:errorD } = await supabase
      .from('role_manage_schedules')
      .select('user_id, group_id');
    if (!errorD && dataD) {
      usersMap.update((u) => {
        for (const d of dataD) {
          const uOb = u.get(d.user_id);
          if (!uOb){
            continue;
          }
          uOb.roleManageSchedulesGroups.add(d.group_id);
        }
        return u;
      });
    }

    const { data:dataE, error:errorE } = await supabase
      .from('role_manage_tasks')
      .select('user_id, group_id');
    if (!errorE && dataE) {
      usersMap.update((u) => {
        for (const d of dataE) {
          const uOb = u.get(d.user_id);
          if (!uOb){
            continue;
          }
          uOb.roleManageTasksGroups.add(d.group_id);
        }
        return u;
      });
    }

    const { data:dataF, error:errorF } = await supabase
      .from('sub_tasks_overview')
      .select('user_id, group_id');
    if (!errorF && dataF) {
      usersMap.update((u) => {
        for (const d of dataF) {
          const uOb = u.get(d.user_id);
          if (!uOb){
            continue;
          }
          uOb.subOverviewGroups.add(d.group_id);
        }
        return u;
      });
    }

    const { data:dataG, error:errorG } = await supabase
      .from('sub_tasks_reminder')
      .select('user_id, group_id');
    if (!errorG && dataG) {
      usersMap.update((u) => {
        for (const d of dataG) {
          const uOb = u.get(d.user_id);
          if (!uOb){
            continue;
          }
          uOb.subReminderGroups.add(d.group_id);
        }
        return u;
      });
    }

    const { data:dataH, error:errorH } = await supabase
      .from('sub_tasks_alarm')
      .select('user_id, group_id');
    if (!errorH && dataH) {
      usersMap.update((u) => {
        for (const d of dataH) {
          const uOb = u.get(d.user_id);
          if (!uOb){
            continue;
          }
          uOb.subAlarmGroups.add(d.group_id);
        }
        return u;
      });
    }

    const ch = getChannel();

    ch.on('postgres_changes',
      { event: '*', schema: 'public', table: 'usernames' },
      (payload) => {
        usersMap.update((u) => {
          if (payload.eventType === 'DELETE') {
            u.delete(payload.old.user_id);
            return u;
          }

          const user_id = payload.new.user_id;
          const uOb = u.get(user_id);
          if (uOb){
             uOb.name = payload.new.username;
            return u;
          }

          const uData = <UserData>{
            name: payload.new.username,
            groups: new Set(),
            roleManageUsers: false,
            roleManageSchedulesGroups: new Set(),
            roleManageTasksGroups: new Set(),
            subOverviewGroups: new Set(),
            subReminderGroups: new Set(),
            subAlarmGroups: new Set(),
          };
          u.set(user_id, uData);

          return u;
        });
      }
    )
    .subscribe();

    ch.on('postgres_changes',
      { event: '*', schema: 'public', table: 'users_groups' },
      (payload) => {
        usersMap.update((u) => {
          if (payload.eventType === 'DELETE') {
            const user_id = payload.old.user_id;
            const uOb = u.get(user_id);
            if (uOb) {
              uOb.groups.delete(payload.old.group_id);
            }
            return u;
          }

          const user_id = payload.new.user_id;
          const uOb = u.get(user_id);
          if (uOb){
            uOb.groups.add(payload.new.group_id);
          }
          return u;
        });
      }
    )
    .subscribe();

    ch.on('postgres_changes',
      { event: '*', schema: 'public', table: 'role_manage_users' },
      (payload) => {
        usersMap.update((u) => {
          if (payload.eventType === 'DELETE') {
            const user_id = payload.old.user_id;
            const uOb = u.get(user_id);
            if (uOb){
              uOb.roleManageUsers = false;
            }
            return u;
          }

          const user_id = payload.new.user_id;
          const uOb = u.get(user_id);
          if (uOb){
            uOb.roleManageUsers = true;
          }
          return u;
        });
      }
    )
    .subscribe();

    ch.on('postgres_changes',
      { event: '*', schema: 'public', table: 'role_manage_schedules' },
      (payload) => {
        usersMap.update((u) => {
          if (payload.eventType === 'DELETE') {
            const user_id = payload.old.user_id;
            const uOb = u.get(user_id);
            if (uOb){
              uOb.roleManageSchedulesGroups.delete(payload.old.group_id);
            }
            return u;
          }

          const user_id = payload.new.user_id;
          const uOb = u.get(user_id);
          if (uOb){
            uOb.roleManageSchedulesGroups.add(payload.new.group_id);
          }
          return u;
        });
      }
    )
    .subscribe();

    ch.on('postgres_changes',
      { event: '*', schema: 'public', table: 'role_manage_tasks' },
      (payload) => {
        usersMap.update((u) => {
          if (payload.eventType === 'DELETE') {
            const user_id = payload.old.user_id;
            const uOb = u.get(user_id);
            if (uOb){
              uOb.roleManageTasksGroups.delete(payload.old.group_id);
            }
            return u;
          }

          const user_id = payload.new.user_id;
          const uOb = u.get(user_id);
          if (uOb){
            uOb.roleManageTasksGroups.add(payload.new.group_id);
          }
          return u;
        });
      }
    )
    .subscribe();

    ch.on('postgres_changes',
      { event: '*', schema: 'public', table: 'sub_tasks_overview' },
      (payload) => {
        usersMap.update((u) => {
          if (payload.eventType === 'DELETE') {
            const user_id = payload.old.user_id;
            const uOb = u.get(user_id);
            if (uOb){
              uOb.subOverviewGroups.delete(payload.old.group_id);
            }
            return u;
          }

          const user_id = payload.new.user_id;
          const uOb = u.get(user_id);
          if (uOb){
            uOb.subOverviewGroups.add(payload.new.group_id);
          }
          return u;
        });
      }
    )
    .subscribe();

    ch.on('postgres_changes',
      { event: '*', schema: 'public', table: 'sub_tasks_reminder' },
      (payload) => {
        usersMap.update((u) => {
          if (payload.eventType === 'DELETE') {
            const user_id = payload.old.user_id;
            const uOb = u.get(user_id);
            if (uOb){
              uOb.subReminderGroups.delete(payload.old.group_id);
            }
            return u;
          }

          const user_id = payload.new.user_id;
          const uOb = u.get(user_id);
          if (uOb){
            uOb.subReminderGroups.add(payload.new.group_id);
          }
          return u;
        });
      }
    )
    .subscribe();

    ch.on('postgres_changes',
      { event: '*', schema: 'public', table: 'sub_tasks_alarm' },
      (payload) => {
        usersMap.update((u) => {
          if (payload.eventType === 'DELETE') {
            const user_id = payload.old.user_id;
            const uOb = u.get(user_id);
            if (uOb){
              uOb.subAlarmGroups.delete(payload.old.group_id);
            }
            return u;
          }

          const user_id = payload.new.user_id;
          const uOb = u.get(user_id);
          if (uOb){
            uOb.subAlarmGroups.add(payload.new.group_id);
          }
          return u;
        });
      }
    )
    .subscribe();

  } else {
    releaseChannel();
    usersMap.set(new Map());
  }
});

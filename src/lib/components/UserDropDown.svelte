<script lang="ts">
  import { page } from "$app/state";
  import { id2 } from "$lib/func";
  import { groups } from "$lib/stores/groups.svelte";
  import { roleSchedules } from "$lib/stores/role-schedules.svelte";
  import { roleTasks } from "$lib/stores/role-tasks.svelte";
  import { roleUsers } from "$lib/stores/role-users.svelte";
  import { logout, user, userStatus } from "$lib/stores/user.svelte";
  import { usernames } from "$lib/stores/usernames.svelte";
  import { usersGroups } from "$lib/stores/users-groups.svelte";
  import { Bell, CalendarDays, CircleUser, LogOut, TableProperties, User, Users } from "lucide-svelte";

  let roleUsersEn = $derived(user.id && roleUsers.set.has(user.id));

  let roleSchedulesEn = $derived(groups.map.keys().find((group_id) => {
    if (!user.id){
      return false;
    }
    if (!usersGroups.set.has(id2(group_id, user.id))){
      return false;
    }
    if (user.id && roleSchedules.set.has(id2(group_id, user.id))){
      return true;
    }
    return false;
  }));

  let roleTasksEn = $derived(groups.map.keys().find((group_id) => {
    if (!user.id){
      return false;
    }
    if (!usersGroups.set.has(id2(group_id, user.id))){
      return false;
    }
    if (user.id && roleTasks.set.has(id2(group_id, user.id))){
      return true;
    }
    return false;
  }));

</script>

{#if userStatus()}

<div class="dropdown dropdown-end">
  <label tabindex="-1" class="btn m-1" for="user_dropdown">
    <User size="30" strokeWidth="2" />
    <span >
      {#if user.id && usernames.map.has(user.id)}
        { usernames.map.get(user.id) }
      {/if}
    </span>
  </label>
  <ul tabindex="-1" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52" id="user_dropdown">
    {#if roleUsersEn}
      <li>
        <a href="/mng-users"
          class={{
            'menu-active': page.url.pathname === '/mng-users'
          }}
        >
          <Users />
          Gebruikersbeheer
        </a>
      </li>
    {/if}
    {#if roleSchedulesEn}
      <li>
        <a href="/mng-schedules"
          class={{
            'menu-active': page.url.pathname === '/mng-schedules'
          }}
        >
          <TableProperties />
          Schema Beheer
        </a>
      </li>
    {/if}
    {#if roleTasksEn}
      <li>
        <a href="/mng-tasks"
          class={{
            'menu-active': page.url.pathname === '/mng-tasks'
          }}
        >
          <CalendarDays />
          Taken Beheer
        </a>
      </li>
    {/if}
    <li>
      <a href="/notifications"
        class={{
          'menu-active': page.url.pathname === '/notifications'
        }}
      >
        <Bell />
        Email Notificaties
      </a>
    </li>
    <li>
      <a href="/account"
        class={{
          'menu-active': page.url.pathname === '/account'
        }}
      >
        <CircleUser />
        Account Instellingen
      </a>
    </li>
    <li>
      <button onclick={logout}>
        <LogOut />
        Log uit
      </button>
    </li>
  </ul>
</div>

{/if}
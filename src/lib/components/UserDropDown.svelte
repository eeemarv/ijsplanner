<script lang="ts">
  import { page } from "$app/state";
  import { roleUsers } from "$lib/stores/role-users.svelte";
  import { logout, user } from "$lib/stores/user.svelte";
  import { usernames } from "$lib/stores/usernames.svelte";
  import { Bell, CircleUser, LogOut, User, Users } from "lucide-svelte";

</script>

<div class="dropdown dropdown-end">
  <label tabindex="-1" class="btn m-1" for="theme_dropdown" title="Vormgeving">
    <User size="30" strokeWidth="2" />
    {#if user.id && usernames.map.has(user.id)}
      { usernames.map.get(user.id) }
    {/if}
  </label>
  <ul tabindex="-1" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52" id="theme_dropdown">
    {#if user.id && roleUsers.set.has(user.id)}
      <li>
        <a href="/mng-users"
          class:menu-active={page.url.pathname === '/mng-users'}
        >
          <Users />
          Gebruikersbeheer
        </a>
      </li>
    {/if}

    <li>
      <a href="/notifications"
        class:menu-active={page.url.pathname === '/notifications'}
      >
        <Bell />
        Email Notificaties
      </a>
    </li>
    <li>
      <a href="/account"
        class:menu-active={page.url.pathname === '/account'}
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
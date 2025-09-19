<script lang="ts">
  import { navbar } from "$lib/state.svelte";
  import { user } from "$lib/stores/user.svelte";
  import ThemeDropDown from "./ThemeDropDown.svelte";
  import UserDropDown from "./UserDropDown.svelte";

</script>

<nav class="navbar bg-base-100 shadow-md fixed top-0 left-0 right-0 z-50">
  <div class="flex items-center gap-2">
    <a href="/{user.id ? 't' : ''}" class="flex items-center gap-2">
      <img src="/logo.svg" alt="Logo" class="w-10 h-10" />
      <span class="text-lg font-bold hidden sm:inline">IJsplanner</span>
    </a>
    {#if navbar.menu}
      {@render navbar.menu()}
    {/if}
  </div>

  <div class="flex items-center gap-2 ml-auto">
    {#if user.id}
      <UserDropDown />
    {/if}

    <ThemeDropDown />
  </div>
</nav>

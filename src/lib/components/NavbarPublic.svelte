<script lang="ts">
  import { user } from "$lib/stores/user.svelte";
  import ThemeDropDown from "./ThemeDropDown.svelte";
  import UserDropDown from "./UserDropDown.svelte";

  let isOpen = false;

</script>

<nav class="navbar bg-base-100 shadow-md">
  <div class="flex-1">
    <span class="normal-case text-xl">IJsplanner</span>
  </div>

  {#if false && user.id}
    <!-- When logged in -->
    <UserDropDown />
    <!--
    <div class="hidden md:flex">
      <ul class="menu menu-horizontal px-1">
        <li><a href="/tasks-m">tasks</a></li>

        <li><button onclick={handleSignOut}>Log uit</button></li>
      </ul>
    </div>
    -->

    <!-- Mobile Menu Button -->
    <div class="md:hidden">
      <button aria-label="menu" class="btn btn-ghost" onclick={() => (isOpen = !isOpen)}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  {/if}

  <ThemeDropDown />
</nav>

{#if user.id && isOpen}
  <ul class="menu bg-base-100 w-full p-2 rounded-box md:hidden">
    <li>
      <a href="/account">Instellingen
      </a>
    </li>

    <li>
      <a href="/logout">
        Log uit
      </a>
    </li>
  </ul>
{/if}

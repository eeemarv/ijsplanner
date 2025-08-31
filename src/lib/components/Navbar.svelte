<script>
    import ThemeDropDown from "./ThemeDropDown.svelte";

  export let user = null; // pass this from layout
  let isOpen = false;
</script>

<nav class="navbar bg-base-100 shadow-md">
  <div class="flex-1">
    <a href="/" class="btn btn-ghost normal-case text-xl">IJsplanner</a>
  </div>

  {#if user}
    <!-- When logged in -->
    <div class="hidden md:flex">
      <ul class="menu menu-horizontal px-1">
        <li><a href="/">Home</a></li>

        <li><a href="/logout">Log uit</a></li>
      </ul>
    </div>

    <!-- Mobile Menu Button -->
    <div class="md:hidden">
      <button aria-label="menu" class="btn btn-ghost" on:click={() => (isOpen = !isOpen)}>
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

{#if user && isOpen}
  <ul class="menu bg-base-100 w-full p-2 rounded-box md:hidden">
    <li><a href="/">Home</a></li>

    <li><a href="/logout">Log uit</a></li>
  </ul>
{/if}

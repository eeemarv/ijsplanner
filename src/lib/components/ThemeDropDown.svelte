<script lang="ts">
  import { theme, type Theme } from "$lib/stores/theme";
  import { Palette } from "lucide-svelte";

  const themes: Theme[] = [
    "auto", "light", "dark", "cupcake",
    "bumblebee", "emerald", "corporate",
    "synthwave", "retro", "cyberpunk",
    "valentine", "halloween", "garden",
    "forest", "aqua", "lofi",
    "pastel", "fantasy", "wireframe",
    "black", "luxury", "dracula",
    "cmyk", "autumn", "business",
    "acid", "lemonade", "night",
    "coffee", "winter", "dim",
    "nord", "sunset", "caramellatte",
    "abyss", "silk"
  ];
</script>

<div class="dropdown dropdown-end">
  <label tabindex="-1" class="btn m-1" for="theme_dropdown" title="Vormgeving">
    <Palette size="30" strokeWidth="2" />
  </label>
  <ul tabindex="-1" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52" id="theme_dropdown">
    {#each themes as t}
      <li
        class:font-bold={$theme === t}
        class:bg-slate-400={$theme === t}
      >
        <button on:click={() => $theme = t} >
          {t}
        </button>
      </li>
    {/each}
  </ul>
</div>

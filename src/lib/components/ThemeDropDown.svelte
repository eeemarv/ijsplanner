<script lang="ts">
  import { theme, type Theme } from "$lib/stores/theme";
  import { Palette } from "lucide-svelte";

  const themes: Theme[] = [
    "auto", "light", "dark", "cupcake",
    "retro", "valentine", "halloween",
    "luxury", "dracula",  "sunset",
    "caramellatte", "abyss", "night",
    "black", "forest"
  ];
</script>

<div class="dropdown dropdown-end">
  <label tabindex="-1" class="btn btn-sm sm:btn-md" for="theme_dropdown" title="Vormgeving">
    <Palette class="w-5 h-5 sm:w-6 sm:h-6" />
  </label>
  <ul tabindex="-1" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 overflow-y-auto max-h-50" id="theme_dropdown">
    {#each themes as t}
      <li
        class={{
          'font-bold': $theme === t,
          'bg-slate-400': $theme === t
        }}
      >
        <button onclick={() => $theme = t} >
          {t}
        </button>
      </li>
    {/each}
  </ul>
</div>

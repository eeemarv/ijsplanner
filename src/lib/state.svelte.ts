import type { Snippet } from "svelte";

export const navbar = $state<{menu : null | Snippet}>({
  menu: null
});
<script lang="ts">
    import { user } from "$lib/stores/user.svelte";

</script>

<div class="flex-1">
  <a href="/{user.id ? 't' : ''}" class="flex items-center gap-2">
    <img src="/logo.svg" alt="Logo" class="w-10 h-10" />
    <span class="text-lg font-bold">IJsplanner</span>
  </a>
</div>
<script lang="ts">
  import { type Schedule } from '$lib/stores/schedules.svelte';
  import { getTimeStr, weekDayNames } from '$lib/func';
  import { UsersRound, X } from 'lucide-svelte';

  let { s }:{s:Schedule} = $props();

</script>

<div>
  <div>
    <b>{weekDayNames[s.day_of_week]}</b>,
    <b>{getTimeStr(s.hours_start, s.minutes_start)}</b> -
    <b>{getTimeStr(s.hours_end, s.minutes_end)}</b>
  </div>
  <div>
    <UsersRound class="inline-block" size="18"/>
    Min:
      {#if s.min_users}
        {s.min_users}
      {:else}
        <X class="inline-block text-error" size="18" />
      {/if}
    Max:
      {#if s.max_users}
        {s.max_users}
      {:else}
        <X class="inline-block text-error" size="18" />
      {/if}
  </div>
</div>

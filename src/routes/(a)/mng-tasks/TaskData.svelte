<script lang="ts">
  import { getTimeStr, weekDayNames } from '$lib/func';
  import { tasks } from '$lib/stores/tasks.svelte';
  import { UsersRound, X } from 'lucide-svelte';

  let { task_id }:{task_id: string} = $props();

  let t = $derived(tasks.map.get(task_id));

  const dF = new Intl.DateTimeFormat("nl-NL",{
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });

  let dateStr = $derived.by(() => {
    if (!t){
      return '';
    }
    return dF.format(new Date(t.t_start + 'Z'));
  })
</script>

{#if t}
<div>
  <div>
    Commentaar:
    {#if t.comment}
      {t.comment}
    {:else}
      <X class="inline-block text-error" size="18" />
    {/if}
  </div>
  <div class="text-semibold">
    {dateStr}
  </div>
  <div>
    <b>{getTimeStr(t.hours_start, t.minutes_start)}</b> -
    <b>{getTimeStr(t.hours_end, t.minutes_end)}</b>
  </div>
  <div>
    <UsersRound class="inline-block" size="18"/>
    Min:
      {#if t.min_users}
        {t.min_users}
      {:else}
        <X class="inline-block text-error" size="18" />
      {/if}
    Max:
      {#if t.max_users}
        {t.max_users}
      {:else}
        <X class="inline-block text-error" size="18" />
      {/if}
  </div>
</div>
{/if}

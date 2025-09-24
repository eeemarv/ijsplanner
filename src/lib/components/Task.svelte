<script lang="ts">
  import { Circle, CircleCheck, CirclePlus, Plus } from "lucide-svelte";
  import { tasks, type Task } from "$lib/stores/tasks.svelte";
  import { tasksUsers } from "$lib/stores/tasks-users.svelte";
  import { usernames } from "$lib/stores/usernames.svelte";
  import { user } from "$lib/stores/user.svelte";

  let { task_id, btns } = $props();
  let t = $derived(tasks.map.get(task_id));
  let userIds = $derived([...tasksUsers.map.get(task_id) ?? []]);
  let complete = $derived(userIds.length >= (t?.min_users ?? 1));
  let atMax = $derived(!!t && t.max_users && t.max_users <= userIds.length);

</script>

{#snippet uBadge(t: Task)}
<div class={{
    'badge': true,
    'badge-error': !complete,
    'badge-success': complete
  }}
>
  {#if atMax}
    <Circle />
  {:else if t.min_users && userIds.length > t.min_users }
    <CirclePlus  />
  {:else if complete}
    <CircleCheck />
  {/if}
  {userIds.length}
  {#if t.min_users || t.max_users}
    /
    {#if t.min_users}
      {t.min_users}
      {#if t.max_users}
        - {t.max_users}
      {/if}
    {:else if t.max_users}
      + {t.max_users}
    {/if}
  {/if}
</div>
{/snippet}

{#snippet timeStr(t: Task)}
<span class="me-2">
  <b>
    {t.hours_start}u{t.minutes_start ? t.minutes_start.toString().padStart(2, '0') : ''}
    -
    {t.hours_end}u{t.minutes_end ? t.minutes_end.toString().padStart(2, '0') : ''}
  </b>
</span>
{/snippet}

{#snippet comment(t: Task)}
{#if t.comment}
  <span class="badge badge-primary w-full">
    <span class="card-title text-sm sm:text-base">
      {t.comment}
    </span>
  </span>
{/if}
{/snippet}

{#snippet usersList()}
  {#each userIds as user_id,i}
    {@const isUserSelf = user?.id && user.id === user_id}
    <div
      class={{
        'me-2': true,
        'badge': isUserSelf,
        'bg-base-100': isUserSelf,
        'badge-outline': isUserSelf,
      }}
    >
      {usernames.map.get(user_id)}
    </div>
  {/each}
{/snippet}

<div
  class={{
    'card': true,
    'border-2': true,
    'min-w-[150px]': true,
    'bg-base-100': true,
    'sm:min-w-[200px]': true,
    'my-2': true,
    'border-error': !complete,
    'border-success': complete
  }}
>
  <div class={{
    'bg-green-500/25': complete,
    'bg-red-500/25': !complete,
    'card-body': true,
    'p-2': true,
  }}>
    {#if t}
    <div class="flex justify-between">
      <div>
        {@render timeStr(t) }
      </div>
      <div>
        {@render uBadge(t)}
      </div>
    </div>
    {@render comment(t)}
    <div class="flex justify-between">
      <div>
        {@render usersList()}
      </div>
      <div>
        {@render btns?.(task_id)}
      </div>
    </div>
    {/if}
  </div>
</div>

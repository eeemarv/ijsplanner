<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { requireAuth } from '$lib/guards';

  let tasks: any[] = [];
  let me: any = null;
  let loading = true;
  let errorMsg = '';

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    me = session?.user ?? null;
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) errorMsg = error.message;
    tasks = data ?? [];
    loading = false;
  }

  async function claim(id: string) {
    await supabase.rpc('claim_task', { p_task_id: id });
    await load();
  }

  async function unclaim(id: string) {
    await supabase.rpc('unclaim_task', { p_task_id: id });
    await load();
  }

  onMount(async () => {
    await requireAuth();
    await load();
  });

</script>



<div class="p-4 max-w-3xl mx-auto">
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-2xl font-bold">Tasks</h1>
    <a class="btn" href="/admin">Admin</a>
  </div>

  {#if loading}
    <progress class="progress w-full"></progress>
  {/if}
  {#if errorMsg}
    <div class="alert alert-error">
      {errorMsg}
    </div>
  {/if}

  <ul class="space-y-3">
    {#each tasks as t}
      <li class="card bg-base-100 shadow">
        <div class="card-body">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="card-title">{t.title}</h2>
              {#if t.description}<p class="opacity-80">{t.description}</p>{/if}
              <p class="text-sm opacity-70">Assigned to: {t.assigned_to ?? '—'}</p>
            </div>
            <div class="card-actions">
              {#if !t.assigned_to}
                <button class="btn btn-primary" onclick={() => claim(t.id)}>Claim</button>
              {:else if t.assigned_to === me?.id}
                <button class="btn" onclick={() => unclaim(t.id)}>Unclaim</button>
              {:else}
                <button class="btn btn-disabled">Taken</button>
              {/if}
            </div>
          </div>
        </div>
      </li>
    {/each}
  </ul>
</div>

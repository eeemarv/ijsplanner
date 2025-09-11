<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { requireAuth, requireAdmin } from '$lib/guards';
  import { goto } from '$app/navigation';

  let title = '';
  let description = '';
  let tasks: any[] = [];
  let errorMsg = '';
  let loading = true;

  async function load() {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) errorMsg = error.message;
    tasks = data ?? [];
    loading = false;
  }

  async function createTask(e: Event) {
    e.preventDefault();
    const { error } = await supabase.from('tasks').insert({ title, description });
    if (error) errorMsg = error.message;
    else { title = ''; description = ''; await load(); }
  }

  onMount(async () => {
    await requireAuth();
    await requireAdmin();
    await load();
  });
</script>

<div class="p-4 max-w-3xl mx-auto">
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-2xl font-bold">Admin</h1>
    <button class="btn" onclick={async () => { await supabase.auth.signOut(); goto('/'); }}>Sign out</button>
  </div>

  <div class="card bg-base-100 shadow mb-6">
    <div class="card-body">
      <h2 class="card-title">Create task</h2>
      {#if errorMsg}<div class="alert alert-error">{errorMsg}</div>{/if}
      <form class="form-control gap-3" onsubmit={createTask}>
        <input class="input input-bordered" placeholder="Title" bind:value={title} required />
        <textarea class="textarea textarea-bordered" placeholder="Description" bind:value={description}></textarea>
        <button class="btn btn-primary">Add</button>
      </form>
    </div>
  </div>

  {#if loading}
    <progress class="progress w-full"></progress>
  {/if}

  <ul class="space-y-3">
    {#each tasks as t}
      <li class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="card-title">{t.title}</h3>
          {#if t.description}
          <p class="opacity-80">
            {t.description}
          </p>
          {/if}
        </div>
      </li>
    {/each}
  </ul>
</div>

<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import AuthCard from '$lib/components/AuthCard.svelte';

  let password = '';
  let loading = true;
  let errorMsg = '';
  let successMsg = '';

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    loading = false;
    if (!session) {
      errorMsg = 'Geen sessie data. Open de reset link opnieuw.';
    }
  });

  const setPassword = async (e: Event) => {
    e.preventDefault();
    errorMsg = '';
    successMsg = '';
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      errorMsg = error.message;
    } else {
      successMsg = 'Paswoord aangepast';
      setTimeout(() => goto('/'), 1200);
    }
  }
</script>

<AuthCard {errorMsg} {successMsg} {loading} title="Kies een nieuw paswoord">
  {#if !loading && !errorMsg && !successMsg}
    <form class="form-control" on:submit|preventDefault={setPassword}>
      <input class="input input-bordered w-full mb-2 placeholeder-info" type="password" placeholder="Nieuw paswoord" bind:value={password} required />
      <button class="btn btn-primary">
        Bewaar paswoord
      </button>
    </form>
  {/if}
  {#if errorMsg}
    <button class="btn btn-outline" on:click={() => errorMsg = ''}>
      Opnieuw
    </button>
  {/if}
  {#if successMsg}
    <a class="btn btn-outline" href="/">
      Naar login
    </a>
  {/if}
</AuthCard>

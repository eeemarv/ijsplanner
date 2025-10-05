<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import AuthCard from '$lib/components/AuthCard.svelte';

  let password = $state('');
  let loading = $state(true);
  let errorMsg = $state('');
  let successMsg = $state('');
  let disabled = $state(false);

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    loading = false;
    if (!session) {
      errorMsg = 'Geen sessie data. Open de reset link opnieuw.';
    }
  });

  const setPassword = async (e: Event) => {
    e.preventDefault();
    disabled = true;
    errorMsg = '';
    successMsg = '';
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      errorMsg = error.message;
      disabled = false;
    } else {
      successMsg = 'Paswoord aangepast';
      setTimeout(() => goto('/'), 1200);
    }
  }
</script>

<AuthCard {errorMsg} {successMsg} {loading} title="Kies een nieuw paswoord">
  {#if !loading && !errorMsg && !successMsg}
    <form class="form-control" onsubmit={setPassword}>
      <input
        class="input input-bordered w-full mb-2 placeholeder-info"
        type="password"
        placeholder="Nieuw paswoord"
        bind:value={password}
        required
        {disabled}
      />
      <button
        class="btn btn-primary"
        {disabled}
      >
        Bewaar paswoord
      </button>
    </form>
  {/if}
  {#if errorMsg}
    <button class="btn btn-outline" onclick={() => errorMsg = ''}>
      Opnieuw
    </button>
  {/if}
  {#if successMsg}
    <a class="btn btn-outline" href="/">
      Naar login
    </a>
  {/if}
</AuthCard>

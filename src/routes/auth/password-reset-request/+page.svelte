<script lang="ts">
  const appUrl = import.meta.env.VITE_PUBLIC_APP_URL;
  import AuthCard from '$lib/components/AuthCard.svelte';
  import { supabase } from '$lib/supabase';

  let email = '';
  let loading = false;
  let successMsg = '';
  let errorMsg = '';

  async function sendReset(e: Event) {
    e.preventDefault();
    loading = true;
    errorMsg = '';
    successMsg = '';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/password-reset`
    });
    loading = false;
    if (error) {
      errorMsg = error.message;
    } else {
      successMsg = 'Paswoord reset verzonden. Open je mailbox.';
    }
  }
</script>

<AuthCard {errorMsg} {successMsg} title="Paswoord Reset">
  {#if !successMsg}
    <form class="form-control" on:submit|preventDefault={sendReset}>
      <input class="input input-bordered w-full mb-2 placeholder-info" type="email" placeholder="Je email adres" bind:value={email} required />

      <button class="btn btn-outline" disabled={loading}>
        Stuur paswoord reset link
      </button>
    </form>
  {/if}
</AuthCard>

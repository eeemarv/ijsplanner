<script lang="ts">
  const appUrl = import.meta.env.VITE_PUBLIC_APP_URL;
  import AuthCard from '$lib/components/AuthCard.svelte';
  import { supabase } from '$lib/supabase';

  let email = $state('');
  let disabled = $state(false);
  let successMsg = $state('');
  let errorMsg = $state('');

  const sendReset = async (e: Event) => {
    e.preventDefault();
    disabled = true;
    errorMsg = '';
    successMsg = '';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/password-reset`
    });
    disabled = false;
    if (error) {
      errorMsg = error.message;
    } else {
      successMsg = 'Paswoord reset verzonden. Open je mailbox.';
    }
  }
</script>

<AuthCard {errorMsg} {successMsg} title="Paswoord Reset">
  {#if !successMsg}
    <form class="form-control" onsubmit={sendReset}>
      <label class="floating-label">
        <span>Je email adres</span>
        <input
          class="input input-bordered w-full mb-2 placeholder-info"
          type="email"
          placeholder="Je email adres"
          bind:value={email}
          required
          {disabled}
        />
      </label>
      <button
        class="btn btn-outline"
        {disabled}
      >
        Stuur paswoord reset link
      </button>
    </form>
  {/if}
</AuthCard>

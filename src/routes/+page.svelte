<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  import AuthCard from '$lib/components/AuthCard.svelte';

  let email = '';
  let password = '';
  let loading = false;
  let errorMsg = '';

  async function login(e: Event) {
    e.preventDefault();
    loading = true;
    errorMsg = '';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    loading = false;
    if (error) {
      errorMsg = error.message;
    } else {
      goto('/t');
    }
  }
</script>

<AuthCard {errorMsg} {loading} title="Login">
  <form class="form-control gap-3" on:submit|preventDefault={login}>
    <input
      class="input input-bordered w-full mb-2 placeholder-info"
      type="email"
      placeholder="Email"
      bind:value={email}
      required
    />

    <input
      class="input input-bordered w-full mb-2 placeholder-info"
      type="password"
      placeholder="Paswoord"
      bind:value={password}
      required
    />

    <p>
      <button class="btn btn-primary" disabled={loading}>
        Log in
      </button>
    </p>
  </form>

  <p class="pt-4">
    <a href="/auth/password-reset-request" class="link link-primary">
      Nog geen paswoord
      of paswoord vergeten?
    </a>
  </p>
</AuthCard>

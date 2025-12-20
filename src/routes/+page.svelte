<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  import AuthCard from '$lib/components/AuthCard.svelte';

  let email = '';
  let password = '';
  let loading = false;
  let errorMsg = '';

  function timeoutPromise<T>(p: Promise<T>, ms = 15000) {
    let timer: any;
    return Promise.race([
      p,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), ms);
      })
    ]).finally(() => clearTimeout(timer));
  }

  async function login(e: Event) {
    e.preventDefault();
    loading = true;
    errorMsg = '';

    try {
      const res = await timeoutPromise(
        supabase.auth.signInWithPassword({ email, password }),
        15000
      );
      const { error } = res as any;
      if (error) {
        errorMsg = error.message ?? 'Login failed';
      } else {
        goto('/tasks');
      }
    } catch (err: any) {
      console.error('login error', { err, ua: typeof navigator !== 'undefined' ? navigator.userAgent : 'ssr' });
      if (err?.message === 'timeout') {
        errorMsg = 'Login timed out — please check your connection and try again.';
      } else {
        errorMsg = err?.message ?? 'Login failed — please try again.';
      }
    } finally {
      loading = false;
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

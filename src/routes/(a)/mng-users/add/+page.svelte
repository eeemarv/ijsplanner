<script lang="ts">
  import { supabase } from "$lib/supabase";
  import { goto } from "$app/navigation";
  import { ChevronLeft, Plus, UserCheck } from "lucide-svelte";

  let disabled = $state(false);
  let email = $state('');
  let username = $state('');
  let successMsg = $state('');
  let errorMsg = $state('');

  const addUser = async (e: Event) => {
    e.preventDefault();
    disabled = true;
    console.log('ADD USER ');
    const { data, error } = await supabase.functions.invoke('add-user', {
      body: { email, username }
    });
    disabled = false;

    if (error){
      errorMsg = `${error}`;
      return;
    }

    setTimeout(() => {
      successMsg = '';
    }, 4000);
    successMsg = `Gebruiker ${username} met email ${email} toegevoegd.`;
    username = '';
    email = '';
    console.log('user_id', data.user_id);
  }
</script>

<div class="p-4">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl">
      <UserCheck class="inline-block" />
      Voeg Gebruiker Toe
    </h1>
    <button
      class="btn btn-info"
      onclick={() => goto('/mng-users')}
    >
      <ChevronLeft />
      Terug
    </button>
  </div>

  {#if successMsg}
    <div class="alert alert-success">
      {successMsg}
    </div>
  {/if}

  {#if errorMsg}
    <div class="alert alert-error">
      {errorMsg}
    </div>
  {/if}

  <form onsubmit={addUser} class="space-y-2">
    <div class="overflow-x-auto">
      <div class="p-4">
        <div class="mb-3">
          <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border">
            <legend class="fieldset-legend text-lg">
              Email
            </legend>
            <input type="email"
              {disabled}
              bind:value={email}
              class="input input-bordered invalid:border-error invalid:text-error w-full"
              required
            />
          </fieldset>
          <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border">
            <legend class="fieldset-legend text-lg">
              Naam
            </legend>
            <input type="text"
              {disabled}
              bind:value={username}
              class="input input-bordered invalid:border-error invalid:text-error w-full"
              required
              minlength="3"
            />
          </fieldset>
        </div>
        <button type="submit"
          class="btn btn-success"
          {disabled}
        >
          <Plus />
          Voeg toe
        </button>
      </div>
    </div>
  </form>
</div>

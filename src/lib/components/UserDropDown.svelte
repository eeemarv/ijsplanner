<script lang="ts">
  import { user } from "$lib/stores/user";
  import { usersMap } from "$lib/stores/usersMap";
  import { supabase } from "$lib/supabase";
  import { User } from "lucide-svelte";

  const handleSignOut = async () => {
    const {error} = await supabase.auth.signOut({ scope: 'local' });
    if (error){
      console.error(error);
    }
  }
</script>

<div class="dropdown dropdown-end">
  <label tabindex="-1" class="btn m-1" for="theme_dropdown" title="Vormgeving">
    <User size="30" strokeWidth="2" />
    {#if $user && $user.id && $usersMap.has($user.id)}
      { $usersMap.get($user.id)?.name }
    {/if}
  </label>
  <ul tabindex="-1" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52" id="theme_dropdown">
    <li>
      <button on:click={() => {}} >
        Something
      </button>
    </li>
    <li>
      <button on:click={handleSignOut}>
        Log uit
      </button>
    </li>
  </ul>
</div>
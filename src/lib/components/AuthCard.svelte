<script lang="ts">
  export let loading = false;
  export let errorMsg = '';
  export let successMsg = '';
  export let title = '';
</script>

<div class="min-h-screen flex items-center justify-center bg-neutral p-4">
  <div class="card w-full max-w-md shadow-xl bg-base-100">
    <div class="card-body">
      <h1 class="card-title justify-center">
        {title}
      </h1>

      {#if loading}
        <progress class="progress w-full"></progress>
      {/if}

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

      <slot />
    </div>
  </div>
</div>
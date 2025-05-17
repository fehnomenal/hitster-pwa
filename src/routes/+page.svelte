<script lang='ts'>
  import Scanner from '$lib/components/Scanner.svelte'

  let preview = $state<HTMLDivElement>(0 as never)
  let code = $state<string>()
</script>

{#if code === undefined}
  <Scanner
    {preview}
    onCode={(_code: string) => code = _code}
  />

  <div bind:this={preview}></div>
{:else}
  Scanned code: <code>{code}</code>

  <button onclick={() => code = undefined}>reset</button>
{/if}

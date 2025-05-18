<script lang='ts'>
  import Scanner from '$lib/components/Scanner.svelte'

  let preview = $state<HTMLDivElement>(0 as never)
  let code = $state<string>()
</script>

{#if code === undefined}
  <p class='text-center mb-6'>Please scan a QR code on a game card.</p>

  <div
    bind:this={preview}
    class='aspect-square [&>canvas]:hidden [&>video]:h-full [&>video]:object-cover [&>video]:b-rounded-10%'
  ></div>

  <Scanner
    {preview}
    onCode={(_code: string) => (code = _code)} />
{:else}
  Scanned code: <code class='c-blue'>{code}</code>

  <button onclick={() => (code = undefined)}>reset</button>
{/if}

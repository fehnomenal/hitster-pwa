<script lang='ts'>
  import Scanner from '$lib/components/Scanner.svelte'
  import { getCardVideoId } from '$lib/database.js'

  let preview = $state<HTMLDivElement>(null as never)
  let videoId = $state<string>()
  let scanErrorMsg = $state<string>()

  async function handleScannedCode(code: string) {
    const match = code.match(/\/([^/]+)\/([^/]+)$/)
    if (match) {
      try {
        const id = await getCardVideoId(match[1], match[2])

        videoId = id
        scanErrorMsg = undefined
      }
      catch (err) {
        if (err instanceof Error) {
          scanErrorMsg = err.message
        }
        else {
          scanErrorMsg = 'unknown error'
        }
      }
    }
  }
</script>

{#if videoId === undefined}
  <p class='text-center mb-6'>Please scan a QR code on a game card.</p>

  <div
    bind:this={preview}
    class='aspect-square [&>canvas]:hidden [&>video]:h-full [&>video]:object-cover [&>video]:b-rounded-10%'
  ></div>

  <Scanner
    {preview}
    onCode={handleScannedCode} />

  {#if scanErrorMsg !== undefined}
    <div class='mt-8 b b-red bg-red-1 p-5 b-rounded-md c-red-8'>
      <p>Could not scan the card:</p>
      <p>{scanErrorMsg}</p>
    </div>
  {/if}
{:else}
  VideoId: <code class='c-blue'>{videoId}</code>

  <button onclick={() => (videoId = undefined)}>reset</button>
{/if}

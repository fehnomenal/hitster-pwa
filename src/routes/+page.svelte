<script lang='ts'>
  import AudioPlayer from '$lib/components/AudioPlayer.svelte'
  import Button from '$lib/components/Button.svelte'
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
  <p class='text-center mb-6 text-lg'>Please scan a QR code on a game card.</p>

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
  {@const href = `https://youtube.com/watch?v=${videoId}`}

  <p class='text-center text-lg'>Playing the song.</p>
  <p class='text-center text-sm'>
    <a
      {href}
      target='_blank'
      rel='noreferrer'
      class='underline c-blue'>{href}</a>
  </p>

  <AudioPlayer {videoId} />

  <div class='aspect-video p-7'>
    <Button
      onclick={() => (videoId = undefined)}
      class='text-xl pb-5 h-full mx-auto'>
      <svg
        class='text-8xl'
        xmlns='http://www.w3.org/2000/svg'
        width='1em'
        height='1em'
        viewBox='0 0 24 24'>
        <path
          fill='currentColor'
          d='m7.825 13l5.6 5.6L12 20l-8-8l8-8l1.425 1.4l-5.6 5.6H20v2z' />
      </svg>

      Back to scan
    </Button>
  </div>
{/if}

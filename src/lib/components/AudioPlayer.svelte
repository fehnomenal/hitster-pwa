<script lang='ts'>
  import type { YouTubePlayer } from 'youtube-player/dist/types.js'
  import { onMount } from 'svelte'
  import createYtPlayer from 'youtube-player'
  import Button from './Button.svelte'

  interface Props {
    videoId: string
  }

  const { videoId }: Props = $props()

  let yt = $state<YouTubePlayer>(null as never)

  let showPlayButton = $state(false)

  onMount(() => {
    yt = createYtPlayer('player', {
      width: '0',
      height: '0',
      playerVars: {
        autoplay: 1,
        loop: 1,
        playsinline: 1,
      },
    })

    void yt.addEventListener('onAutoplayBlocked', () => {
      showPlayButton = true
    })

    void yt.addEventListener('onStateChange', (event) => {
      const state = (event as unknown as { data: number }).data

      showPlayButton = state !== 1
    })

    return async () => yt.destroy()
  })

  $effect(() => {
    void yt.loadVideoById(videoId).then(async () => yt.playVideo())
  })
</script>

<div id='player'></div>

<div class='aspect-video p-7'>
  {#if showPlayButton}
    <Button
      onclick={() => void yt.playVideo()}
      class='text-xl pb-5 h-full mx-auto'>
      <svg
        class='text-8xl'
        xmlns='http://www.w3.org/2000/svg'
        width='1em'
        height='1em'
        viewBox='0 0 24 24'>
        <path
          fill='currentColor'
          d='M8 19V5l11 7z' />
      </svg>

      Play song
    </Button>
  {/if}
</div>

<script lang='ts'>
  import type { LayoutProps } from './$types.js'

  const { children }: LayoutProps = $props()
</script>

<svelte:head>
  <title>QUZIC</title>

  <meta
    name='description'
    content='Can you guess the song played?' />
</svelte:head>

<div class='p-3'>
  <h1 class='grid mt-8 text-5xl justify-self-center font-bold grid-cols-[auto_min-content] mb-12'>
    QUZIC
  </h1>

  {@render children()}
</div>

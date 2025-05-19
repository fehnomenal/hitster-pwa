<script lang='ts'>
  import type { LayoutProps } from './$types.js'

  const { children }: LayoutProps = $props()
</script>

<svelte:head>
  <title>HITSTER PWA</title>

  <meta
    name='description'
    content='Play HITSTER in the browser and with YouTube!' />
</svelte:head>

<div class='p-3'>
  <h1 class='grid font-bold grid-cols-[auto_min-content] mb-12 mt-8'>
    <span class='text-5xl justify-self-center'>HITSTER</span>
    <span class='self-end text-xs'>PWA</span>
  </h1>

  {@render children()}
</div>

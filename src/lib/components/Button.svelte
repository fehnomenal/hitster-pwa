<script lang='ts'>
  import type { HTMLButtonAttributes } from 'svelte/elements'

  const { class: cls, children, ...props }: Omit<HTMLButtonAttributes, 'type'> = $props()
</script>

<button
  type='button'
  class='{cls} aspect-square b-rounded-3xl bg-gray-1 cursor-pointer grid items-center justify-center'
  {...props}
>
  {@render children?.()}
</button>

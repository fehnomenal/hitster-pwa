import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: ['src/lib/database/gamesets/*.ts'],

    stylistic: true,

    svelte: true,

    typescript: {
      tsconfigPath: 'tsconfig.json',
      filesTypeAware: ['**\/*.{svelte,ts}'],
      parserOptions: {
        extraFileExtensions: ['.svelte'],
      },
    },

    unocss: true,
  },

  {
    name: 'my-additional-svelte-rules',

    files: ['**/*.svelte'],

    rules: {
      'svelte/first-attribute-linebreak': 'error',

      'svelte/max-attributes-per-line': 'error',
    },
  },
)

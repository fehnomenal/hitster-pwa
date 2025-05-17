import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: ['static/gamesets/*.json'],

    stylistic: true,

    svelte: true,

    typescript: {
      tsconfigPath: 'tsconfig.json',
      filesTypeAware: ['**\/*.{svelte,ts}'],
      parserOptions: {
        extraFileExtensions: ['.svelte'],
      },
    },
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

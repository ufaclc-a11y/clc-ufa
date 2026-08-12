import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  globalIgnores([
    '**/.next/**',
    '**/.next-dev/**',
    '.claude/**',
    '.impeccable/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public/**',
    'temporary screenshots/**',
  ]),
])

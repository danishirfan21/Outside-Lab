import { defineConfig } from 'vitest/config';

// Domain tests do not need the React/PostCSS build pipeline.
export default defineConfig({ test: { environment: 'node', include: ['src/**/*.test.ts'] } });

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// import jsdom to not let tools report them as unused
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import jsdom from 'jsdom';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/__tests__/**/**/*.test.{ts,tsx}'],
  },
});

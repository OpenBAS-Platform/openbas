import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null;

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: 'tsx',
          jsx: 'automatic',
        });
      },
    },
    {
      name: 'asset-base-url',
      enforce: 'post',
      transform: (code) => {
        code = code.replace(/(?<!local)(\/src|~?@|\/@fs\/@)\/(.*?)\.(svg|png)/g, 'src/$2.$3');
        return {
          code,
          map: null,
        };
      },
    },
    react()
  ],

  publicDir: 'builder/public',
  resolve: {
    extensions: ['.js', '.tsx', '.mjs', '.js', '.mts', '.ts', '.jsx', '.json']
  },

  optimizeDeps: {
    include: [
      'ckeditor5-custom-build/build/ckeditor',
    ],
    esbuildOptions: {
      loader: {
        '.js': 'tsx',
        '.woff2': 'dataurl',
        '.ttf': 'dataurl',
        '.eot': 'dataurl',
      },
    },
  },

  server: {
    port: 3000,
    warmup: {
      clientFiles: [
        './src/components/i18n.js',
        './src/components/hooks.ts',
        './src/components/Zod.ts',
        './src/components/common/Transition.tsx',
        './src/resources/geo/countries.json'
      ]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
      '/logout': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
      '/saml2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      }
    }
  }
});

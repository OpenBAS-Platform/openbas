import { createLogger, defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = createLogger()
const loggerError = logger.error

logger.error = (msg, options) => {
  // Ignore jsx syntax error as it taken into account in a custom plugin
  if (msg.includes('The JSX syntax extension is not currently enabled')) return
  loggerError(msg, options)
}

const basePath = "";

const backProxy = {
  target: 'http://localhost:8080',
  changeOrigin: true,
  ws: true,
};

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ['chrome58'],
  },

  resolve: {
    extensions: ['.js', '.tsx', '.ts', '.jsx', '.json'],
  },

  optimizeDeps: {
    entries: [
      './src/**/*.{js,tsx,ts,jsx}'
    ],
    include: [
      'react-apexcharts',
      'react-leaflet',
      'react-final-form',
      'react-color',
      'react-csv',
      'final-form-arrays',
      'react-final-form-arrays',
      '@mui/lab',
      'react-dropzone',
      '@uiw/react-md-editor/nohighlight',
      'classnames',
      'mdi-material-ui',
      '@mui/styles',
      '@mui/icons-material',
      '@mui/material/colors',
      '@ckeditor/ckeditor5-react',
      'zod',
      'ckeditor5-custom-build/build/ckeditor',
    ],
  },

  customLogger: logger,

  plugins: [
    {
    name: 'html-transform',
    enforce: "pre",
    apply: 'serve',
    transformIndexHtml(html) {
      return html.replace(/%BASE_PATH%/g, basePath)
      .replace(/%APP_TITLE%/g, "OpenEx Dev")
      .replace(/%APP_DESCRIPTION%/g, "OpenEx Development platform")
      .replace(/%APP_FAVICON%/g, `${basePath}/src/static/ext/favicon.png`)
      .replace(/%APP_MANIFEST%/g, `${basePath}/src/static/ext/manifest.json`)
    }
    },
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
    react(),
  ],

  server: {
    port: 3000,
    warmup: {
      clientFiles: [
        // './src/components/i18n.js',
        // './src/components/hooks.ts',
        // './src/components/Zod.ts',
        // './src/components/common/Transition.tsx',
        // './src/resources/geo/countries.json',
      ],
    },
    proxy: {
      '/api': backProxy,
      '/login':  backProxy,
      '/logout':  backProxy,
      '/oauth2':  backProxy,
      '/saml2': backProxy,
    },
  },
});


 //  './src/public/Root',
      //  './src/private/Index',
      //  './src/admin/Index',
      //  './public/components/login/Login',
      //  './public/components/comcheck/Comcheck',
      //  './public/components/medias/Media',
      //  './public/components/challenges/Challenges',
      //  './public/components/lessons/Lessons',
      //  './admin/components/profile/Index',
      //  './admin/components/exercises/Exercises',
      //  './admin/components/players/Players',
      //  './admin/components/organizations/Organizations',
      //  './admin/components/documents/Documents',
      //  './admin/components/medias/Medias',
      //  './admin/components/medias/Index',
      //  './admin/components/integrations/Index',
      //  './admin/components/challenges/Challenges',
      //  './admin/components/lessons/LessonsTemplates',
      //  './admin/components/lessons/Index',
      //  './admin/components/settings/Index.tsx',
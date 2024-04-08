// vite.config.ts
import { createLogger, defineConfig, loadEnv, transformWithEsbuild } from "file:///C:/Users/JohanahLekeu/IdeaProjects/openex/openbas-front/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/JohanahLekeu/IdeaProjects/openex/openbas-front/node_modules/@vitejs/plugin-react/dist/index.mjs";
import IstanbulPlugin from "file:///C:/Users/JohanahLekeu/IdeaProjects/openex/openbas-front/node_modules/vite-plugin-istanbul/dist/index.mjs";
var logger = createLogger();
var loggerError = logger.error;
logger.error = (msg, options) => {
  if (msg.includes("The JSX syntax extension is not currently enabled"))
    return;
  loggerError(msg, options);
};
var basePath = "";
var backProxy = () => ({
  target: "http://localhost:8080",
  changeOrigin: true,
  ws: true
});
var vite_config_default = ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    build: {
      target: ["chrome58"]
    },
    resolve: {
      extensions: [".js", ".tsx", ".ts", ".jsx", ".json"]
    },
    optimizeDeps: {
      entries: [
        "./src/**/*.{js,tsx,ts,jsx}"
      ],
      include: [
        "react-apexcharts",
        "react-leaflet",
        "react-final-form",
        "react-color",
        "react-csv",
        "final-form-arrays",
        "react-final-form-arrays",
        "@mui/lab",
        "react-dropzone",
        "@uiw/react-md-editor/nohighlight",
        "classnames",
        "mdi-material-ui",
        "@mui/styles",
        "@mui/icons-material",
        "@mui/material/colors",
        "@mui/material/styles",
        "@mui/material/transitions",
        "@ckeditor/ckeditor5-react",
        "react-hook-form",
        "date-fns",
        "@hookform/resolvers/zod",
        "date-fns",
        "remark-gfm",
        "remark-parse",
        "zod",
        "ckeditor5-custom-build/build/ckeditor",
        "cronstrue",
        "cron-time-generator",
        "cron-parser"
      ]
    },
    customLogger: logger,
    plugins: [
      {
        name: "html-transform",
        enforce: "pre",
        apply: "serve",
        transformIndexHtml(html) {
          return html.replace(/%BASE_PATH%/g, basePath).replace(/%APP_TITLE%/g, "OpenBAS Dev").replace(/%APP_DESCRIPTION%/g, "OpenBAS Development platform").replace(/%APP_FAVICON%/g, `${basePath}/src/static/ext/favicon.png`).replace(/%APP_MANIFEST%/g, `${basePath}/src/static/ext/manifest.json`);
        }
      },
      {
        name: "treat-js-files-as-jsx",
        async transform(code, id) {
          if (!id.match(/src\/.*\.js$/))
            return null;
          return transformWithEsbuild(code, id, {
            loader: "jsx",
            jsx: "automatic"
          });
        }
      },
      react({ jsxRuntime: "classic" }),
      [IstanbulPlugin({
        include: "src/*",
        exclude: ["node_modules", "test/"],
        extension: [".js", ".jsx", ".ts", ".tsx"]
      })]
    ],
    server: {
      port: 3001,
      proxy: {
        "/api": backProxy(),
        "/login": backProxy(),
        "/logout": backProxy(),
        "/oauth2": backProxy(),
        "/saml2": backProxy()
      }
    }
  });
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKb2hhbmFoTGVrZXVcXFxcSWRlYVByb2plY3RzXFxcXG9wZW5leFxcXFxvcGVuYmFzLWZyb250XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKb2hhbmFoTGVrZXVcXFxcSWRlYVByb2plY3RzXFxcXG9wZW5leFxcXFxvcGVuYmFzLWZyb250XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9Kb2hhbmFoTGVrZXUvSWRlYVByb2plY3RzL29wZW5leC9vcGVuYmFzLWZyb250L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgY3JlYXRlTG9nZ2VyLCBkZWZpbmVDb25maWcsIGxvYWRFbnYsIHRyYW5zZm9ybVdpdGhFc2J1aWxkIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IElzdGFuYnVsUGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLWlzdGFuYnVsJztcblxuY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKCk7XG5jb25zdCBsb2dnZXJFcnJvciA9IGxvZ2dlci5lcnJvcjtcblxubG9nZ2VyLmVycm9yID0gKG1zZywgb3B0aW9ucykgPT4ge1xuICAvLyBJZ25vcmUganN4IHN5bnRheCBlcnJvciBhcyBpdCB0YWtlbiBpbnRvIGFjY291bnQgaW4gYSBjdXN0b20gcGx1Z2luXG4gIGlmIChtc2cuaW5jbHVkZXMoJ1RoZSBKU1ggc3ludGF4IGV4dGVuc2lvbiBpcyBub3QgY3VycmVudGx5IGVuYWJsZWQnKSkgcmV0dXJuO1xuICBsb2dnZXJFcnJvcihtc2csIG9wdGlvbnMpO1xufTtcblxuY29uc3QgYmFzZVBhdGggPSAnJztcblxuY29uc3QgYmFja1Byb3h5ID0gKCkgPT4gKHtcbiAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDgwJyxcbiAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICB3czogdHJ1ZSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoeyBtb2RlIH06IHsgbW9kZTogc3RyaW5nIH0pID0+IHtcbiAgcHJvY2Vzcy5lbnYgPSB7IC4uLnByb2Nlc3MuZW52LCAuLi5sb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpIH07XG5cbiAgLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbiAgcmV0dXJuIGRlZmluZUNvbmZpZyh7XG4gICAgYnVpbGQ6IHtcbiAgICAgIHRhcmdldDogWydjaHJvbWU1OCddLFxuICAgIH0sXG5cbiAgICByZXNvbHZlOiB7XG4gICAgICBleHRlbnNpb25zOiBbJy5qcycsICcudHN4JywgJy50cycsICcuanN4JywgJy5qc29uJ10sXG4gICAgfSxcblxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZW50cmllczogW1xuICAgICAgICAnLi9zcmMvKiovKi57anMsdHN4LHRzLGpzeH0nLFxuICAgICAgXSxcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgJ3JlYWN0LWFwZXhjaGFydHMnLFxuICAgICAgICAncmVhY3QtbGVhZmxldCcsXG4gICAgICAgICdyZWFjdC1maW5hbC1mb3JtJyxcbiAgICAgICAgJ3JlYWN0LWNvbG9yJyxcbiAgICAgICAgJ3JlYWN0LWNzdicsXG4gICAgICAgICdmaW5hbC1mb3JtLWFycmF5cycsXG4gICAgICAgICdyZWFjdC1maW5hbC1mb3JtLWFycmF5cycsXG4gICAgICAgICdAbXVpL2xhYicsXG4gICAgICAgICdyZWFjdC1kcm9wem9uZScsXG4gICAgICAgICdAdWl3L3JlYWN0LW1kLWVkaXRvci9ub2hpZ2hsaWdodCcsXG4gICAgICAgICdjbGFzc25hbWVzJyxcbiAgICAgICAgJ21kaS1tYXRlcmlhbC11aScsXG4gICAgICAgICdAbXVpL3N0eWxlcycsXG4gICAgICAgICdAbXVpL2ljb25zLW1hdGVyaWFsJyxcbiAgICAgICAgJ0BtdWkvbWF0ZXJpYWwvY29sb3JzJyxcbiAgICAgICAgJ0BtdWkvbWF0ZXJpYWwvc3R5bGVzJyxcbiAgICAgICAgJ0BtdWkvbWF0ZXJpYWwvdHJhbnNpdGlvbnMnLFxuICAgICAgICAnQGNrZWRpdG9yL2NrZWRpdG9yNS1yZWFjdCcsXG4gICAgICAgICdyZWFjdC1ob29rLWZvcm0nLFxuICAgICAgICAnZGF0ZS1mbnMnLFxuICAgICAgICAnQGhvb2tmb3JtL3Jlc29sdmVycy96b2QnLFxuICAgICAgICAnZGF0ZS1mbnMnLFxuICAgICAgICAncmVtYXJrLWdmbScsXG4gICAgICAgICdyZW1hcmstcGFyc2UnLFxuICAgICAgICAnem9kJyxcbiAgICAgICAgJ2NrZWRpdG9yNS1jdXN0b20tYnVpbGQvYnVpbGQvY2tlZGl0b3InLFxuICAgICAgICAnY3JvbnN0cnVlJyxcbiAgICAgICAgJ2Nyb24tdGltZS1nZW5lcmF0b3InLFxuICAgICAgICAnY3Jvbi1wYXJzZXInLFxuICAgICAgXSxcbiAgICB9LFxuXG4gICAgY3VzdG9tTG9nZ2VyOiBsb2dnZXIsXG5cbiAgICBwbHVnaW5zOiBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdodG1sLXRyYW5zZm9ybScsXG4gICAgICAgIGVuZm9yY2U6ICdwcmUnLFxuICAgICAgICBhcHBseTogJ3NlcnZlJyxcbiAgICAgICAgdHJhbnNmb3JtSW5kZXhIdG1sKGh0bWwpIHtcbiAgICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKC8lQkFTRV9QQVRIJS9nLCBiYXNlUGF0aClcbiAgICAgICAgICAgIC5yZXBsYWNlKC8lQVBQX1RJVExFJS9nLCAnT3BlbkJBUyBEZXYnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyVBUFBfREVTQ1JJUFRJT04lL2csICdPcGVuQkFTIERldmVsb3BtZW50IHBsYXRmb3JtJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8lQVBQX0ZBVklDT04lL2csIGAke2Jhc2VQYXRofS9zcmMvc3RhdGljL2V4dC9mYXZpY29uLnBuZ2ApXG4gICAgICAgICAgICAucmVwbGFjZSgvJUFQUF9NQU5JRkVTVCUvZywgYCR7YmFzZVBhdGh9L3NyYy9zdGF0aWMvZXh0L21hbmlmZXN0Lmpzb25gKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICd0cmVhdC1qcy1maWxlcy1hcy1qc3gnLFxuICAgICAgICBhc3luYyB0cmFuc2Zvcm0oY29kZSwgaWQpIHtcbiAgICAgICAgICBpZiAoIWlkLm1hdGNoKC9zcmNcXC8uKlxcLmpzJC8pKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAvLyBVc2UgdGhlIGV4cG9zZWQgdHJhbnNmb3JtIGZyb20gdml0ZSwgaW5zdGVhZCBvZiBkaXJlY3RseVxuICAgICAgICAgIC8vIHRyYW5zZm9ybWluZyB3aXRoIGVzYnVpbGRcbiAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtV2l0aEVzYnVpbGQoY29kZSwgaWQsIHtcbiAgICAgICAgICAgIGxvYWRlcjogJ2pzeCcsXG4gICAgICAgICAgICBqc3g6ICdhdXRvbWF0aWMnLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHJlYWN0KHsganN4UnVudGltZTogJ2NsYXNzaWMnIH0pLFxuICAgICAgW0lzdGFuYnVsUGx1Z2luKHtcbiAgICAgICAgaW5jbHVkZTogJ3NyYy8qJyxcbiAgICAgICAgZXhjbHVkZTogWydub2RlX21vZHVsZXMnLCAndGVzdC8nXSxcbiAgICAgICAgZXh0ZW5zaW9uOiBbJy5qcycsICcuanN4JywgJy50cycsICcudHN4J10sXG4gICAgICB9KV0sXG4gICAgXSxcblxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogMzAwMSxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgICcvYXBpJzogYmFja1Byb3h5KCksXG4gICAgICAgICcvbG9naW4nOiBiYWNrUHJveHkoKSxcbiAgICAgICAgJy9sb2dvdXQnOiBiYWNrUHJveHkoKSxcbiAgICAgICAgJy9vYXV0aDInOiBiYWNrUHJveHkoKSxcbiAgICAgICAgJy9zYW1sMic6IGJhY2tQcm94eSgpLFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbn07XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1XLFNBQVMsY0FBYyxjQUFjLFNBQVMsNEJBQTRCO0FBQzdhLE9BQU8sV0FBVztBQUNsQixPQUFPLG9CQUFvQjtBQUUzQixJQUFNLFNBQVMsYUFBYTtBQUM1QixJQUFNLGNBQWMsT0FBTztBQUUzQixPQUFPLFFBQVEsQ0FBQyxLQUFLLFlBQVk7QUFFL0IsTUFBSSxJQUFJLFNBQVMsbURBQW1EO0FBQUc7QUFDdkUsY0FBWSxLQUFLLE9BQU87QUFDMUI7QUFFQSxJQUFNLFdBQVc7QUFFakIsSUFBTSxZQUFZLE9BQU87QUFBQSxFQUN2QixRQUFRO0FBQUEsRUFDUixjQUFjO0FBQUEsRUFDZCxJQUFJO0FBQ047QUFFQSxJQUFPLHNCQUFRLENBQUMsRUFBRSxLQUFLLE1BQXdCO0FBQzdDLFVBQVEsTUFBTSxFQUFFLEdBQUcsUUFBUSxLQUFLLEdBQUcsUUFBUSxNQUFNLFFBQVEsSUFBSSxDQUFDLEVBQUU7QUFHaEUsU0FBTyxhQUFhO0FBQUEsSUFDbEIsT0FBTztBQUFBLE1BQ0wsUUFBUSxDQUFDLFVBQVU7QUFBQSxJQUNyQjtBQUFBLElBRUEsU0FBUztBQUFBLE1BQ1AsWUFBWSxDQUFDLE9BQU8sUUFBUSxPQUFPLFFBQVEsT0FBTztBQUFBLElBQ3BEO0FBQUEsSUFFQSxjQUFjO0FBQUEsTUFDWixTQUFTO0FBQUEsUUFDUDtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFFQSxjQUFjO0FBQUEsSUFFZCxTQUFTO0FBQUEsTUFDUDtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLFFBQ1QsT0FBTztBQUFBLFFBQ1AsbUJBQW1CLE1BQU07QUFDdkIsaUJBQU8sS0FBSyxRQUFRLGdCQUFnQixRQUFRLEVBQ3pDLFFBQVEsZ0JBQWdCLGFBQWEsRUFDckMsUUFBUSxzQkFBc0IsOEJBQThCLEVBQzVELFFBQVEsa0JBQWtCLEdBQUcsUUFBUSw2QkFBNkIsRUFDbEUsUUFBUSxtQkFBbUIsR0FBRyxRQUFRLCtCQUErQjtBQUFBLFFBQzFFO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLE1BQU0sVUFBVSxNQUFNLElBQUk7QUFDeEIsY0FBSSxDQUFDLEdBQUcsTUFBTSxjQUFjO0FBQUcsbUJBQU87QUFHdEMsaUJBQU8scUJBQXFCLE1BQU0sSUFBSTtBQUFBLFlBQ3BDLFFBQVE7QUFBQSxZQUNSLEtBQUs7QUFBQSxVQUNQLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLE1BQ0EsTUFBTSxFQUFFLFlBQVksVUFBVSxDQUFDO0FBQUEsTUFDL0IsQ0FBQyxlQUFlO0FBQUEsUUFDZCxTQUFTO0FBQUEsUUFDVCxTQUFTLENBQUMsZ0JBQWdCLE9BQU87QUFBQSxRQUNqQyxXQUFXLENBQUMsT0FBTyxRQUFRLE9BQU8sTUFBTTtBQUFBLE1BQzFDLENBQUMsQ0FBQztBQUFBLElBQ0o7QUFBQSxJQUVBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLFFBQVEsVUFBVTtBQUFBLFFBQ2xCLFVBQVUsVUFBVTtBQUFBLFFBQ3BCLFdBQVcsVUFBVTtBQUFBLFFBQ3JCLFdBQVcsVUFBVTtBQUFBLFFBQ3JCLFVBQVUsVUFBVTtBQUFBLE1BQ3RCO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUNIOyIsCiAgIm5hbWVzIjogW10KfQo=

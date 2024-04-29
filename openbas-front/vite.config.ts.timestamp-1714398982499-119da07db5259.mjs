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
      target: ["chrome58"],
      sourcemap: true
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
        "@microsoft/fetch-event-source"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKb2hhbmFoTGVrZXVcXFxcSWRlYVByb2plY3RzXFxcXG9wZW5leFxcXFxvcGVuYmFzLWZyb250XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKb2hhbmFoTGVrZXVcXFxcSWRlYVByb2plY3RzXFxcXG9wZW5leFxcXFxvcGVuYmFzLWZyb250XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9Kb2hhbmFoTGVrZXUvSWRlYVByb2plY3RzL29wZW5leC9vcGVuYmFzLWZyb250L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgY3JlYXRlTG9nZ2VyLCBkZWZpbmVDb25maWcsIGxvYWRFbnYsIHRyYW5zZm9ybVdpdGhFc2J1aWxkIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IElzdGFuYnVsUGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLWlzdGFuYnVsJztcblxuY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKCk7XG5jb25zdCBsb2dnZXJFcnJvciA9IGxvZ2dlci5lcnJvcjtcblxubG9nZ2VyLmVycm9yID0gKG1zZywgb3B0aW9ucykgPT4ge1xuICAvLyBJZ25vcmUganN4IHN5bnRheCBlcnJvciBhcyBpdCB0YWtlbiBpbnRvIGFjY291bnQgaW4gYSBjdXN0b20gcGx1Z2luXG4gIGlmIChtc2cuaW5jbHVkZXMoJ1RoZSBKU1ggc3ludGF4IGV4dGVuc2lvbiBpcyBub3QgY3VycmVudGx5IGVuYWJsZWQnKSkgcmV0dXJuO1xuICBsb2dnZXJFcnJvcihtc2csIG9wdGlvbnMpO1xufTtcblxuY29uc3QgYmFzZVBhdGggPSAnJztcblxuY29uc3QgYmFja1Byb3h5ID0gKCkgPT4gKHtcbiAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDgwJyxcbiAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICB3czogdHJ1ZSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoeyBtb2RlIH06IHsgbW9kZTogc3RyaW5nIH0pID0+IHtcbiAgcHJvY2Vzcy5lbnYgPSB7IC4uLnByb2Nlc3MuZW52LCAuLi5sb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpIH07XG5cbiAgLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbiAgcmV0dXJuIGRlZmluZUNvbmZpZyh7XG4gICAgYnVpbGQ6IHtcbiAgICAgIHRhcmdldDogWydjaHJvbWU1OCddLFxuICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgIH0sXG5cbiAgICByZXNvbHZlOiB7XG4gICAgICBleHRlbnNpb25zOiBbJy5qcycsICcudHN4JywgJy50cycsICcuanN4JywgJy5qc29uJ10sXG4gICAgfSxcblxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZW50cmllczogW1xuICAgICAgICAnLi9zcmMvKiovKi57anMsdHN4LHRzLGpzeH0nLFxuICAgICAgXSxcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgJ3JlYWN0LWFwZXhjaGFydHMnLFxuICAgICAgICAncmVhY3QtbGVhZmxldCcsXG4gICAgICAgICdyZWFjdC1maW5hbC1mb3JtJyxcbiAgICAgICAgJ3JlYWN0LWNvbG9yJyxcbiAgICAgICAgJ3JlYWN0LWNzdicsXG4gICAgICAgICdmaW5hbC1mb3JtLWFycmF5cycsXG4gICAgICAgICdyZWFjdC1maW5hbC1mb3JtLWFycmF5cycsXG4gICAgICAgICdAbXVpL2xhYicsXG4gICAgICAgICdyZWFjdC1kcm9wem9uZScsXG4gICAgICAgICdAdWl3L3JlYWN0LW1kLWVkaXRvci9ub2hpZ2hsaWdodCcsXG4gICAgICAgICdjbGFzc25hbWVzJyxcbiAgICAgICAgJ21kaS1tYXRlcmlhbC11aScsXG4gICAgICAgICdAbXVpL3N0eWxlcycsXG4gICAgICAgICdAbXVpL2ljb25zLW1hdGVyaWFsJyxcbiAgICAgICAgJ0BtdWkvbWF0ZXJpYWwvY29sb3JzJyxcbiAgICAgICAgJ0BtdWkvbWF0ZXJpYWwvc3R5bGVzJyxcbiAgICAgICAgJ0BtdWkvbWF0ZXJpYWwvdHJhbnNpdGlvbnMnLFxuICAgICAgICAnQGNrZWRpdG9yL2NrZWRpdG9yNS1yZWFjdCcsXG4gICAgICAgICdyZWFjdC1ob29rLWZvcm0nLFxuICAgICAgICAnZGF0ZS1mbnMnLFxuICAgICAgICAnQGhvb2tmb3JtL3Jlc29sdmVycy96b2QnLFxuICAgICAgICAnZGF0ZS1mbnMnLFxuICAgICAgICAncmVtYXJrLWdmbScsXG4gICAgICAgICdyZW1hcmstcGFyc2UnLFxuICAgICAgICAnem9kJyxcbiAgICAgICAgJ2NrZWRpdG9yNS1jdXN0b20tYnVpbGQvYnVpbGQvY2tlZGl0b3InLFxuICAgICAgICAnY3JvbnN0cnVlJyxcbiAgICAgICAgJ0BtaWNyb3NvZnQvZmV0Y2gtZXZlbnQtc291cmNlJyxcbiAgICAgIF0sXG4gICAgfSxcblxuICAgIGN1c3RvbUxvZ2dlcjogbG9nZ2VyLFxuXG4gICAgcGx1Z2luczogW1xuICAgICAge1xuICAgICAgICBuYW1lOiAnaHRtbC10cmFuc2Zvcm0nLFxuICAgICAgICBlbmZvcmNlOiAncHJlJyxcbiAgICAgICAgYXBwbHk6ICdzZXJ2ZScsXG4gICAgICAgIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XG4gICAgICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZSgvJUJBU0VfUEFUSCUvZywgYmFzZVBhdGgpXG4gICAgICAgICAgICAucmVwbGFjZSgvJUFQUF9USVRMRSUvZywgJ09wZW5CQVMgRGV2JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8lQVBQX0RFU0NSSVBUSU9OJS9nLCAnT3BlbkJBUyBEZXZlbG9wbWVudCBwbGF0Zm9ybScpXG4gICAgICAgICAgICAucmVwbGFjZSgvJUFQUF9GQVZJQ09OJS9nLCBgJHtiYXNlUGF0aH0vc3JjL3N0YXRpYy9leHQvZmF2aWNvbi5wbmdgKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyVBUFBfTUFOSUZFU1QlL2csIGAke2Jhc2VQYXRofS9zcmMvc3RhdGljL2V4dC9tYW5pZmVzdC5qc29uYCk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAndHJlYXQtanMtZmlsZXMtYXMtanN4JyxcbiAgICAgICAgYXN5bmMgdHJhbnNmb3JtKGNvZGUsIGlkKSB7XG4gICAgICAgICAgaWYgKCFpZC5tYXRjaCgvc3JjXFwvLipcXC5qcyQvKSkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgLy8gVXNlIHRoZSBleHBvc2VkIHRyYW5zZm9ybSBmcm9tIHZpdGUsIGluc3RlYWQgb2YgZGlyZWN0bHlcbiAgICAgICAgICAvLyB0cmFuc2Zvcm1pbmcgd2l0aCBlc2J1aWxkXG4gICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybVdpdGhFc2J1aWxkKGNvZGUsIGlkLCB7XG4gICAgICAgICAgICBsb2FkZXI6ICdqc3gnLFxuICAgICAgICAgICAganN4OiAnYXV0b21hdGljJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICByZWFjdCh7IGpzeFJ1bnRpbWU6ICdjbGFzc2ljJyB9KSxcbiAgICAgIFtJc3RhbmJ1bFBsdWdpbih7XG4gICAgICAgIGluY2x1ZGU6ICdzcmMvKicsXG4gICAgICAgIGV4Y2x1ZGU6IFsnbm9kZV9tb2R1bGVzJywgJ3Rlc3QvJ10sXG4gICAgICAgIGV4dGVuc2lvbjogWycuanMnLCAnLmpzeCcsICcudHMnLCAnLnRzeCddLFxuICAgICAgfSldLFxuICAgIF0sXG5cbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHBvcnQ6IDMwMDEsXG4gICAgICBwcm94eToge1xuICAgICAgICAnL2FwaSc6IGJhY2tQcm94eSgpLFxuICAgICAgICAnL2xvZ2luJzogYmFja1Byb3h5KCksXG4gICAgICAgICcvbG9nb3V0JzogYmFja1Byb3h5KCksXG4gICAgICAgICcvb2F1dGgyJzogYmFja1Byb3h5KCksXG4gICAgICAgICcvc2FtbDInOiBiYWNrUHJveHkoKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVyxTQUFTLGNBQWMsY0FBYyxTQUFTLDRCQUE0QjtBQUM3YSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxvQkFBb0I7QUFFM0IsSUFBTSxTQUFTLGFBQWE7QUFDNUIsSUFBTSxjQUFjLE9BQU87QUFFM0IsT0FBTyxRQUFRLENBQUMsS0FBSyxZQUFZO0FBRS9CLE1BQUksSUFBSSxTQUFTLG1EQUFtRDtBQUFHO0FBQ3ZFLGNBQVksS0FBSyxPQUFPO0FBQzFCO0FBRUEsSUFBTSxXQUFXO0FBRWpCLElBQU0sWUFBWSxPQUFPO0FBQUEsRUFDdkIsUUFBUTtBQUFBLEVBQ1IsY0FBYztBQUFBLEVBQ2QsSUFBSTtBQUNOO0FBRUEsSUFBTyxzQkFBUSxDQUFDLEVBQUUsS0FBSyxNQUF3QjtBQUM3QyxVQUFRLE1BQU0sRUFBRSxHQUFHLFFBQVEsS0FBSyxHQUFHLFFBQVEsTUFBTSxRQUFRLElBQUksQ0FBQyxFQUFFO0FBR2hFLFNBQU8sYUFBYTtBQUFBLElBQ2xCLE9BQU87QUFBQSxNQUNMLFFBQVEsQ0FBQyxVQUFVO0FBQUEsTUFDbkIsV0FBVztBQUFBLElBQ2I7QUFBQSxJQUVBLFNBQVM7QUFBQSxNQUNQLFlBQVksQ0FBQyxPQUFPLFFBQVEsT0FBTyxRQUFRLE9BQU87QUFBQSxJQUNwRDtBQUFBLElBRUEsY0FBYztBQUFBLE1BQ1osU0FBUztBQUFBLFFBQ1A7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFFQSxjQUFjO0FBQUEsSUFFZCxTQUFTO0FBQUEsTUFDUDtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLFFBQ1QsT0FBTztBQUFBLFFBQ1AsbUJBQW1CLE1BQU07QUFDdkIsaUJBQU8sS0FBSyxRQUFRLGdCQUFnQixRQUFRLEVBQ3pDLFFBQVEsZ0JBQWdCLGFBQWEsRUFDckMsUUFBUSxzQkFBc0IsOEJBQThCLEVBQzVELFFBQVEsa0JBQWtCLEdBQUcsUUFBUSw2QkFBNkIsRUFDbEUsUUFBUSxtQkFBbUIsR0FBRyxRQUFRLCtCQUErQjtBQUFBLFFBQzFFO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLE1BQU0sVUFBVSxNQUFNLElBQUk7QUFDeEIsY0FBSSxDQUFDLEdBQUcsTUFBTSxjQUFjO0FBQUcsbUJBQU87QUFHdEMsaUJBQU8scUJBQXFCLE1BQU0sSUFBSTtBQUFBLFlBQ3BDLFFBQVE7QUFBQSxZQUNSLEtBQUs7QUFBQSxVQUNQLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLE1BQ0EsTUFBTSxFQUFFLFlBQVksVUFBVSxDQUFDO0FBQUEsTUFDL0IsQ0FBQyxlQUFlO0FBQUEsUUFDZCxTQUFTO0FBQUEsUUFDVCxTQUFTLENBQUMsZ0JBQWdCLE9BQU87QUFBQSxRQUNqQyxXQUFXLENBQUMsT0FBTyxRQUFRLE9BQU8sTUFBTTtBQUFBLE1BQzFDLENBQUMsQ0FBQztBQUFBLElBQ0o7QUFBQSxJQUVBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLFFBQVEsVUFBVTtBQUFBLFFBQ2xCLFVBQVUsVUFBVTtBQUFBLFFBQ3BCLFdBQVcsVUFBVTtBQUFBLFFBQ3JCLFdBQVcsVUFBVTtBQUFBLFFBQ3JCLFVBQVUsVUFBVTtBQUFBLE1BQ3RCO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUNIOyIsCiAgIm5hbWVzIjogW10KfQo=

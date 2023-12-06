import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { readFileSync } from "node:fs";
import fsExtra from "fs-extra/esm";
import path from "node:path";
import { fileURLToPath } from "url";
import esbuild from "esbuild";
import chokidar from "chokidar";
import compression from "compression";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = "";
const clients = [];
const buildPath = "./builder/dev/build/";
const debounce = (func, timeout = 500) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};
const middleware = (target, ws = true) =>
  createProxyMiddleware(basePath + target, {
    target: "http://localhost:8080",
    changeOrigin: true,
    ws,
  });

// Start with an initial build
esbuild
  .context({
    logLevel: "info",
    entryPoints: ["src/index.tsx"],
    bundle: true,
    banner: {
      js: ' (() => new EventSource("http://localhost:3000/dev").onmessage = () => location.reload())();',
    },
    loader: {
      ".js": "jsx",
      ".svg": "file",
      ".png": "file",
      ".woff": "dataurl",
      ".woff2": "dataurl",
      ".ttf": "dataurl",
      ".eot": "dataurl",
    },
    assetNames: "[dir]/[name]-[hash]",
    target: ["chrome58"],
    minify: false,
    keepNames: true,
    sourcemap: true,
    sourceRoot: "src",
    outdir: "builder/dev/build",
  })
  .then(async (builder) => {
    await builder.rebuild();
    // region Copy public files to build
    fsExtra.copySync("./src/static/ext", buildPath + "/static/ext", {
      recursive: true,
      overwrite: true,
    });
    // Listen change for hot recompile
    chokidar
      .watch("src/**/*.{js,jsx,ts,tsx}", {
        awaitWriteFinish: true,
        ignoreInitial: true,
      })
      .on(
        "all",
        debounce(() => {
          const start = new Date().getTime();
          console.log(`[HOT RELOAD] Update of front detected`);
          return builder
            .rebuild()
            .then(() => {
              const time = new Date().getTime() - start;
              console.log(
                `[HOT RELOAD] Rebuild done in ${time} ms, updating frontend`,
              );
              clients.forEach((res) => res.write("data: update\n\n"));
              clients.length = 0;
            })
            .catch((error) => {
              console.error(error);
            });
        }),
      );
    // Start a dev web server
    const app = express();
    app.get("/dev", (req, res) => {
      return clients.push(
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Access-Control-Allow-Origin": "*",
          Connection: "keep-alive",
        }),
      );
    });
    app.set("trust proxy", 1);
    app.use(compression({}));
    app.use(middleware("/api"));
    app.use(middleware("/login"));
    app.use(middleware("/logout"));
    app.use(middleware("/oauth2"));
    app.use(middleware("/saml2"));
    app.use(
      basePath + `/static`,
      express.static(path.join(__dirname, "./build/static")),
    );
    app.use(`/css`, express.static(path.join(__dirname, "./build")));
    app.use(`/js`, express.static(path.join(__dirname, "./build")));
    app.get("*", (req, res) => {
      const data = readFileSync(`${__dirname}/index.html`, "utf8");
      const withOptionValued = data
        .replace(/%BASE_PATH%/g, basePath)
        .replace(/%APP_TITLE%/g, "OpenEx Dev")
        .replace(/%APP_DESCRIPTION%/g, "OpenEx Development platform")
        .replace(/%APP_FAVICON%/g, `${basePath}/static/ext/favicon.png`)
        .replace(/%APP_MANIFEST%/g, `${basePath}/static/ext/manifest.json`);
      res.header(
        "Cache-Control",
        "private, no-cache, no-store, must-revalidate",
      );
      res.header("Expires", "-1");
      res.header("Pragma", "no-cache");
      return res.send(withOptionValued);
    });
    app.listen(3000);
  });

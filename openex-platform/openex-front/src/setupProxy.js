/* eslint-disable */
const { createProxyMiddleware } = require("http-proxy-middleware");

const onError = function (err, req, res) {
  console.log("Something went wrong... Ignoring");
};

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target: "http://localhost:8001",
      ws: true,
      onError,
    })
  );
  app.use(
    createProxyMiddleware("/connect", {
      target: "http://localhost:8001",
      onError,
    })
  );
};

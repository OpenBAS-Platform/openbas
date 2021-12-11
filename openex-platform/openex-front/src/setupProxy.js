/* eslint-disable */
const { createProxyMiddleware } = require("http-proxy-middleware");

const onError = function (err, req, res) {
  console.log("Something went wrong... Ignoring");
};

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target: "http://localhost:8081",
      ws: true,
      onError,
    })
  );
  app.use(
    createProxyMiddleware("/login", {
      target: "http://localhost:8081",
      onError,
    })
  );  app.use(
    createProxyMiddleware("/oauth2", {
      target: "http://localhost:8081",
      onError,
    })
  );
};

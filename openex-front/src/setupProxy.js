/* eslint-disable */
const {createProxyMiddleware} = require("http-proxy-middleware");

const onError = function (err, req, res) {
    console.log("Something went wrong... Ignoring");
};

module.exports = function (app) {
    app.use(
        createProxyMiddleware("/api", {
            target: "http://localhost:8081",
            secure: false,
            ws: true,
            onError,
        })
    );
    app.use(
        createProxyMiddleware("/login", {
            target: "http://localhost:8081",
            secure: false,
            onError,
        })
    );
    app.use(
        createProxyMiddleware("/logout", {
            target: "http://localhost:8081",
            secure: false,
            onError,
        })
    );
    app.use(
        createProxyMiddleware("/oauth2", {
            target: "http://localhost:8081",
            secure: false,
            onError,
        })
    );
};

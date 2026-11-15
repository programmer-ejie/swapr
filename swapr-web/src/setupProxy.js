const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(createProxyMiddleware('/api', {
    target: 'http://127.0.0.1:4000',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    onProxyReq(proxyReq) {
      // The browser calls the web origin; this is an internal development hop.
      proxyReq.removeHeader('origin');
    },
    onError(_error, _request, response) {
      response.writeHead(502, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'The Swapr backend is unavailable. Start swapr-backend with npm run dev, then retry.' }));
    },
  }));
};

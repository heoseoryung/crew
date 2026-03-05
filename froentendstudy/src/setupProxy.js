const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      ws: true, // 웹소켓 프록시 허용

    })
  );
};//vite에서는 프록시 설정이 안됨 프록시 
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        },
        onProxyReq: (proxyReq, req, res) => {
          proxyReq.setHeader('Cache-Control', 'no-cache')
          proxyReq.setHeader('Connection', 'keep-alive')
        }
      }
    }
  }
})
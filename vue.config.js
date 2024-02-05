/* eslint-disable @typescript-eslint/no-var-requires */
const {
  defineConfig
} = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: '/',
  transpileDependencies: true,
  devServer: {
    open: true,
    host: '0.0.0.0',
    port: 4555,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4556',
        ws: true,
        changeOrigin: true
      }
    }
  }
})

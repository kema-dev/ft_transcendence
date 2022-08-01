const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
	devServer: {
		port: 443,
		https: true,
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false,
				pathRewrite: {
					'^/api': ''
				}
			}
		}
	},
  transpileDependencies: true
})

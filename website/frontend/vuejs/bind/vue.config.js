const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
	devServer: {
		port: 443,
		server: {
			type: 'https',
		},
		proxy: {
			'/api': {
				target: 'https://localhost:3000',
				changeOrigin: true,
				secure: false,
				pathRewrite: {
					'^/api': ''
				}
			}
		}
	},
	plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ['lottie-player'].includes(tag),
        }
      }
    })
  ],
  transpileDependencies: true
})

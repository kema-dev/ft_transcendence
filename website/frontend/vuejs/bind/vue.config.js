const { defineConfig } = require('@vue/cli-service')
const data = require('./.env.json')
module.exports = defineConfig({
	devServer: {
		port: 443,
		server: {
			type: 'https',
		},
		proxy: {
			'/api': {
				target: data.FQDN + ':3000',
				changeOrigin: true,
				secure: false,
				pathRewrite: {
					'^/api': ''
				}
			}
		}
	},
	css: {
		loaderOptions: {
			// pass options to sass-loader
			// @/ is an alias to src/
			// so this assumes you have a file named `src/variables.sass`
			// Note: this option is named as "prependData" in sass-loader v8
			sass: {
				additionalData: `@import "~@/assets/scss/_shared.scss";`
			},
			// by default the `sass` option will apply to both syntaxes
			// because `scss` syntax is also processed by sass-loader underlyingly
			// but when configuring the `prependData` option
			// `scss` syntax requires an semicolon at the end of a statement, while `sass` syntax requires none
			// in that case, we can target the `scss` syntax separately using the `scss` option
			scss: {
				additionalData: `@import "~@/assets/scss/_shared.scss";`
			},
		}
	},

	// 	plugins: [
	//     vue({
	//       template: {
	//         compilerOptions: {
	//           isCustomElement: (tag) => ['lottie-player'].includes(tag),
	//         }
	//       }
	//     })
	//   ],
	transpileDependencies: true
})

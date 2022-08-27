import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast, { PluginOptions } from "vue-toastification";
import "vue-toastification/dist/index.css";

const toast_options: PluginOptions = {
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: false,
  icon: "fas fa-rocket",
  rtl: false
};
createApp(App).use(router).use(Toast, toast_options).mount('#app')

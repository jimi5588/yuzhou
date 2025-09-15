import { createApp } from 'vue'
import App from './App.vue'
import './assets/css/main.scss'
import './assets/css/theme.scss'
import router from './router'
import store from './store'
import i18n from './lang/i18n'
import '@vant/touch-emulator';

const app = createApp(App)
app.use(router).use(store).use(i18n).mount('#app')

// 禁止右键菜单
//document.addEventListener('contextmenu', e => e.preventDefault());

// 禁止复制和剪切
//document.addEventListener('copy', e => e.preventDefault());
//document.addEventListener('cut', e => e.preventDefault());

import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import { rtdbPlugin } from 'vuefire'
import db from './db'
import Store from 'electron-store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.use(rtdbPlugin)
Vue.prototype.$db = db
Vue.prototype.$storage = new Store()

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

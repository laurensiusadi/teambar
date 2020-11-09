import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { rtdbPlugin } from 'vuefire'
import db from './db'
import Store from 'electron-store'

Vue.config.productionTip = false
Vue.use(rtdbPlugin)
Vue.prototype.$db = db
Vue.prototype.$storage = new Store()

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')

process.on('unhandledRejection', (error) => {
  console.error(error)
})

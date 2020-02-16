import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { firestorePlugin } from 'vuefire'
import { db } from './db'
import Store from 'electron-store'

Vue.config.productionTip = false
Vue.use(firestorePlugin)
Vue.prototype.$db = db
Vue.prototype.$storage = new Store()

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')

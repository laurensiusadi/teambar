import Vue from 'vue'
import Vuex from 'vuex'
import VuexEasyFirestore from 'vuex-easy-firestore'
Vue.use(Vuex)

import { Firebase, initFirebase } from '../config/firebase'
import roomsModule from './modules/rooms'

const easyFirestore = VuexEasyFirestore(
  [
    roomsModule
  ],
  { logging: true, FirebaseDependency: Firebase }
)

const store = new Vuex.Store({
  plugins: [
    easyFirestore
  ]
})

// initFirebase
initFirebase()
  .catch(error => {
    // take user to a page stating an error occurred
    // (might be a connection error, or the app is open in another tab)
    console.error(error)
  })

export default store

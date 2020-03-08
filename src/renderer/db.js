import firebase from 'firebase/app'
import 'firebase/database'

const firebaseConfig = {
  apiKey: process.env.VUE_APP_apiKey,
  authDomain: process.env.VUE_APP_authDomain,
  databaseURL: 'https://team-menu-bar.firebaseio.com',
  projectId: process.env.VUE_APP_projectId,
  storageBucket: process.env.VUE_APP_storageBucket,
  messagingSenderId: process.env.VUE_APP_messagingSenderId,
  appId: process.env.VUE_APP_appId
}

export default firebase
  .initializeApp(firebaseConfig)
  .database()

export { firebase }

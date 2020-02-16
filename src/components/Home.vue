<template>
  <div>
    <div v-if="!loading">
      <template v-if="!existingRoom">
        <otp-input
          v-model="roomNumber"
          class="room-input"
          :length="6"
          pattern="[^0-9]+"
          :ignorePattern="false"
          :size="24"
        />
      </template>
      <template v-else>
        <h3>Current room {{ this.roomNumber }}</h3>
        <button @click="leaveRoom()">Leave Room</button>
        <div v-for="(member, index) in mapObjToArray(members)" :key="index">
          <pre>{{ member }}</pre>
        </div>
      </template>
    </div>
    <div v-else>
      Loading
    </div>
    <p>{{ info }}</p>
  </div>
</template>

<script>
import OTPInput8 from '@8bu/vue-otp-input'
import { machineIdSync } from 'node-machine-id'
import os from 'os'
import { firebase } from '../db'

export default {
  name: 'Home',
  components: {
    'otp-input': OTPInput8,
  },
  data() {
    return {
      roomNumber: '',
      loading: false,
      info: '',
      existingRoom: false,
      members: {}
    }
  },
  created() {
    if (this.$storage.has('room')) {
      this.existingRoom = true
      this.roomNumber = this.$storage.get('room')
    }
  },
  watch: {
    roomNumber: {
      immediate: true,
      handler(roomNumber) {
        if (roomNumber.length === 6) {
          this.joinRoom()
          this.onConnected()
          // Watch members of joined room
          this.$rtdbBind('members', this.$db.ref(`/rooms/${roomNumber}/members`))
        }
      }
    }
  },
  computed: {
    machine() { return machineIdSync() },
    computerName() { return `${os.hostname}-${os.type} ${os.release}` }
  },
  methods: {
    mapObjToArray(obj) {
      if (obj) {
        return Object.keys(obj).map(key => ({ ...obj[key], id: key }))
      }
    },
    onConnected() {
      // On connected to firebase bind status watcher
      this.$db.ref('.info/connected').on('value', (snapshot) => this.bindStatusWatcher(snapshot))
    },
    joinRoom() {
      this.$storage.set('room', this.roomNumber)
      this.existingRoom = true
    },
    leaveRoom() {
      this.loading = true
      this.info = ''
      this.$db.ref(`rooms/${this.roomNumber}/members/${this.machine}`).onDisconnect().cancel()
      this.$db.ref(`rooms/${this.roomNumber}/members/${this.machine}`).remove()
        .then(() => {
          this.loading = false
          this.existingRoom = false
          this.$storage.delete('room')
          this.roomNumber = ''
        })
    },
    bindStatusWatcher(snapshot) {
      this.loading = true
      let userStatusDatabaseRef = this.$db.ref(`rooms/${this.roomNumber}/members/${this.machine}`)
      let isOfflineForDatabase = {
        state: 'offline',
        computer: this.computerName,
        lastChange: firebase.database.ServerValue.TIMESTAMP }
      let isOnlineForDatabase = {
        state: 'online',
        computer: this.computerName,
        lastChange: firebase.database.ServerValue.TIMESTAMP }

      if (snapshot.val() == false) { return }
      userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(() => {
        userStatusDatabaseRef.set(isOnlineForDatabase)
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss">
.room-input {
  .otp-input-8-field {
    display: inline-block;
    vertical-align: top;
    font-size: inherit;
    overflow: hidden;
    position: relative;
    &::after {
      content: '';
      border-radius: 9999px;
      bottom: 0;
      left: 0;
      right: 0;
      position: absolute;
      display: block;
      height: 3px;
      background-color: white;
    }
    &:not(:last-child) {
      margin-right: 0.5rem;
    }
    input {
      background: transparent;
      color: white;
      font-weight: bold;
      border: 0;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      padding: 0;
      width: 1.75em;
      height: 1.75em;
      font-size: inherit;
      line-height: 1.75em;
      text-align: center;
    }
  }
}
</style>

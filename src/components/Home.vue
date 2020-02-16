<template>
  <div>
    <div v-if="!loading">
      <div v-if="!existingRoom" style="text-align: center; padding-top: 32px;">
        <div class="header">
          <h4 class="heading">TEAM MENUBAR</h4>
        </div>
        <p>Insert team code, you'll join instantly.</p>
        <otp-input
          v-model="roomNumber"
          class="room-input"
          :length="6"
          pattern="[^0-9]+"
          :ignorePattern="false"
          :size="24"
        />
      </div>
      <div class="container" v-else>
        <div class="header">
          <div class="heading">TEAM {{ this.roomNumber }}</div>
          <button class="button" @click="leaveRoom()">Leave Room</button>
        </div>
        <div class="member-wrapper">
          <div v-for="(member, index) in mapObjToArray(members)"
            class="member-item" :key="index">
            <div class="member-status" :class="member.state">&bull;</div>
            <div class="member-info">
              <div class="member-name">{{ member.computer }}</div>
              <div class="member-last-seen">
                {{ member.state === 'online' ? 'Online' : formatDate(member.lastChange) }}
              </div>
            </div>
          </div>
        </div>
      </div>
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
      members: {},
      now: Date.now()
    }
  },
  created() {
    if (this.$storage.has('room')) {
      this.existingRoom = true
      this.roomNumber = this.$storage.get('room')
    }
  },
  mounted() {
    this.interval = setInterval(() => {
      this.now = Date.now()
    }, 1000 * 60)
  },
  beforeDestroy() {
    clearInterval(this.interval)
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
    formatDate(timestamp) {
      const intervals = [
        { label: 'year', seconds: 31556926 },
        { label: 'month', seconds: 2629744 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
      ]
      const seconds = Math.floor((this.now - new Date(timestamp).getTime()) / 1000)
      if (seconds > 0) {
        const interval = intervals.find(i => i.seconds < seconds)
        const count = Math.floor(seconds / interval.seconds)
        return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
      } else {
        return 'A few seconds ago'
      }
    },
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
  text-align: center;
  padding: 0;
  .otp-input-8-field {
    display: inline-block;
    vertical-align: top;
    font-size: inherit;
    overflow: hidden;
    position: relative;
    &:not(:last-child) {
      margin-right: 0.5rem;
    }
    input {
      background: #131417;
      color: white;
      font-weight: bold;
      border: 1px solid #25262A;
      border-radius: 4px;
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

.header {
  display: flex;
  padding: 12px;
  .heading {
    flex: 1;
    color: #9397a7;
    font-weight: bold;
    padding-left: 8px;
    line-height: 31px;
    margin: 0;
  }
  .button {
    background-color: #0064fe;
    color: white;
    border-radius: 4px;
    border-style: none;
    padding: 8px 12px;
  }
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.member-wrapper {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.member-item {
  font-size: 14px;
  display: flex;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #25262a;
  background-color: #090a0c;
  margin: 8px;
  .member-status {
    font-size: 32px;
    line-height: 14px;
    padding:  0 8px 0 4px;
    &.online {
      color: greenyellow;
    }
    &.offline {
      color: red;
    }
  }
  .member-info {
    flex: 1
  }
}
</style>

<template>
  <transition name="fade">
    <div key="main" v-if="!loading">
      <div v-if="!existingRoom" style="text-align: center; padding-top: 32px;">
        <div class="header">
          <h4 class="heading flex-1">Teambar</h4>
        </div>
        <p style="margin-top: 8px">Insert team code, you'll join instantly.</p>
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
        <div class="member-wrapper">
          <transition-group name="member" tag="div" appear>
            <div v-for="member in mapObjToArray(members)"
              class="member-item" :key="member.id">
              <div class="member-status" :class="member.state">&bull;</div>
              <div class="member-info">
                <div class="member-name">
                  {{ member.id === machine ? 'You - ' : '' }}
                  {{ member.computer }}</div>
                <div class="member-last-seen">
                  {{ member.state === 'online' ? 'Online' : formatDate(member.lastChange) }}
                </div>
              </div>
            </div>
          </transition-group>
        </div>
        <div class="header">
          <div class="flex-1">
            <span class="heading">Teambar</span>
          </div>
          <div>
            <transition name="text-fade" mode="out-in">
              <button
                :key="isCopying"
                class="button secondary mr-1 code"
                title="Copy to Clipboard"
                @click="copyNumber()"
                style="width: 80px"
              >
                {{ isCopying ? 'Copied!' : this.roomNumber }}
              </button>
            </transition>
            <button class="button red" @click="leaveRoom()">Leave Room</button>
          </div>
        </div>
      </div>
    </div>
    <div key="load" v-else>
      <div style="line-height: 100vh; text-align: center; letter-spacing: 2px;">
        {{ roomNumber ? 'JOINING TEAM' : 'LEAVING TEAM' }}
      </div>
    </div>
  </transition>
</template>

<script>
import { clipboard } from 'electron'
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
      isCopying: false,
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
    joinRoom() {
      this.setLoading(true)
      // On connected to firebase bind status watcher
      this.$db.ref('.info/connected').on('value', (snapshot) => this.bindStatusWatcher(snapshot))
      this.$storage.set('room', this.roomNumber)
      this.existingRoom = true
    },
    leaveRoom() {
      this.roomNumber = ''
      this.setLoading(true)
      this.$db.ref(`rooms/${this.roomNumber}/members/${this.machine}`).onDisconnect().cancel()
      this.$db.ref(`rooms/${this.roomNumber}/members/${this.machine}`).remove()
        .then(() => {
          this.existingRoom = false
          this.setLoading(false)
          this.$storage.delete('room')
        })
    },
    bindStatusWatcher(snapshot) {
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
        this.setLoading(false)
      })
    },
    copyNumber() {
      this.isCopying = true
      clipboard.writeText(this.roomNumber)
      setTimeout(() => { this.isCopying = false }, 1500)
    },
    setLoading(bool) {
      if (bool) {
        this.loading = bool
      } else {
        setTimeout(() => { this.loading = bool }, 750)
      }
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
      border: 2px solid #25262A;
      border-radius: 4px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      padding: 0;
      width: 1.75em;
      height: 1.75em;
      font-size: inherit;
      line-height: 1.75em;
      text-align: center;
      outline: none;
      &:focus {
        border-color: #0064fe;
      }
    }
  }
}

.flex-1 {
  flex: 1;
}

.mr-1 {
  margin-right: 8px;
}

p {
  color: #b7beca;
}

.header {
  display: flex;
  padding: 12px;
  .heading {
    color: white;
    font-weight: bold;
    padding: 0 8px;
    line-height: 31px;
    margin: 0;
    font-size: 24px;
    letter-spacing: 0.2px;
  }
  .button {
    background-color: #0064fe;
    color: white;
    border-radius: 4px;
    border: 1px solid transparent;
    padding: 8px 12px;
    cursor: pointer;
    outline: none;
    &.red {
      background-color: #131417;
      border-color: #ff2b25;
      &:hover {
        background-color: #c51d17;
      }
    }
    &.secondary {
      background-color: #131417;
      &:hover {
        background-color: #090a0c;
        border: 1px solid #0064fe;
      }
    }
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
      color: #58cf65;
    }
    &.offline {
      color: #7d828e;
    }
  }
  .member-info {
    flex: 1;
    .member-last-seen {
      font-size: 12px;
      color: #848a96;
    }
  }
}

.member-enter-active { transition: all 1s; }
.member-enter { opacity: 0; transform: translateX(30px); }
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease-in-out; }
.fade-enter, .fade-leave-to { opacity: 0; }
.text-fade-enter-active, .text-fade-leave-active { transition: all .15s ease; }
.text-fade-enter, .text-fade-leave-to { color: #090a0c; }

</style>

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
          :size="32"
          @valid="handleOnComplete"
        />
        <button @click="joinRoom()">Join Existing Team</button>
        <button @click="createNewRoom()">Create New Team</button>
      </template>
      <template v-else>
        Current room {{ this.roomNumber }}
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
import { FieldValue } from '../db'

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
      existingRoom: false
    }
  },
  created() {
    console.log('existing room', this.$storage.has('room'))
    if (this.$storage.has('room')) {
      this.existingRoom = true
      this.roomNumber = this.$storage.get('room')
    }
  },
  methods: {
    handleOnComplete(value) {
      if (value) {
        console.log("OTP completed: ", value);
      }
    },
    createNewRoom() {
      this.loading = true
      this.info = ''
      if (this.roomNumber.length === 6) {
        this.$db.collection('rooms').add({
          room_id: this.roomNumber,
          createdAt: FieldValue.serverTimestamp()
        })
        .then(() => {
          this.loading = false
        })
      }
    },
    joinRoom() {
      this.loading = true
      this.info = ''
      this.$db.collection('rooms')
        .where('room_id', '==', this.roomNumber)
        .get()
        .then(result => {
          this.loading = false
          console.log('get room', result)
          if (result.empty) {
            console.log('Room not found')
            return
          }
          this.info = `Joined room ${this.roomNumber}`
          this.$storage.set('room', this.roomNumber)
        })
    }
  }
};
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

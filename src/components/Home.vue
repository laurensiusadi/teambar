<template>
  <div>
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
    <pre>{{ rooms }}</pre>
  </div>
</template>

<script>
import OTPInput8 from '@8bu/vue-otp-input'

export default {
  name: 'Home',
  components: {
    'otp-input': OTPInput8,
  },
  data() {
    return {
      roomNumber: ''
    }
  },
  created() {
    this.$store.dispatch('rooms/fetchAndAdd')
  },
  computed: {
    rooms() {
      return this.$store.getters['rooms/storeRef']
    }
  },
  methods: {
    handleOnComplete(value) {
      if (value) {
        console.log("OTP completed: ", value);
      }
    },
    createNewRoom() {
      if (this.roomNumber.length === 6) {
        this.$store.dispatch('rooms/insert', {
          "room-id": this.roomNumber
        })
      }
    },
    joinRoom() {
      // this.$store.dispatch('rooms/fetchAndAdd', {
      //   where: [['room_id', '==', `${this.roomNumber}`]],
      // })
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

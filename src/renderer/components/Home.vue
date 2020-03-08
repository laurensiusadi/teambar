<template>
  <div id="wrapper">
    <h1>Home Menubar Success</h1>
  </div>
</template>

<script>
  export default {
    name: 'home',
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

</style>

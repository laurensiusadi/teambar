<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'team-status-bar'
  }
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #1e1f23;
  color: white;
  font-size: 18px;
  font-family: 'SF Pro Text', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, 'Open Sans', 'Helvetica Neue', sans-serif;
  height: 100vh;
  overflow: hidden;
}
</style>
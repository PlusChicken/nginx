<template>
  <div class="demo-app">
    <router-view />
    <!-- <div class="map-wrapper">
      <GMap/>
    </div> -->
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, createApp } from 'vue'
import { useMyStore } from './store'
import GMap from '/@/components/GMap.vue'
import Screen from '/@/components/screen.vue'

export default defineComponent({
  name: 'App',
  components: { GMap, Screen },

  setup () {
    const store = useMyStore()
    return {}
  },
})
</script>
<style lang="scss" scoped>
.demo-app {
  width: 100%;
  height: 100%;

  .map-wrapper {
    height: 100%;
    width: 100%;
  }
}
</style>

<style lang="scss">
#demo-app {
  width: 100%;
  height: 100%;
}
</style>

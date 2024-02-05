<template>
  <div id="app">
    <transition v-if="needHome" name="fade" mode="out-in">
      <el-row class="container">
        <el-col :span="24" class="header main-header">
          <el-row>online server</el-row>
        </el-col>
        <el-col :span="24" class="main">
          <router-view></router-view>
        </el-col>
      </el-row>
    </transition>
    <transition v-else name="fade" mode="out-in">
      <div style="height: 100%; overflow: hidden">
        <router-view></router-view>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import router from './router/index'
const needHome = computed(() => {
  console.log(router)
  const route = router.currentRoute as any
  return !route.meta.NoNeedHome && route.query.from === null
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height:100%;
}

html,
body {
  height: 99%;
}
</style>

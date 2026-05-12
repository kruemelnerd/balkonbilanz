<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppShellNav from './features/shell/AppShellNav.vue';
</script>

<template>
  <div class="app-shell">
    <RouterView />
    <AppShellNav />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding-bottom: 76px;
}
</style>

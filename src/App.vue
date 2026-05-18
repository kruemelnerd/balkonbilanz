<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppShellNav from './features/shell/AppShellNav.vue';
import ReloadPrompt from './features/pwa/ReloadPrompt.vue';
</script>

<template>
  <ReloadPrompt />
  <RouterView />
  <AppShellNav />
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding-bottom: 76px;
}
</style>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

const items = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/capture', label: 'Erfassung' },
  { to: '/analysis', label: 'Analyse' },
  { to: '/settings', label: 'Mehr' },
];
</script>

<template>
  <nav class="app-shell-nav" aria-label="Hauptnavigation">
    <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="app-shell-nav__link">
      {{ item.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.app-shell-nav {
  align-items: center;
  background: #fff;
  border-top: 1px solid rgba(31, 41, 55, 0.12);
  bottom: 0;
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(4, 1fr);
  left: 0;
  padding: 10px 12px 12px;
  position: sticky;
  right: 0;
}

.app-shell-nav__link {
  align-items: center;
  border-radius: 16px;
  color: #1f2937;
  display: flex;
  font-weight: 600;
  justify-content: center;
  min-height: 44px;
  padding: 10px 12px;
  text-decoration: none;
}

.app-shell-nav__link.router-link-active {
  background: #1f6b5c;
  color: #fff;
}
</style>

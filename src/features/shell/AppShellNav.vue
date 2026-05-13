<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <nav class="app-shell-nav" aria-label="Hauptnavigation">
    <RouterLink to="/dashboard">Dashboard</RouterLink>
    <RouterLink to="/capture">Erfassung</RouterLink>
    <RouterLink to="/analysis">Analyse</RouterLink>
    <RouterLink to="/settings">Einstellungen</RouterLink>
  </nav>
</template>

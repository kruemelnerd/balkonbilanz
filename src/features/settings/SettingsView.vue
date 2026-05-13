<script setup lang="ts">
</script>

<template>
  <main class="settings-view">
    <header class="settings-view__header">
      <h1>Einstellungen</h1>
      <p>Lokale Preise, Tarife und Sicherungen fuer die naechsten Berechnungen.</p>
    </header>

    <section class="settings-card">
      <h2>Preis & Qualität</h2>
      <p>Die echte Konfiguration folgt in den nächsten Schritten.</p>
    </section>
  </main>
</template>

<style scoped>
.settings-view {
  display: grid;
  gap: 16px;
  padding: 16px;
}

.settings-view__header h1,
.settings-view__header p,
.settings-card h2,
.settings-card p {
  margin: 0;
}

.settings-card {
  background: #fff;
  border: 1px solid rgba(31, 41, 55, 0.12);
  border-radius: 20px;
  display: grid;
  gap: 12px;
  padding: 16px;
}
</style>

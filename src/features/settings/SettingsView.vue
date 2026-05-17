<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { createBatteryAdvisorService } from '../../services/batteryAdvisorService.ts';
import { createSettingsService } from '../../services/settingsService.ts';
import { createBackupService } from '../../services/backupService.ts';
import { createSettingsRepository } from '../../repositories/settingsRepository.ts';
import { createAnalysisService } from '../../services/analysis/analysisService.ts';
import { createBrowserAnalysisDependencies, BalkonBilanzDb } from '../../db/database.ts';
import { createAnalysisStore } from '../../stores/analysisStore.ts';
import { DEFAULT_APP_SETTINGS, type AppSettingsRecord, type TariffPeriodRecord } from '../../domain/settings/settingsTypes.ts';
import { formatGermanDate, formatGermanDateTime } from '../../utils/dateFormatting.ts';
import BatteryAdvisorCard from './BatteryAdvisorCard.vue';

interface SettingsViewProps {
  settingsService?: ReturnType<typeof createSettingsService>;
  backupService?: ReturnType<typeof createBackupService>;
  analysisStore?: ReturnType<typeof createAnalysisStore>;
  advisorService?: ReturnType<typeof createBatteryAdvisorService>;
}

const props = defineProps<SettingsViewProps>();

const db = new BalkonBilanzDb();
const settingsRepository = createSettingsRepository({
  appSettings: db.appSettings,
  tariffPeriods: db.tariffPeriods,
});
const settingsService = props.settingsService ?? createSettingsService(settingsRepository);
const backupService = props.backupService ?? createBackupService(db);
const analysisStore = props.analysisStore ?? createAnalysisStore({
  analysisService: createAnalysisService(createBrowserAnalysisDependencies(db)),
});
const advisorService = props.advisorService ?? createBatteryAdvisorService();

const settingsDraft = reactive({ ...DEFAULT_APP_SETTINGS });
const tariffPeriods = ref<TariffPeriodRecord[]>([]);
const settingsIssues = ref<string[]>([]);
const tariffIssues = ref<string[]>([]);
const settingsMessage = ref('');
const tariffMessage = ref('');
const tariffEditingId = ref<number | null>(null);
const backupText = ref('');
const selectedBackupFile = ref<File | null>(null);
const backupPreview = ref<{ schemaVersion: number; exportedAt: string; counts: Record<string, number> } | null>(null);
const backupError = ref('');
const backupMessage = ref('');
const restoreConfirmed = ref(false);

const tariffDraft = reactive({
  startsOn: new Date().toISOString().slice(0, 10),
  endsOn: '',
  electricityPriceEurPerKwh: DEFAULT_APP_SETTINGS.electricityPriceEurPerKwh,
});

function rangeDays(): number {
  const start = new Date(`${analysisStore.fromDay}T00:00:00.000Z`).getTime();
  const end = new Date(`${analysisStore.toDay}T00:00:00.000Z`).getTime();
  return Math.max(1, Math.floor((end - start) / 86400000) + 1);
}

const advisorContext = computed(() => ({
  analysisBasis: {
    combined: analysisStore.combined
      ? {
          exportKwh: analysisStore.combined.exportKwh,
          selfConsumptionKwh: analysisStore.combined.selfConsumptionKwh,
          importKwh: analysisStore.combined.importKwh,
          autarkyPercent: analysisStore.combined.autarkyPercent,
        }
      : null,
    qualityLevel: analysisStore.quality?.level ?? 'good',
    analysisPeriodDays: rangeDays(),
    electricityPriceEurPerKwh: settingsDraft.electricityPriceEurPerKwh,
  },
}));

function setSettingsIssues(issues: Array<{ message: string }>) {
  settingsIssues.value = issues.map((issue) => issue.message);
}

function setTariffIssues(issues: Array<{ message: string }>) {
  tariffIssues.value = issues.map((issue) => issue.message);
}

function clearTariffForm() {
  tariffEditingId.value = null;
  tariffDraft.startsOn = new Date().toISOString().slice(0, 10);
  tariffDraft.endsOn = '';
  tariffDraft.electricityPriceEurPerKwh = settingsDraft.electricityPriceEurPerKwh;
}

async function loadState() {
  const loadedSettings = await settingsService.loadSettings();
  Object.assign(settingsDraft, loadedSettings);
  tariffDraft.electricityPriceEurPerKwh = loadedSettings.electricityPriceEurPerKwh;
  tariffPeriods.value = await settingsService.listTariffPeriods();
  await analysisStore.loadAnalysis();
}

async function saveSettings() {
  settingsIssues.value = [];
  const result = await settingsService.saveSettings({
    electricityPriceEurPerKwh: settingsDraft.electricityPriceEurPerKwh,
    feedInTariffEurPerKwh: settingsDraft.feedInTariffEurPerKwh,
    qualityMode: settingsDraft.qualityMode,
  });

  if (!result.ok) {
    setSettingsIssues(result.issues);
    return;
  }

  Object.assign(settingsDraft, result.value);
  settingsMessage.value = 'Einstellungen lokal gespeichert.';
  window.setTimeout(() => {
    settingsMessage.value = '';
  }, 3500);
}

async function saveTariffPeriod() {
  tariffIssues.value = [];
  const result = await settingsService.saveTariffPeriod({
    id: tariffEditingId.value ?? undefined,
    startsOn: tariffDraft.startsOn,
    endsOn: tariffDraft.endsOn || null,
    electricityPriceEurPerKwh: tariffDraft.electricityPriceEurPerKwh,
  });

  if (!result.ok) {
    setTariffIssues(result.issues);
    return;
  }

  tariffMessage.value = tariffEditingId.value === null ? 'Tarifperiode gespeichert.' : 'Tarifänderung gespeichert.';
  tariffPeriods.value = await settingsService.listTariffPeriods();
  clearTariffForm();
}

function startTariffEdit(period: TariffPeriodRecord) {
  tariffEditingId.value = period.id ?? null;
  tariffDraft.startsOn = period.startsOn;
  tariffDraft.endsOn = period.endsOn ?? '';
  tariffDraft.electricityPriceEurPerKwh = period.electricityPriceEurPerKwh;
}

async function deleteTariffPeriod(period: TariffPeriodRecord) {
  if (!window.confirm(`Tarifperiode ab ${formatGermanDate(period.startsOn)} wirklich löschen? Danach gelten wieder die übrigen gespeicherten Preise.`)) {
    return;
  }

  await settingsService.deleteTariffPeriod(period.id ?? 0);
  tariffPeriods.value = await settingsService.listTariffPeriods();
}

async function exportBackup() {
  const serializedBackup = await backupService.exportBackup();
  const backupUrl = URL.createObjectURL(new Blob([serializedBackup], { type: 'application/json' }));
  const downloadLink = document.createElement('a');

  downloadLink.href = backupUrl;
  downloadLink.download = 'balkonbilanz-backup.json';
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(backupUrl);

  backupMessage.value = 'Backup exportiert.';
}

function onBackupFileChange(event: Event) {
  selectedBackupFile.value = (event.target as HTMLInputElement).files?.[0] ?? null;
}

async function previewBackup(file = selectedBackupFile.value) {
  backupError.value = '';
  backupPreview.value = null;
  restoreConfirmed.value = false;

  if (!file) {
    backupError.value = 'Diese Datei ist kein gültiges BalkonBilanz-Backup. Deine aktuellen Daten bleiben unverändert.';
    return;
  }

  backupText.value = await new Promise<string>((resolve, reject) => {
    if (typeof file.text === 'function') {
      file.text().then(resolve, reject);
      return;
    }

    if (typeof FileReader === 'undefined') {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.readAsText(file);
  });
  const result = await backupService.previewBackup(backupText.value);
  if (!result.ok) {
    backupError.value = result.message;
    return;
  }

  backupPreview.value = result.value;
}

async function restoreBackup() {
  if (!backupPreview.value || !restoreConfirmed.value) {
    return;
  }

  const result = await backupService.restoreBackup(backupText.value);
  if (!result.ok) {
    backupError.value = result.message;
    return;
  }

  backupMessage.value = 'Vollständiger Restore abgeschlossen.';
  tariffPeriods.value = await settingsService.listTariffPeriods();
}

onMounted(async () => {
  await loadState();
});
</script>

<template>
  <main class="settings-view">
    <header>
      <h1>Einstellungen</h1>
      <p>Alles bleibt lokal in diesem Browser. Backups sind die einzige Migrationsroute auf ein anderes Gerät oder einen anderen Browser.</p>
    </header>

    <section class="settings-card">
      <h2>Einstellungen &amp; Annahmen</h2>
      <form aria-label="Einstellungen & Annahmen" @submit.prevent="saveSettings">
        <p v-if="settingsMessage" aria-live="polite">{{ settingsMessage }}</p>
        <ul v-if="settingsIssues.length" role="alert">
          <li v-for="issue in settingsIssues" :key="issue">{{ issue }}</li>
        </ul>

        <label for="electricity-price">Strompreis (EUR/kWh)
          <input id="electricity-price" v-model.number="settingsDraft.electricityPriceEurPerKwh" inputmode="decimal" type="number" min="0" step="0.001" />
        </label>

        <label for="feed-in-tariff">Einspeisevergütung (EUR/kWh)
          <input id="feed-in-tariff" v-model.number="settingsDraft.feedInTariffEurPerKwh" inputmode="decimal" type="number" min="0" step="0.001" />
        </label>

        <fieldset>
          <legend>Datenqualitätsmodus</legend>
          <label><input v-model="settingsDraft.qualityMode" type="radio" value="relaxed" /> relaxed</label>
          <label><input v-model="settingsDraft.qualityMode" type="radio" value="balanced" /> balanced</label>
          <label><input v-model="settingsDraft.qualityMode" type="radio" value="strict" /> strict</label>
        </fieldset>

        <button type="submit">Einstellungen speichern</button>
      </form>
    </section>

    <section class="settings-card">
      <h2>Tarifhistorie</h2>

      <form aria-label="Tarifhistorie" @submit.prevent="saveTariffPeriod">
        <p v-if="tariffMessage" aria-live="polite">{{ tariffMessage }}</p>
        <ul v-if="tariffIssues.length" role="alert">
          <li v-for="issue in tariffIssues" :key="issue">{{ issue }}</li>
        </ul>

        <h3>{{ tariffEditingId === null ? 'Tarifperiode anlegen' : 'Tarifperiode bearbeiten' }}</h3>
        <label for="tariff-starts-on">Gültig ab
          <input id="tariff-starts-on" v-model="tariffDraft.startsOn" type="date" />
        </label>
        <label for="tariff-ends-on">Gültig bis
          <input id="tariff-ends-on" v-model="tariffDraft.endsOn" type="date" />
        </label>
        <label for="tariff-price">Strompreis (EUR/kWh)
          <input id="tariff-price" v-model.number="tariffDraft.electricityPriceEurPerKwh" inputmode="decimal" type="number" min="0" step="0.001" />
        </label>
        <button type="submit">{{ tariffEditingId === null ? 'Tarifperiode speichern' : 'Tarifänderung speichern' }}</button>
        <button v-if="tariffEditingId !== null" type="button" @click="clearTariffForm">Bearbeitung abbrechen</button>
      </form>

      <p v-if="!tariffPeriods.length" class="empty-state">Nutze vorerst die Standardwerte oder lege eine erste Tarifperiode an, wenn sich dein Strompreis geändert hat.</p>

      <ul v-else>
        <li v-for="period in tariffPeriods" :key="period.id ?? period.startsOn">
          <strong>{{ formatGermanDate(period.startsOn) }} — {{ period.endsOn ? formatGermanDate(period.endsOn) : 'offen' }}</strong>
          <span>{{ period.electricityPriceEurPerKwh }} EUR/kWh</span>
          <span>{{ tariffEditingId === period.id ? 'Aktiv' : 'Vergangen' }}</span>
          <button type="button" @click="startTariffEdit(period)">Tarifperiode bearbeiten</button>
          <button type="button" @click="deleteTariffPeriod(period)">Tarifperiode löschen</button>
        </li>
      </ul>
    </section>

    <section class="settings-card">
      <BatteryAdvisorCard :context="advisorContext" :service="advisorService" />
    </section>

    <section class="settings-card">
      <h2>Backup &amp; Restore</h2>
      <button type="button" @click="exportBackup">Backup exportieren</button>
      <p v-if="backupMessage" aria-live="polite">{{ backupMessage }}</p>
      <label for="backup-file">Datei auswählen
        <input id="backup-file" type="file" @change="onBackupFileChange" />
      </label>
      <button type="button" @click="previewBackup()">Backup prüfen</button>

      <p v-if="backupError" role="alert">{{ backupError }}</p>

      <section v-if="backupPreview" aria-label="Backup-Vorschau">
        <p>Schema-Version: {{ backupPreview.schemaVersion }}</p>
        <p>Exportiert am: {{ formatGermanDateTime(backupPreview.exportedAt) }}</p>
        <p>Settings: {{ backupPreview.counts.appSettings }}</p>
        <p>Tarife: {{ backupPreview.counts.tariffPeriods }}</p>
        <p>Zählerstände: {{ backupPreview.counts.meterReadings }}</p>
        <p>PV-Einträge: {{ backupPreview.counts.pvDailyEntries }}</p>

        <label>
          <input v-model="restoreConfirmed" type="checkbox" /> Ich weiß, dass meine aktuellen lokalen Daten vollständig ersetzt werden.
        </label>

        <button name="restore-backup" type="button" :disabled="!restoreConfirmed" @click="restoreBackup">Backup jetzt vollständig wiederherstellen</button>
      </section>
    </section>

    <section class="settings-card">
      <h2>App-Info</h2>
      <p>Die Daten bleiben nur in diesem Browser.</p>
      <p>Backups sind die einzige Migrationsroute zu einem anderen Gerät oder Browser.</p>
    </section>
  </main>
</template>

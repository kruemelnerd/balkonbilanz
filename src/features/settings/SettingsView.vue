<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import BatteryAdvisorCard from './BatteryAdvisorCard.vue';
import { createAnalysisService } from '../../services/analysis/analysisService.ts';
import { createBackupService } from '../../services/backupService.ts';
import { createBrowserCaptureDependencies } from '../../db/database.ts';
import { createSettingsService } from '../../services/settingsService.ts';
import { createAnalysisStore } from '../../stores/analysisStore.ts';
import { DEFAULT_APP_SETTINGS, type AppSettingsRecord, type SettingsQualityMode, type TariffPeriodRecord } from '../../domain/settings/types.ts';
import type { DataQualityLevel } from '../../domain/analysis/intervalTypes.ts';
import type { BackupPreview } from '../../domain/backup/backupSchema.ts';

interface SettingsSnapshot {
  settings?: AppSettingsRecord;
  tariffPeriods?: TariffPeriodRecord[];
  tariffError?: string;
  backupPreview?: BackupPreview | null;
  backupPreviewReady?: boolean;
  backupError?: string;
  settingsError?: string;
  appVersion?: string;
  schemaVersion?: number;
}

interface BatteryAdvisorInput {
  storagePriceEur: number;
  capacityKwh: number;
  efficiency: number;
  analysisPeriodDays: number;
  qualityLevel: DataQualityLevel;
  electricityPriceEurPerKwh?: number;
}

interface BatteryAdvisorSnapshot {
  input: BatteryAdvisorInput;
}

const props = defineProps<{ snapshot?: SettingsSnapshot }>();

const settingsService = props.snapshot ? null : createSettingsService();
const backupService = props.snapshot ? null : createBackupService();
const analysisDependencies = props.snapshot ? null : createBrowserCaptureDependencies();
const analysisStore = props.snapshot || !analysisDependencies
  ? null
  : createAnalysisStore({
      analysisService: createAnalysisService({
        meterRepository: analysisDependencies.meterRepository,
        pvRepository: analysisDependencies.pvRepository,
      }),
    });

const loading = ref(!props.snapshot);
const settingsError = ref(props.snapshot?.settingsError ?? '');
const tariffError = ref(props.snapshot?.tariffError ?? '');
const backupError = ref(props.snapshot?.backupError ?? '');
const backupPreview = ref<BackupPreview | null>(props.snapshot?.backupPreview ?? null);
const backupPreviewReady = ref(props.snapshot?.backupPreviewReady ?? false);
const backupExportJson = ref('');
const selectedBackupFile = ref<File | null>(null);
const appVersion = ref(props.snapshot?.appVersion ?? 'lokal');
const schemaVersion = ref(props.snapshot?.schemaVersion ?? 1);
const batteryAdvisorSnapshot = ref<BatteryAdvisorSnapshot | null>(null);

const settingsDraft = reactive<AppSettingsRecord>({ ...DEFAULT_APP_SETTINGS });
const tariffDraft = reactive({
  startDay: '',
  endDay: '',
  strompreisEurPerKwh: DEFAULT_APP_SETTINGS.strompreisEurPerKwh,
  einspeiseverguetungEurPerKwh: DEFAULT_APP_SETTINGS.einspeiseverguetungEurPerKwh,
});
const tariffPeriods = ref<TariffPeriodRecord[]>([]);
const editingTariffPeriodId = ref<number | null>(null);

function formatPrice(value: number): string {
  return value === 0 ? '0 EUR/kWh' : `${value.toFixed(3)} EUR/kWh`;
}

function formatQualityMode(value: SettingsQualityMode): string {
  return value;
}

function formatPeriod(period: TariffPeriodRecord): string {
  const end = period.endDay ?? 'offen';
  return `${period.startDay} – ${end}`;
}

function countInclusiveDays(fromDay: string, toDay: string): number {
  const from = new Date(`${fromDay}T00:00:00.000Z`);
  const to = new Date(`${toDay}T00:00:00.000Z`);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to.getTime() < from.getTime()) {
    return 30;
  }

  return Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

function resetTariffDraft() {
  tariffDraft.startDay = '';
  tariffDraft.endDay = '';
  tariffDraft.strompreisEurPerKwh = DEFAULT_APP_SETTINGS.strompreisEurPerKwh;
  tariffDraft.einspeiseverguetungEurPerKwh = DEFAULT_APP_SETTINGS.einspeiseverguetungEurPerKwh;
  editingTariffPeriodId.value = null;
}

function beginEditTariffPeriod(period: TariffPeriodRecord) {
  editingTariffPeriodId.value = period.id ?? null;
  tariffDraft.startDay = period.startDay;
  tariffDraft.endDay = period.endDay ?? '';
  tariffDraft.strompreisEurPerKwh = period.strompreisEurPerKwh;
  tariffDraft.einspeiseverguetungEurPerKwh = period.einspeiseverguetungEurPerKwh;
}

function parseBackupJson(text: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

function applySnapshot(snapshot: SettingsSnapshot) {
  Object.assign(settingsDraft, snapshot.settings ?? DEFAULT_APP_SETTINGS);
  tariffPeriods.value = [...(snapshot.tariffPeriods ?? [])];
  settingsError.value = snapshot.settingsError ?? '';
  tariffError.value = snapshot.tariffError ?? '';
  backupPreview.value = snapshot.backupPreview ?? null;
  backupPreviewReady.value = snapshot.backupPreviewReady ?? Boolean(snapshot.backupPreview);
  backupError.value = snapshot.backupError ?? '';
  appVersion.value = snapshot.appVersion ?? 'lokal';
  schemaVersion.value = snapshot.schemaVersion ?? 1;
  loading.value = false;
}

async function loadLiveState() {
  if (!settingsService) {
    return;
  }

  loading.value = true;
  try {
    Object.assign(settingsDraft, await settingsService.loadSettings());
    tariffPeriods.value = await settingsService.listTariffPeriods();
  } finally {
    loading.value = false;
  }
}

async function loadBatteryAdvisorContext() {
  if (!analysisStore) {
    return;
  }

  await analysisStore.loadAnalysis();
  const qualityLevel = analysisStore.quality?.level ?? 'poor';

  batteryAdvisorSnapshot.value = {
    input: {
      storagePriceEur: 5200,
      capacityKwh: 8,
      efficiency: 0.92,
      analysisPeriodDays: countInclusiveDays(analysisStore.fromDay, analysisStore.toDay),
      qualityLevel,
      electricityPriceEurPerKwh: settingsDraft.strompreisEurPerKwh,
    },
  };
}

async function saveSettings() {
  if (!settingsService) {
    return;
  }

  settingsError.value = '';
  const result = await settingsService.saveSettings({
    strompreisEurPerKwh: settingsDraft.strompreisEurPerKwh,
    einspeiseverguetungEurPerKwh: settingsDraft.einspeiseverguetungEurPerKwh,
    qualityMode: settingsDraft.qualityMode,
  });

  if (!result.ok) {
    settingsError.value = result.issues[0]?.message ?? 'Die Einstellungen konnten nicht gespeichert werden.';
    return;
  }

  Object.assign(settingsDraft, result.value);
}

async function saveTariffPeriod() {
  if (!settingsService) {
    return;
  }

  tariffError.value = '';
  const result = await settingsService.saveTariffPeriod({
    id: editingTariffPeriodId.value ?? undefined,
    startDay: tariffDraft.startDay,
    endDay: tariffDraft.endDay || null,
    strompreisEurPerKwh: tariffDraft.strompreisEurPerKwh,
    einspeiseverguetungEurPerKwh: tariffDraft.einspeiseverguetungEurPerKwh,
  });

  if (!result.ok) {
    tariffError.value = result.issues[0]?.message ?? 'Die Tarifperiode konnte nicht gespeichert werden.';
    return;
  }

  editingTariffPeriodId.value = null;
  const existingIndex = tariffPeriods.value.findIndex((period) => period.id === result.value.id);
  if (existingIndex >= 0) {
    tariffPeriods.value.splice(existingIndex, 1, result.value);
  } else {
    tariffPeriods.value.unshift(result.value);
  }

  tariffPeriods.value = [...tariffPeriods.value].sort((left, right) => left.startDay.localeCompare(right.startDay));
  resetTariffDraft();
}

async function deleteTariffPeriod(id: number | undefined) {
  if (!settingsService || id == null) {
    return;
  }

  tariffError.value = '';
  const result = await settingsService.deleteTariffPeriod(id);

  if (!result.ok) {
    tariffError.value = result.issues[0]?.message ?? 'Die Tarifperiode konnte nicht gelöscht werden.';
    return;
  }

  tariffPeriods.value = tariffPeriods.value.filter((period) => period.id !== id);
  if (editingTariffPeriodId.value === id) {
    resetTariffDraft();
  }
}

async function exportBackup() {
  if (!backupService) {
    return;
  }

  backupError.value = '';
  const result = await backupService.exportBackup();
  if (!result.ok) {
    backupError.value = 'Das Backup konnte nicht exportiert werden.';
    return;
  }

  backupExportJson.value = JSON.stringify(result.value, null, 2);
  backupPreview.value = {
    schemaVersion: result.value.schemaVersion,
    exportedAt: result.value.exportedAt,
    meterReadings: result.value.meterReadings.length,
    pvDailyEntries: result.value.pvDailyEntries.length,
    tariffPeriods: result.value.tariffPeriods.length,
    settingsIncluded: true,
  };
  backupPreviewReady.value = true;
}

async function readBackupFile(file: File | null) {
  selectedBackupFile.value = file;
  if (!file || !backupService) {
    return;
  }

  backupError.value = '';
  const text = await file.text();
  const parsed = parseBackupJson(text);
  if (!parsed.ok) {
    backupPreview.value = null;
    backupPreviewReady.value = false;
    backupError.value = 'Ungültige Backup-Datei: kein valides JSON.';
    return;
  }

  const preview = await backupService.previewImport(parsed.value);
  if (!preview.ok) {
    backupPreview.value = null;
    backupPreviewReady.value = false;
    backupError.value = preview.issues[0]?.message ?? 'Die Backup-Datei konnte nicht geprüft werden.';
    return;
  }

  backupPreview.value = preview.value;
  backupPreviewReady.value = true;
}

async function confirmRestore() {
  if (!backupService || !backupPreview.value || !backupPreviewReady.value || !selectedBackupFile.value) {
    return;
  }

  backupError.value = '';
  const text = await selectedBackupFile.value.text();
  const parsed = parseBackupJson(text);
  if (!parsed.ok) {
    backupPreview.value = null;
    backupPreviewReady.value = false;
    backupError.value = 'Ungültige Backup-Datei: kein valides JSON.';
    return;
  }

  const result = await backupService.restoreBackup(parsed.value, { confirmed: true });

  if (!result.ok) {
    backupError.value = result.issues[0]?.message ?? 'Der Restore konnte nicht abgeschlossen werden.';
    return;
  }

  backupError.value = '';
}

function setQualityMode(mode: SettingsQualityMode) {
  settingsDraft.qualityMode = mode;
}

onMounted(async () => {
  if (props.snapshot) {
    applySnapshot(props.snapshot);
    return;
  }

  await loadLiveState();
  await loadBatteryAdvisorContext();
});

defineExpose({
  beginEditTariffPeriod,
  deleteTariffPeriod,
  readBackupFile,
  confirmRestore,
  saveTariffPeriod,
});
</script>

<template>
  <main class="settings-view">
    <header class="settings-view__header settings-card">
      <h1>Einstellungen</h1>
      <p>Änderungen wirken nur für zukünftige Berechnungen. Backup bleibt lokal und Speicher-Szenarien sind Schätzungen.</p>
    </header>

    <section class="settings-card">
      <h2>Preis & Qualität</h2>

      <label class="field">
        <span>Strompreis</span>
        <input id="settings-strompreis" v-model.number="settingsDraft.strompreisEurPerKwh" type="number" step="0.001" min="0" />
      </label>

      <label class="field">
        <span>Einspeisevergütung</span>
        <input id="settings-einspeiseverguetung" v-model.number="settingsDraft.einspeiseverguetungEurPerKwh" type="number" step="0.001" min="0" />
      </label>

      <div class="segmented" role="radiogroup" aria-label="Datenqualitätsmodus">
        <button type="button" :class="['segmented__button', { 'segmented__button--active': settingsDraft.qualityMode === 'relaxed' }]" @click="setQualityMode('relaxed')">relaxed</button>
        <button type="button" :class="['segmented__button', { 'segmented__button--active': settingsDraft.qualityMode === 'balanced' }]" @click="setQualityMode('balanced')">balanced</button>
        <button type="button" :class="['segmented__button', { 'segmented__button--active': settingsDraft.qualityMode === 'strict' }]" @click="setQualityMode('strict')">strict</button>
      </div>

      <p class="helper">Änderungen gelten erst nach dem Speichern.</p>

      <div v-if="settingsError" class="inline-error" role="alert">{{ settingsError }}</div>
      <button type="button" class="primary-action" @click="saveSettings">Einstellungen speichern</button>
    </section>

  <section class="settings-card">
      <h2>Tarifperioden</h2>

      <div v-if="tariffPeriods.length === 0" class="empty-state">
        <p>Noch keine Tarifperiode hinterlegt.</p>
      </div>

      <article v-for="period in tariffPeriods" :key="period.id ?? period.startDay" class="period-card">
        <strong>{{ formatPeriod(period) }}</strong>
        <span>{{ formatPrice(period.strompreisEurPerKwh) }} · {{ formatPrice(period.einspeiseverguetungEurPerKwh) }}</span>
        <div class="period-card__actions">
          <button type="button" class="secondary-action" @click="beginEditTariffPeriod(period)">Bearbeiten</button>
          <button type="button" class="secondary-action" @click="deleteTariffPeriod(period.id)">Löschen</button>
        </div>
      </article>

      <div class="field-grid">
        <label class="field">
          <span>Start</span>
          <input id="tariff-start" v-model="tariffDraft.startDay" type="date" />
        </label>
        <label class="field">
          <span>Ende (optional)</span>
          <input id="tariff-end" v-model="tariffDraft.endDay" type="date" />
        </label>
        <label class="field">
          <span>Strompreis</span>
          <input id="tariff-strompreis" v-model.number="tariffDraft.strompreisEurPerKwh" type="number" step="0.001" min="0" />
        </label>
        <label class="field">
          <span>Einspeisevergütung</span>
          <input id="tariff-einspeiseverguetung" v-model.number="tariffDraft.einspeiseverguetungEurPerKwh" type="number" step="0.001" min="0" />
        </label>
      </div>

      <div v-if="tariffError" class="inline-error" role="alert">{{ tariffError }}</div>
      <button type="button" class="primary-action" @click="saveTariffPeriod">{{ editingTariffPeriodId ? 'Tarifperiode aktualisieren' : 'Tarifperiode speichern' }}</button>
    </section>

    <section class="settings-card">
      <h2>Backup & Restore</h2>
      <button type="button" class="secondary-action" @click="exportBackup">Backup exportieren</button>

      <label class="field">
        <span>Backup-Datei prüfen</span>
        <input id="backup-file" type="file" accept="application/json,.json" @change="readBackupFile(($event.target as HTMLInputElement).files?.[0] ?? null)" />
      </label>

      <div v-if="backupPreview" class="preview-card">
        <p>Schema-Version: {{ backupPreview.schemaVersion }}</p>
        <p>Exportzeitpunkt: {{ backupPreview.exportedAt }}</p>
        <p>Zählerstände: {{ backupPreview.meterReadings }}</p>
        <p>PV-Tage: {{ backupPreview.pvDailyEntries }}</p>
        <p>Tarifperioden: {{ backupPreview.tariffPeriods }}</p>
      </div>

      <div class="restore-actions">
        <button type="button" class="secondary-action" :disabled="!backupPreviewReady" @click="confirmRestore">Vollständigen Restore starten</button>
      </div>

      <p class="helper">{{ backupPreviewReady ? 'Vorschau geprüft. Restore kann bestätigt werden.' : 'Vorschau fehlt oder ist noch nicht geprüft.' }}</p>
      <div v-if="backupError" class="inline-error" role="alert">{{ backupError }}</div>
      <pre v-if="backupExportJson" class="export-json">{{ backupExportJson }}</pre>
    </section>

    <section class="settings-card">
      <h2>App-Info</h2>
      <p>Diese App speichert alles lokal im Browser. Keine Cloud, kein Konto, kein Tracking.</p>
      <p>Schema-Version: {{ schemaVersion }} · App-Version: {{ appVersion }}</p>
    </section>

    <BatteryAdvisorCard v-if="batteryAdvisorSnapshot" :snapshot="batteryAdvisorSnapshot" />

    <p v-if="loading" class="loading-state">Daten werden geladen …</p>
  </main>
</template>

<style scoped>
.settings-view {
  display: grid;
  gap: 16px;
  padding: 16px;
}

.settings-card {
  background: #fff;
  border: 1px solid rgba(31, 41, 55, 0.12);
  border-radius: 20px;
  display: grid;
  gap: 12px;
  padding: 16px;
}

.settings-view__header {
  background: #f7f8f4;
}

.field,
.field-grid,
.segmented,
.restore-actions {
  display: grid;
  gap: 8px;
}

.field span {
  font-weight: 600;
}

.field input,
.primary-action,
.secondary-action,
.segmented__button {
  min-height: 44px;
}

.field input {
  border: 1px solid rgba(31, 41, 55, 0.16);
  border-radius: 16px;
  font: inherit;
  padding: 12px 14px;
}

.field-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.segmented {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.segmented__button,
.primary-action,
.secondary-action {
  border-radius: 16px;
  border: 1px solid rgba(31, 41, 55, 0.16);
  background: #fff;
  font: inherit;
  font-weight: 600;
  padding: 12px 14px;
}

.segmented__button--active,
.primary-action {
  background: #1f6b5c;
  border-color: #1f6b5c;
  color: #fff;
}

.helper,
.preview-card,
.empty-state,
.period-card,
.settings-card--placeholder,
.loading-state {
  color: #6b7280;
}

.period-card,
.preview-card,
.empty-state {
  background: #f7f8f4;
  border-radius: 16px;
  display: grid;
  gap: 6px;
  padding: 12px;
}

.inline-error {
  border-left: 4px solid #b54708;
  color: #b54708;
  padding-left: 12px;
}

.export-json {
  background: #f7f8f4;
  border-radius: 16px;
  overflow: auto;
  padding: 12px;
}

@media (min-width: 720px) {
  .settings-view {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .settings-view__header,
  .settings-card--placeholder,
  .loading-state {
    grid-column: 1 / -1;
  }
}
</style>

---
phase: 03-einstellungen-backup-speicherberater
verified: 2026-05-17T18:31:00Z
status: verified
score: 5/5 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 4/5
  gaps_closed:
    - "Nutzer kann im Speicherberater konservative, realistische, optimistische und theoretische Szenarien mit eigenen Parametern vergleichen."
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Mobile Settings-Flow auf echtem Handy durchlaufen"
    expected: "Navigation, Formularabstände, Eingaben und CTAs bleiben auf einem realen Mobilgerät gut lesbar und ohne Fehlbedienungen nutzbar."
    result: "pass"
    evidence: "03-UAT.md Test 1"
  - test: "Restore-Warnung und Speicherberater-Warntext inhaltlich bewerten"
    expected: "Die Restore-Bestätigung wirkt klar destruktiv und die Poor-Quality-Warnung kommuniziert Unsicherheit verständlich genug für eine Kaufentscheidung."
    result: "pass"
    evidence: "03-UAT.md Test 2"
---

# Phase 3: Einstellungen, Backup & Speicherberater Verification Report

**Phase Goal:** Nutzer koennen Rechenannahmen steuern, lokale Daten sicher migrierbar sichern/wiederherstellen und Speicherpotenzial in Szenarien bewerten.
**Verified:** 2026-05-17T18:31:00Z
**Status:** verified
**Re-verification:** Yes — after gap closure

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Nutzer sieht sinnvolle Standardwerte fuer Strompreis/Einspeisung und kann Preise, Tarifperioden (ohne Ueberlappung) sowie Datenqualitaetsmodus persistent konfigurieren. | ✓ VERIFIED | Quick regression passed: `settingsService.loadSettings()` still falls back to `DEFAULT_APP_SETTINGS` (`src/services/settingsService.ts:74-76`), tariff overlap validation remains in `validateTariffPeriodDraft()` (`src/domain/settings/tariffPeriods.ts:44-102`), and `node --test tests/unit/settingsService.test.ts tests/unit/tariffPeriods.test.ts` passed 4/4 relevant assertions. |
| 2 | Nutzer kann ein vollstaendiges, schema-versioniertes JSON-Backup exportieren. | ✓ VERIFIED | `backupService.exportBackup()` still serializes `schemaVersion`, `exportedAt`, settings, tariffs, meter readings and PV entries (`src/services/backupService.ts:171-182`); `tests/unit/backupService.test.ts` passed export coverage. |
| 3 | Nutzer kann ein gueltiges Backup nach Vorschau und bestaetigtem Voll-Restore importieren; ungueltige Backups werden ohne Datenverlust abgewiesen. | ✓ VERIFIED | `previewBackup()` resets confirmation and blocks missing/invalid files before restore (`src/features/settings/SettingsView.vue:162-195`), `restoreBackup()` requires both preview and checkbox (`src/features/settings/SettingsView.vue:197-210`, `310-315`), and service restore remains fail-closed + transactional (`src/services/backupService.ts:207-241`). |
| 4 | Nutzer kann im Speicherberater konservative, realistische, optimistische und theoretische Szenarien mit eigenen Parametern vergleichen. | ✓ VERIFIED | The former gap is closed: `SettingsView.vue` now derives `advisorContext` from `analysisStore.combined`, quality, range days and saved electricity price (`src/features/settings/SettingsView.vue:60-74`); `BatteryAdvisorCard.vue` watches those basis values and recalculates after a prior run (`src/features/settings/BatteryAdvisorCard.vue:49-64`); `batteryAdvisorService.ts` uses real analysis outputs (`exportKwh`, `selfConsumptionKwh`) plus price/period/efficiency in savings math (`src/services/batteryAdvisorService.ts:8-24`). Manual spot-checks confirmed both analysis-basis sensitivity (`{"low":54.27,"high":66.79}`) and live refresh after settings save (`{"before":"6,68","after":"8,98"}`). |
| 5 | Nutzer sieht pro Szenario jaehrliche Einsparung und Break-even sowie bei schlechter Datenqualitaet eine deutliche Aussagekraft-Warnung. | ✓ VERIFIED | Scenario cards still render yearly savings + break-even (`src/features/settings/BatteryAdvisorCard.vue:119-127`), `createBatteryAdvisorService().calculate()` emits the poor-quality warning from `qualityLevel === 'poor'` (`src/services/batteryAdvisorService.ts:54-60`), and the unit/component regression suite passed 8/8. |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/domain/settings/tariffPeriods.ts` | Überlappungsprüfung und Periodenvalidierung | ✓ VERIFIED | Existence + substantive validation logic for date, price and overlap checks (`44-102`); regression tests passed. |
| `src/services/settingsService.ts` | Save/load-Orchestrierung für Settings und Tarife | ✓ VERIFIED | Persists settings, validates input and orchestrates tariff CRUD against repository (`72-122`). |
| `src/services/backupService.ts` | export/import/preview/restore orchestration | ✓ VERIFIED | Export, preview validation and transactional restore remain implemented (`169-244`). |
| `src/features/settings/SettingsView.vue` | Route-Screen mit Settings, Tarifen, Backup und Advisor | ✓ VERIFIED | Screen wires settings, tariff, backup and advisor flows; advisor context is computed from live analysis + saved settings (`27-32`, `60-74`, `99-210`, `217-323`). |
| `src/features/settings/BatteryAdvisorCard.vue` | Advisor-Eingaben, CTA, Warnung und Ergebnisraster | ✓ VERIFIED | Inputs, calculate CTA, warning render, result cards and reactive recalculation watcher are all present (`17-47`, `49-64`, `79-129`). |
| `src/services/batteryAdvisorService.ts` | savings and break-even calculation | ✓ VERIFIED | Uses combined analysis basis plus user inputs to calculate annual savings and break-even (`8-31`, `42-60`). |
| `tests/e2e/mobile-settings-battery.spec.ts` | mobile proof of advisor integration | ✓ VERIFIED | Mobile smoke covers `/settings`, save, backup preview/restore gate and advisor flow (`58-160`). |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/services/settingsService.ts` | `src/repositories/settingsRepository.ts` | save/load/delete tariff + settings | ✓ WIRED | Service calls `repository.loadSettings`, `saveSettings`, `listTariffPeriods`, `getTariffPeriod`, `saveTariffPeriod`, `deleteTariffPeriod` (`src/services/settingsService.ts:74-120`). |
| `src/services/backupService.ts` | `src/db/database.ts` | transactional full restore | ✓ WIRED | Restore uses Dexie `transaction('rw', ...)`, `clear()` and `bulkAdd()` on all affected tables (`src/services/backupService.ts:218-239`). |
| `src/features/shell/AppShellNav.vue` | `/settings` | bottom nav destination | ✓ WIRED | Nav exposes `RouterLink to="/settings"` (`src/features/shell/AppShellNav.vue:6-10`), and router maps `/settings` to `SettingsView.vue` (`src/router/index.ts:21-27`). |
| `src/features/settings/SettingsView.vue` | `src/features/settings/BatteryAdvisorCard.vue` | context carries analysis basis + live settings | ✓ WIRED | Parent passes `:context="advisorContext"` and `:service="advisorService"` (`src/features/settings/SettingsView.vue:287-289`). |
| `src/features/settings/BatteryAdvisorCard.vue` | `src/services/batteryAdvisorService.ts` | `calculate()` | ✓ WIRED | Card constructs `BatteryAdvisorInput`, calls `service.calculate(input)` and renders returned scenarios (`src/features/settings/BatteryAdvisorCard.vue:29-47`, `119-127`). |
| `src/stores/analysisStore.ts` | `src/services/batteryAdvisorService.ts` | analysis KPIs as savings basis | ✓ WIRED | `analysisStore.loadAnalysis()` populates `combined` and `quality` (`src/stores/analysisStore.ts:85-99`), `SettingsView.vue` maps those into `advisorContext.analysisBasis` (`60-74`), and service consumes them in savings and warning logic (`src/services/batteryAdvisorService.ts:8-24`, `54-60`). |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `src/features/settings/SettingsView.vue` | `advisorContext.analysisBasis` | `analysisStore.combined`, `analysisStore.quality`, `rangeDays()`, `settingsDraft.electricityPriceEurPerKwh` | Yes | ✓ FLOWING |
| `src/features/settings/BatteryAdvisorCard.vue` | `result.value` | `service.calculate({ ...props.context.analysisBasis, analysisPeriodDays: draft.analysisPeriodDays })` | Yes | ✓ FLOWING |
| `src/services/batteryAdvisorService.ts` | `annualSavingsEur`, `breakEvenYears`, `warning` | Combined KPI data + user inputs + price + quality level | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Settings/tariff/backup regression paths | `node --test tests/unit/settingsService.test.ts tests/unit/tariffPeriods.test.ts tests/unit/backupService.test.ts` | 7/7 tests passing | ✓ PASS |
| Advisor regression matrix | `node --test tests/unit/batteryAdvisorService.test.ts tests/component/batteryAdvisorCard.test.ts tests/component/settingsView.test.ts tests/e2e/mobile-settings-battery.spec.ts` | 8/8 tests passing | ✓ PASS |
| Advisor reacts to changed analysis basis | `node --input-type=module -e "...createBatteryAdvisorService()..."` | `{"low":54.27,"high":66.79}` | ✓ PASS |
| Advisor recalculates after settings save without remount | `node --input-type=module -e "...mountVueComponent(SettingsView)..."` | `{"before":"6,68","after":"8,98"}` | ✓ PASS |
| Production build succeeds | `npm run build` | `vite build` completed successfully | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `SET-01` | `03-01`, `03-04` | Nutzer sieht standardmaessig `0.305 EUR/kWh` und `0 EUR/kWh`. | ✓ SATISFIED | `DEFAULT_APP_SETTINGS` is still returned by `loadSettings()` when DB is empty (`src/services/settingsService.ts:74-76`); unit test passes. |
| `SET-02` | `03-01`, `03-04` | Nutzer kann Strompreis und Einspeisewert aendern und fuer kuenftige Berechnungen speichern. | ✓ SATISFIED | `saveSettings()` persists both values through `settingsService.saveSettings()` (`src/features/settings/SettingsView.vue:99-117`). |
| `SET-03` | `03-01`, `03-04` | Nutzer kann Tarifperioden verwalten, ohne dass Zeitraeume sich ueberlappen. | ✓ SATISFIED | Tariff creation/edit/delete exists in UI (`src/features/settings/SettingsView.vue:254-284`); overlap validation remains in `validateTariffPeriodDraft()` (`src/domain/settings/tariffPeriods.ts:71-88`). |
| `SET-04` | `03-01`, `03-04` | Nutzer kann den Datenqualitaetsmodus konfigurieren. | ✓ SATISFIED | Quality mode radios are rendered and saved through `saveSettings()` (`src/features/settings/SettingsView.vue:240-247`, `99-117`). |
| `BKP-01` | `03-02`, `03-04` | Nutzer kann ein vollstaendiges, schema-versioniertes JSON-Backup exportieren. | ✓ SATISFIED | `exportBackup()` emits schema version, timestamp and all collections (`src/services/backupService.ts:171-182`). |
| `BKP-02` | `03-02`, `03-04` | Nutzer kann ein gueltiges Backup nach Vorschau und bestaetigtem Voll-Restore importieren. | ✓ SATISFIED | Preview + confirmation gate are enforced in UI and restore is transactional in service (`src/features/settings/SettingsView.vue:162-210`, `310-315`; `src/services/backupService.ts:218-241`). |
| `BKP-03` | `03-02`, `03-04` | Ungueltige Backups werden ohne Datenverlust abgewiesen. | ✓ SATISFIED | Invalid JSON/schema stop in `parsePayload()` before any mutation (`src/services/backupService.ts:78-116`, `207-216`). |
| `BATT-01` | `03-03`, `03-04` | Nutzer kann vier Szenarien vergleichen. | ✓ SATISFIED | Scenario list remains fixed via `BATTERY_ADVISOR_SCENARIOS` and renders in the card (`src/domain/battery/batteryAdvisorTypes.ts:32-37`; `src/features/settings/BatteryAdvisorCard.vue:119-127`). |
| `BATT-02` | `03-03`, `03-04` | Nutzer kann Speicherpreis, Kapazitaet, Wirkungsgrad und Betrachtungszeitraum setzen. | ✓ SATISFIED | All four inputs are editable in `BatteryAdvisorCard.vue` (`97-115`). |
| `BATT-03` | `03-03`, `03-04` | Nutzer sieht je Szenario jaehrliche Einsparung und Break-even. | ✓ SATISFIED | Savings and break-even are computed in service (`src/services/batteryAdvisorService.ts:19-31`, `42-50`) and rendered in each scenario card (`src/features/settings/BatteryAdvisorCard.vue:123-125`); save-refresh spot-check passed. |
| `BATT-04` | `03-03`, `03-04` | Nutzer sieht bei schlechter Datenqualitaet eine deutliche Warnung. | ✓ SATISFIED | Warning is derived from `qualityLevel === 'poor'` and rendered as an alert (`src/services/batteryAdvisorService.ts:54-60`; `src/features/settings/BatteryAdvisorCard.vue:95`). |

No orphaned Phase-3 requirements were found in `.planning/REQUIREMENTS.md`.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `tests/component/settingsView.test.ts` | 58-109 | Test name claims advisor refresh after save, but assertion only checks updated visible price text. | ⚠️ Warning | Green component tests alone would not have closed the old live-refresh gap; manual spot-check was needed. |
| `tests/e2e/mobile-settings-battery.spec.ts` | 58-160 | Mobile smoke covers the flow, but it does not explicitly assert that already-rendered scenario values changed after save. | ⚠️ Warning | Automated UI coverage is slightly narrower than the behavior implied by the test title. |

### Human Verification

### 1. Mobile Settings-Flow auf echtem Handy

**Test:** Öffne `/settings` auf einem realen Smartphone, ändere Strompreis/Qualitätsmodus, lege eine Tarifperiode an, berechne den Speicherberater und prüfe anschließend Backup-Vorschau + Restore-Checkbox.
**Expected:** Die Abschnitte bleiben klar gegliedert, Eingabefelder sind gut bedienbar, Buttons sind ohne Zoom sicher tappbar und der Flow fühlt sich ohne Verwirrung durchlaufbar an.
**Result:** Pass - in `03-UAT.md` Test 1 als bestanden dokumentiert.

### 2. Restore- und Advisor-Warntexte fachlich bewerten

**Test:** Prüfe die Texte rund um die Restore-Bestätigung und die Poor-Quality-Warnung im Speicherberater mit Blick auf Verständlichkeit und Risikoaufklärung.
**Expected:** Der Restore-Hinweis macht den vollständigen Datenersatz unmissverständlich klar, und die Speicherberater-Warnung signalisiert die eingeschränkte Aussagekraft deutlich genug vor einer Investitionsentscheidung.
**Result:** Pass - in `03-UAT.md` Test 2 als bestanden dokumentiert.

### Gaps Summary

Der zuvor offene Code-Gap im Speicherberater ist geschlossen. Die Analysebasis fließt jetzt aus `analysisStore` über `SettingsView` in die Advisor-Inputs, die Szenariorechnung nutzt reale Kombi-KPIs statt nur Periodenlänge, und ein bereits berechnetes Ergebnis aktualisiert sich nach einem Settings-Save ohne Remount. Die übrigen Phase-3-Bausteine (Settings, Tarife, Backup/Restore) bestehen weiterhin ihre Regressionen.

Automatisiert ist damit kein blocker mehr offen. Die zusaetzliche menschliche UX-Freigabe fuer mobile Nutzbarkeit und Warntext-Klarheit ist jetzt ebenfalls erteilt.

---

_Verified: 2026-05-17T18:31:00Z_
_Verifier: OpenCode (gsd-verifier)_

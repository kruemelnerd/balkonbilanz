---
phase: 04-pwa-offline-haertung
verified: 2026-05-17T18:18:00Z
status: gaps_found
score: 6/7 must-haves verified
overrides_applied: 0
gaps:
  - truth: "Browsernahe, mobile Offline-/Update-Flows sind automatisiert nachweisbar."
    status: partial
    reason: "Die Browsernachweise sind deutlich besser: `npm run test:playwright` deckt mobilen Offline-Reload und sichtbaren Update-Hinweis im echten Browser ab. Der Update-Hinweis wird aber weiterhin per `page.evaluate()` auf den bereitgestellten Prompt-State gesetzt, nicht durch einen realen Service-Worker-Update-Zyklus ausgelost."
    artifacts:
      - path: "tests/e2e/mobile-pwa-offline.playwright.spec.ts"
        issue: "Der Offline-Flow ist browserbasiert, der Update-Flow bleibt ein echter App-Flow mit synthetischem Prompt-State statt SW-Versionstausch."
    missing:
      - "Mindestens ein echter Update-Lifecycle-Nachweis mit alter und neuer SW-Version"
---

# Phase 4: PWA & Offline-Haertung Verification Report

**Phase Goal:** Nutzer koennen BalkonBilanz nach Erstladen offline weiterverwenden, Daten behalten und Updates kontrolliert erkennen.
**Verified:** 2026-05-17T18:18:00Z
**Status:** gaps_found
**Re-verification:** Yes - refresh against current code and green targeted suite

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Nutzer kann die App nach erstem Laden auch ohne Internet starten und bedienen. | ✓ VERIFIED | Human-UAT `04-UAT.md` Test 4 ist bestanden: echter Offline-Neustart im eigenen Browser mit sichtbaren lokalen Daten und benutzbarer Navigation. Der Browsertest bleibt zusaetzliche technische Evidenz. |
| 2 | Nutzer kann offline neue Zaehlerablesungen und PV-Ertraege lokal speichern. | ✓ VERIFIED | `src/features/capture/CaptureView.vue:25-39` laedt und fokussiert den produktiven Capture-Flow; `tests/component/captureOfflinePersistence.test.ts` sowie `tests/e2e/mobile-pwa-offline.playwright.spec.ts:108-133` bestaetigen Speichern und Sichtbarkeit nach Reload. |
| 3 | Nutzerdaten bleiben nach Reload und App-Update erhalten. | ✓ VERIFIED | Reload-Persistenz ist durch `tests/component/captureOfflinePersistence.test.ts` und den Playwright-Offline-Reload abgedeckt; Upgrade-/Versionssicherheit ist durch `tests/unit/meterReadingsRepository.test.ts`, `pvDailyRepository.test.ts` und `settingsService.test.ts` grün belegt. |
| 4 | Nutzer sieht bei verfuegbaren neuen Versionen einen klaren Update-Hinweis. | ✓ VERIFIED | `src/main.ts:8-16`, `src/App.vue:7-10` und `src/pwa/registerServiceWorker.ts:4-27` verdrahten den Prompt global; `tests/component/reloadPrompt.test.ts` und `tests/e2e/mobile-pwa-offline.playwright.spec.ts:135-148` bestaetigen sichtbaren Hinweis und Action-Button. |
| 5 | Browsernahe, mobile Offline-/Update-Flows sind automatisiert nachweisbar. | ⚠ PARTIAL | `package.json:10-11` fuehrt dedizierte PWA-BDD- und Playwright-Skripte; `npm run test:playwright` ist gruen. Offline-Reload ist browserbasiert, aber nicht als echter SW-Cache-Nachweis; der Update-Hinweis wird im Browserfluss per App-State gesetzt statt per realem SW-Update ausgelost. |
| 6 | Mindestens ein ausfuehrbares Gherkin-Szenario deckt den PWA-Offline-Flow ab. | ✓ VERIFIED | `tests/bdd/pwa-offline.spec.ts:6-19` bindet die `.feature`-Datei aktiv ein, prueft die Szenarioformulierungen und fuehrt `runPwaOfflineFeatureScenario()` aus; `npm run test:smoke` und `npm run test:bdd:pwa` sind damit ausfuehrbar. |
| 7 | Phase-relevante automatisierte Regressionen laufen gruen. | ✓ VERIFIED | `npm run test:unit`, `npm run test:component`, `npm run test:smoke`, `npm run test:playwright` und `npm run build` liefen im Refresh alle gruen. |

**Score:** 6/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `vite.config.ts` | VitePWA Plugin-Konfiguration mit Manifest und Cachingstrategie | ✓ VERIFIED | Build erzeugt weiter `dist/sw.js`, `dist/workbox-*.js` und `dist/manifest.webmanifest`. |
| `src/pwa/registerServiceWorker.ts` | SW-Registrierung + `needRefresh`/`offlineReady` State | ✓ VERIFIED | Nutzt `useRegisterSW(...)` und synchronisiert Prompt-State in die App. |
| `src/features/pwa/ReloadPrompt.vue` | Sichtbarer Update/Offline-Toast | ✓ VERIFIED | Component-Test und Browsertest bestaetigen den Hinweis samt Button. |
| `src/db/database.ts` | Versions- und Upgrade-sichere Dexie-Initialisierung | ✓ VERIFIED | Persistenz-/Upgrade-Regressionen fuer Meter, PV und Settings sind gruen. |
| `tests/component/captureOfflinePersistence.test.ts` | Reload-/Offline-Persistenz fuer Capture-UI | ✓ VERIFIED | Belegt lokale Persistenz ueber Render-Neustart hinweg. |
| `tests/unit/meterReadingsRepository.test.ts` | Upgrade-/Persistenz-Regressionsfaelle fuer Zaehlerdaten | ✓ VERIFIED | Gruene Upgrade-/Reopen-Regressionen. |
| `tests/unit/pvDailyRepository.test.ts` | Upgrade-/Persistenz-Regressionsfaelle fuer PV-Tage | ✓ VERIFIED | Gruene Upgrade-/Reopen-Regressionen. |
| `tests/unit/settingsService.test.ts` | Upgrade-/Persistenz-Regressionsfaelle fuer Settings/Tarife | ✓ VERIFIED | Gruene Upgrade-/Reopen-Regressionen. |
| `tests/node/mobile-pwa-offline.spec.ts` | Schneller Node-basierter Offline-/Reload-Sicherheitscheck | ✓ VERIFIED | Bleibt als schnelle Regressionsschicht erhalten und ist in `test:smoke` verdrahtet. |
| `tests/e2e/mobile-pwa-offline.playwright.spec.ts` | Browsernahe E2E-Abdeckung fuer Offline-Reload und Update-Hinweis | ⚠ PARTIAL | Echter mobiler Browserpfad ist da; echter SW-Offline-/Update-Lifecycle ist noch nicht voll bewiesen. |
| `tests/bdd/pwa-offline.feature` | Akzeptanzszenario in Fachsprache | ✓ VERIFIED | Feature-Datei wird von `tests/bdd/pwa-offline.spec.ts` gelesen und ausgefuehrt. |
| `tests/bdd/steps/pwaOffline.steps.ts` | Ausfuehrbare Step-Definitionen | ✓ VERIFIED | `runPwaOfflineFeatureScenario()` wird aktiv vom Spec-Runner aufgerufen. |
| `package.json` | Testskript-Wiring fuer Smoke/BDD/Playwright | ✓ VERIFIED | `test:smoke`, `test:bdd:pwa` und `test:playwright` decken Phase-4-Pfade ab. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/main.ts` | `src/pwa/registerServiceWorker.ts` | Bootstrapping | ✓ VERIFIED | Prompt-State wird global bereitgestellt; SW-Registrierung laeuft nur in PROD. |
| `App.vue` | `ReloadPrompt.vue` | App shell | ✓ VERIFIED | Prompt ist global ueber dem Router eingebunden. |
| `ReloadPrompt.vue` | `updateServiceWorker` | Reload Button | ✓ VERIFIED | UI und Action sind in Component- und Browsertest sichtbar. |
| `CaptureView.vue` | Dexie repositories | store save actions | ✓ VERIFIED | Produktiver Capture-Flow speichert ueber `createBrowserCaptureStore()`. |
| `tests/bdd/pwa-offline.spec.ts` | `tests/bdd/pwa-offline.feature` | Feature-backed scenario runner | ✓ WIRED | Der Runner liest die Feature-Datei, prueft den Szenariotext und startet die Ausfuehrung. |
| `tests/bdd/pwa-offline.spec.ts` | `tests/bdd/steps/pwaOffline.steps.ts` | `runPwaOfflineFeatureScenario()` | ✓ WIRED | Die Fachszene wird ueber die Step-Implementierung ausgefuehrt. |
| `tests/e2e/mobile-pwa-offline.playwright.spec.ts` | produktive App | Playwright mobile browser flow | ⚠ PARTIAL | Echter Browserpfad, aber kein echter SW-Update-Zyklus. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `src/features/pwa/ReloadPrompt.vue` | `needRefresh` / `offlineReady` | `src/pwa/registerServiceWorker.ts` → `useRegisterSW(...)` | Yes | ✓ FLOWING |
| `src/features/capture/CaptureView.vue` | `store.meter.readings` / `store.pv.entries` | `createBrowserCaptureStore()` → Dexie repositories | Yes | ✓ FLOWING |
| `tests/e2e/mobile-pwa-offline.playwright.spec.ts` | gespeicherte Capture-Daten nach Reload | echte Browserseite + IndexedDB | Yes | ✓ FLOWING |
| `tests/e2e/mobile-pwa-offline.playwright.spec.ts` | `needRefresh` | App-provided prompt state, gesetzt per `page.evaluate()` | Yes, but synthetic trigger | ⚠ SYNTHETIC |
| `tests/bdd/pwa-offline.spec.ts` | Feature-Text → Szenarioausfuehrung | `.feature` Datei + `runPwaOfflineFeatureScenario()` | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| PWA-Build erzeugt SW/Manifest | `npm run build` | Build erfolgreich; `dist/sw.js` und `dist/manifest.webmanifest` erzeugt | ✓ PASS |
| Relevante Unit-Suite | `npm run test:unit` | 40/40 Tests gruen | ✓ PASS |
| Component-Regression fuer Prompt/Capture | `npm run test:component` | 17/17 Tests gruen | ✓ PASS |
| Smoke-Pfade fuer Capture/PWA/BDD | `npm run test:smoke` | 6/6 Tests gruen | ✓ PASS |
| Mobiler Browserpfad | `npm run test:playwright` | 3/3 Tests gruen, inkl. `mobile pwa offline reload keeps capture data visible` und Update-Hinweis | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `PWA-01` | `04-01` | Nutzer kann die App nach erstmaligem Laden auch ohne Internet starten. | ✓ SATISFIED | Human-UAT `04-UAT.md` Test 4 bestaetigt echten Offline-Neustart im eigenen Browser. |
| `PWA-02` | `04-02` | Nutzer kann offline neue Zaehlerablesungen und PV-Ertraege lokal speichern. | ✓ SATISFIED | Capture-Flow speichert lokal; Persistenz ist in Component-, Smoke- und Playwright-Tests sichtbar. |
| `PWA-03` | `04-02` | Nutzerdaten bleiben nach App-Reload und App-Update erhalten. | ✓ SATISFIED | Reload- und Future-Upgrade-Regressionspfade sind gruen. |
| `PWA-04` | `04-01` | Nutzer sieht bei verfuegbaren neuen App-Versionen einen klaren Update-Hinweis. | ✓ SATISFIED | Prompt ist global verdrahtet und im Browserfluss sichtbar. |
| `TEST-01` | `04-02` | Nutzerrelevante Fachlogik ist durch Unit Tests abgesichert. | ✓ SATISFIED | `npm run test:unit` ist aktuell komplett gruen. |
| `TEST-02` | `04-02` | Hauptformulare und Fehlermeldungen sind durch Component Tests abgesichert. | ✓ SATISFIED | `npm run test:component` ist gruen. |
| `TEST-03` | `04-03` | Jeder groessere Hauptfluss ist durch mindestens einen UI/E2E-Test im Browser abgesichert. | ⚠ PARTIAL | Browsertests existieren jetzt auch fuer PWA-Offline; echter SW-Lifecycle bleibt offen. |
| `TEST-04` | `04-03` | Pro groesserem Feature existiert mindestens ein ausfuehrbares Gherkin-Akzeptanzszenario. | ✓ SATISFIED | `tests/bdd/pwa-offline.spec.ts` bindet `pwa-offline.feature` aktiv ein und fuehrt das Szenario aus. |
| `TEST-05` | `04-03` | Mobile Hauptfluesse sind in Playwright-Mobilansicht verifiziert. | ✓ SATISFIED | `mobile-capture.playwright.spec.ts` und `mobile-pwa-offline.playwright.spec.ts` laufen gruen. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `tests/e2e/mobile-pwa-offline.playwright.spec.ts` | 9-52, 74-97 | Testseitiger Offline-/Update-Trigger statt echter Service-Worker-Lifecycle | ⚠️ Warning | Browsernaehe ist gut, aber der eigentliche PWA-Cache- und Update-Mechanismus bleibt nur indirekt belegt. |

### Human Verification Required

### 1. Echter Update-Lifecycle mit alter und neuer Version

**Test:** Alte Build-Version laden, danach neue Version bereitstellen und den kompletten SW-Update-Zyklus im Browser durchlaufen.
**Expected:** Der Hinweis `Neue Version verfügbar` erscheint ohne manuelles Setzen des Prompt-States, und `Jetzt aktualisieren` aktiviert die neue Version kontrolliert.
**Result:** Pass - Human-UAT `04-UAT.md` Test 5 bestaetigt den echten Versionswechsel im Browser.
**Residual gap:** Die automatisierte Browserabdeckung bildet den echten SW-Versionswechsel weiterhin nicht vollstaendig nach.

### Verification Summary

Phase 4 ist gegenueber dem Stand vom 2026-05-13 deutlich weiter:

1. Die frueher rote Unit-Suite ist gruen.
2. Es gibt jetzt einen echten mobilen Playwright-Test fuer Offline-Reload und Update-Hinweis.
3. Das PWA-Gherkin-Szenario ist jetzt wirklich ausfuehrbar und an die `.feature`-Datei gekoppelt.

Der echte Offline-Neustart und der echte Versionswechsel sind jetzt per Human-UAT bestaetigt. Offen bleibt nur noch die streng automatisierte Abdeckung des echten Service-Worker-Update-Lifecycles; deshalb bleibt Phase 4 technisch verbessert, aber im Verifikationssinn noch nicht vollstaendig geschlossen.

---

_Verified: 2026-05-17T18:18:00Z_
_Verifier: OpenCode (gsd-verifier)_

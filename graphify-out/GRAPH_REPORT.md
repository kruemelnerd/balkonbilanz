# Graph Report - balkonbilanz_new  (2026-05-17)

## Corpus Check
- 98 files · ~66,601 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1069 nodes · 1907 edges · 84 communities (74 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7ad8203b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]

## God Nodes (most connected - your core abstractions)
1. `flush()` - 33 edges
2. `mountVueComponent()` - 30 edges
3. `PvDailyRecord` - 27 edges
4. `Spec Driven Development: BalkonBilanz` - 27 edges
5. `MeterReadingRecord` - 24 edges
6. `asMeterTimestamp()` - 22 edges
7. `asPvDay()` - 22 edges
8. `setInputValue()` - 18 edges
9. `BalkonBilanzDb` - 16 edges
10. `createAnalysisStore()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `mountShellApp()` --calls--> `createAppRouter()`  [INFERRED]
  tests/e2e/mobile-analysis.spec.ts → src/router/index.ts
- `createMemoryCaptureStore()` --calls--> `createCaptureStore()`  [EXTRACTED]
  tests/support/captureTestUtils.ts → src/stores/captureStore.ts
- `toMeterDraft()` --calls--> `pad()`  [INFERRED]
  src/stores/captureStore.ts → tests/unit/captureStore.test.ts
- `runPwaOfflineFeatureScenario()` --calls--> `createBrowserCaptureStore()`  [EXTRACTED]
  tests/bdd/steps/pwaOffline.steps.ts → src/db/database.ts
- `waitFor()` --calls--> `flush()`  [EXTRACTED]
  tests/e2e/mobile-analysis.spec.ts → tests/support/vueHarness.ts

## Communities (84 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (13): createCacheKey(), executeQuotaErrorCallbacks(), getFriendlyURL(), isInstance(), PrecacheController, PrecacheStrategy, RegExpRoute, StaleWhileRevalidate (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (31): analysisStore, dependencies, qualityReasons, state, store, delayedTarget, id, target (+23 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (37): BACKUP_SCHEMA_VERSION, BackupCounts, BackupExportResult, BackupPayload, BackupPreview, BackupPreviewResult, BackupRestoreFailure, BackupRestoreResult (+29 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (30): additionalURLs, cachedMethods, _cacheNameDetails, cacheNames, cacheOkAndOpaquePlugin, cacheWillUpdate(), canConstructResponseFromBodyStream(), cleanURL (+22 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (24): AnalysisRange, AnalysisRangePreset, AnalysisResult, AnalysisService, AnalysisServiceResult, ranges, resetButton, sevenButton (+16 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (24): BATTERY_ADVISOR_SCENARIOS, BatteryAdvisorAnalysisBasis, BatteryAdvisorInput, BatteryAdvisorResult, BatteryAdvisorScenario, BATTERY_ADVISOR_SCENARIOS, BatteryAdvisorScenarioDefinition, BatteryAdvisorFailure (+16 more)

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (25): asPvDay(), PvDailyRepository, normalizeDayKey(), PvDailyServiceFailureKind, PvDailyServiceSuccess, future, repository, service (+17 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (21): featureText, db, rerenderedStore, store, waitForText(), createBrowserCaptureStore(), db, store (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (22): analysisLink, app, captureLink, container, router, settingsLink, viewStub, window (+14 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (22): analysisStore, anchorPrototype, app, backupFile, calculateButton, capacity, clickedDownloads, container (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (20): calculateCombinedKpis(), CalculateCombinedKpisOptions, round(), uniqueDays(), clampLevel(), evaluateDataQuality(), EvaluateDataQualityOptions, uniqueDays() (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (22): createTariffPeriodRecord(), isFiniteNumber(), isValidDay(), normalizeDay(), overlaps(), TariffPeriodDraftInput, TariffPeriodValidationContext, TariffPeriodValidationFailure (+14 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (24): Alternatives Considered, Architecture, Confidence per Recommendation, Constraints, Conventions, Core, Core Technologies, Dev dependencies (+16 more)

### Community 13 - "Community 13"
Cohesion: 0.11
Nodes (15): createAnalysisService(), cards, headings, hint, rows, store, asMeterTimestamp(), BaseRecord (+7 more)

### Community 14 - "Community 14"
Cohesion: 0.1
Nodes (14): MeterReadingService, MeterReadingServiceFailure, MeterReadingServiceFailureKind, MeterReadingServiceResult, MeterReadingServiceSuccess, PvDailyService, PvDailyServiceFailure, PvDailyServiceResult (+6 more)

### Community 15 - "Community 15"
Cohesion: 0.1
Nodes (9): calculateButton, snapshot, state, backupFile, fileInput, createBatteryAdvisorService(), service, analysisStore (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.12
Nodes (12): MeterReadingRecord, MeterReadingCreateInput, MeterReadingsRepository, MeterReadingUpdateInput, toMeterDraft(), repository, service, expected (+4 more)

### Community 17 - "Community 17"
Cohesion: 0.13
Nodes (14): buildCost(), calculateMeterIntervals(), CalculateMeterIntervalsOptions, differenceInDays(), round(), sumPvKwhForRange(), toDate(), toDay() (+6 more)

### Community 18 - "Community 18"
Cohesion: 0.16
Nodes (12): meterRepository, pvRepository, store, meterRepository, pvRepository, store, today, createMeterReadingService() (+4 more)

### Community 19 - "Community 19"
Cohesion: 0.19
Nodes (16): asRecordTable(), createBrowserAnalysisDependencies(), createBrowserCaptureDependencies(), DatabaseShape, DatabaseTables, DB_VERSION, TABLE_NAMES, createMeterReadingsRepository() (+8 more)

### Community 20 - "Community 20"
Cohesion: 0.14
Nodes (7): countInclusiveDays(), deleteTariffPeriod(), loadBatteryAdvisorContext(), resetTariffDraft(), saveSettings(), saveTariffPeriod(), updateBatteryAdvisorSnapshot()

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (11): addDays(), AnalysisServiceDependencies, clampAnalysisRangePreset(), countInclusiveDays(), createPresetRange(), dayToDate(), formatDay(), isSupportedPreset() (+3 more)

### Community 22 - "Community 22"
Cohesion: 0.15
Nodes (8): CacheExpiration, cacheMatchIgnoreParams(), dontWaitFor(), ExpirationPlugin, isType(), registerQuotaErrorCallback(), removeIgnoredSearchParams(), stripParams()

### Community 23 - "Community 23"
Cohesion: 0.17
Nodes (14): existingReadings, result, createIssue(), isMissingText(), MeterReadingDraftInput, MeterReadingValidationContext, MeterValidationCode, MeterValidationIssue (+6 more)

### Community 24 - "Community 24"
Cohesion: 0.17
Nodes (16): createBrowserSettingsDependencies(), createSettingsRepository(), createTariffPeriodsRepository(), buildSettingsRecord(), createSettingsService(), defaultDependencies(), isQualityMode(), normalizeNumber() (+8 more)

### Community 25 - "Community 25"
Cohesion: 0.12
Nodes (12): BalkonBilanzDb, SettingsRepository, DEFAULT_APP_SETTINGS, db, exported, service, validBackup, currentDb (+4 more)

### Community 26 - "Community 26"
Cohesion: 0.12
Nodes (16): 18. UI-Test-Mapping pro Feature, 1. Ziel der Anwendung, 21. Risiken und Gegenmaßnahmen, 23. Akzeptanzkriterien Gesamtprodukt, 24. Quellen und technische Referenzen, 25. Offene Entscheidungen, 26. Klare Startempfehlung, 2. Zentrale Produktentscheidungen (+8 more)

### Community 27 - "Community 27"
Cohesion: 0.12
Nodes (17): 17.1 Feature: Zählerstand erfassen, 17.2 Feature: PV-Tagesertrag erfassen, 17.3 Feature: Dashboard, 17.4 Feature: Analyse mit Zählerintervallen und PV-Tagesdaten, 17.5 Feature: Speicherberater, 17.6 Feature: Einstellungen und Tarifhistorie, 17.7 Feature: Backup und Restore, 17.8 Feature: PWA Offlinebetrieb (+9 more)

### Community 28 - "Community 28"
Cohesion: 0.16
Nodes (6): getOrCreateDefaultRouter(), hasMethod(), isOneOf(), normalizeHandler(), Route, Router

### Community 29 - "Community 29"
Cohesion: 0.15
Nodes (10): expectedTimestamp, repository, store, draft, meterRepository, repository, store, createCaptureStore() (+2 more)

### Community 30 - "Community 30"
Cohesion: 0.13
Nodes (11): analysisStore, anchorPrototype, backupFile, clickedDownloads, createObjectURLCalls, enabledButton, fileInput, invalidFile (+3 more)

### Community 31 - "Community 31"
Cohesion: 0.13
Nodes (15): 10.1 `MeterReading`, 10.2 `MeterInterval`, 10.3 `SolarDailyGeneration`, 10.4 `TariffPeriod`, 10.5 `Meter`, 10.6 `MeterChangeEvent`, 10.7 `AppSettings`, 10. Datenmodell (+7 more)

### Community 32 - "Community 32"
Cohesion: 0.13
Nodes (15): 12.1 Zählerintervalle, 12.2 Netzbezugskosten, 12.3 Wert eingespeister Energie, 12.4 PV-Tagesertrag, 12.5 Kombination von PV-Tagesdaten und Zählerintervallen, 12.6 Speicher-Szenarien, 12. Berechnungsregeln, code:ts (importKwh = current.importTotalKwh - previous.importTotalKwh) (+7 more)

### Community 33 - "Community 33"
Cohesion: 0.15
Nodes (10): PvDay, RecordTable, PvDailyCreateInput, PvDailyUpdateInput, currentDb, db, FutureDb, futureRepository (+2 more)

### Community 34 - "Community 34"
Cohesion: 0.19
Nodes (11): SettingsRepositoryDependencies, SettingsRepositoryTables, TariffPeriodsRepository, AppSettingsDraftInput, QUALITY_MODES, QualityMode, SETTINGS_ROW_ID, TariffPeriodDraftInput (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.15
Nodes (13): 15.10 Backup & Restore, 15.1 Mobile Navigation, 15.2 Dashboard, 15.3 Zählerstand erfassen, 15.4 Zählerstand-Liste, 15.5 PV-Ertrag erfassen, 15.6 PV-Ertrag-Liste, 15.7 Analyse (+5 more)

### Community 36 - "Community 36"
Cohesion: 0.27
Nodes (3): CacheTimestampsModel, normalizeURL(), openDB()

### Community 37 - "Community 37"
Cohesion: 0.22
Nodes (10): cacheDonePromiseForTransaction(), deleteDB(), getCursorAdvanceMethods(), getIdbProxyableTypes(), instanceOfAny(), promisifyRequest(), transformCachableValue(), unwrap() (+2 more)

### Community 38 - "Community 38"
Cohesion: 0.2
Nodes (10): 19.1 Sprint 0: Projektbasis, 19.2 Sprint 1: Lokale Datenbank, 19.3 Sprint 2: Zählerstand-Erfassung, 19.4 Sprint 3: PV-Tagesertrag-Erfassung, 19.5 Sprint 4: Dashboard, 19.6 Sprint 5: Analyse und Datenqualität, 19.7 Sprint 6: Speicherberater, 19.8 Sprint 7: Einstellungen, Tarifhistorie, Backup (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.22
Nodes (8): app, container, meterButton, pvButton, router, store, viewStub, window

### Community 40 - "Community 40"
Cohesion: 0.22
Nodes (7): TABLE_SCHEMAS, currentDb, db, FutureDb, futureRepository, repository, rereadRepository

### Community 41 - "Community 41"
Cohesion: 0.22
Nodes (9): 13.1 Qualitätsstufen, 13.2 Kriterien, 13.3 Beispielbewertung, 13.4 UI-Anforderung, 13. Datenqualitätsmodell, code:ts (export type DataQualityLevel = 'good' | 'limited' | 'poor';), code:text (Analysezeitraum: 2026-05-01 bis 2026-05-31), code:text (Analysezeitraum: 2026-05-01 bis 2026-05-31) (+1 more)

### Community 42 - "Community 42"
Cohesion: 0.25
Nodes (3): formatQualityReason(), hasCoverageContext(), QualityReasonContext

### Community 43 - "Community 43"
Cohesion: 0.25
Nodes (5): expectedTimestamp, meterRepository, pvRepository, store, today

### Community 44 - "Community 44"
Cohesion: 0.25
Nodes (3): CachedResponse, offlineCache, prompt

### Community 45 - "Community 45"
Cohesion: 0.25
Nodes (8): 16.1 Grundsatz, 16.2 Testpyramide, 16.3 Was zwingend per Unit Test getestet wird, 16.4 Was zwingend per UI-Test getestet wird, 16.5 Mobile-first Testvorgabe, 16.6 Definition of Done pro Feature, 16. TDD-Strategie, code:text (1. Akzeptanzkriterien in Gherkin schreiben)

### Community 46 - "Community 46"
Cohesion: 0.25
Nodes (8): 8.1 Fachlogik außerhalb von Vue-Komponenten, 8.2 Schichtenmodell, 8.3 Pure Functions für Berechnungen, 8. Architekturprinzipien, code:text (DashboardView.vue berechnet direkt Eigenverbrauch, Autarkie ), code:text (batteryAdvisorService.ts berechnet Szenarien.), code:text (UI-Komponenten), code:ts (calculateMeterIntervals(readings: MeterReading[]): MeterInte)

### Community 47 - "Community 47"
Cohesion: 0.29
Nodes (6): feature, intervals, meterReadings, pvDays, quality, result

### Community 48 - "Community 48"
Cohesion: 0.29
Nodes (4): meterForm, meterList, pvForm, pvList

### Community 49 - "Community 49"
Cohesion: 0.29
Nodes (5): db, promptState, reloadedStore, store, waitForText()

### Community 50 - "Community 50"
Cohesion: 0.29
Nodes (5): ciWorkflow, releaseWorkflow, renovateConfig, root, securityWorkflow

### Community 51 - "Community 51"
Cohesion: 0.29
Nodes (3): draft, hasCalculated, hasUsableBasis

### Community 52 - "Community 52"
Cohesion: 0.29
Nodes (7): 3.1 Zählerdaten sind keine Tageswerte, 3.2 PV-Daten sind nur Tageswerte für vergangene Tage, 3.3 Kombinierte Auswertungen sind Näherungen, 3. Fachliche Grundsätze, code:text (01.05.2026 19:15  1.8.0 = 1200,0 kWh  2.8.0 = 50,0 kWh), code:text (Intervall: 01.05.2026 19:15 bis 04.05.2026 07:45), code:text (PV-Ertrag für 2026-05-10: 3,2 kWh)

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (7): 6.1 Empfohlener Stack, 6.2 Warum Vue 3 + Vite, 6.3 Warum nicht Next.js, 6.4 Warum Dexie.js, 6.5 Warum Playwright, 6.6 Warum Lucide, 6. Technologiestack

### Community 54 - "Community 54"
Cohesion: 0.4
Nodes (6): addRoute(), createHandlerBoundToURL(), getOrCreatePrecacheController(), precache(), precacheAndRoute(), registerRoute()

### Community 55 - "Community 55"
Cohesion: 0.4
Nodes (5): exports, registry, require(), singleRequire(), specialDeps

### Community 58 - "Community 58"
Cohesion: 0.33
Nodes (6): 11.1 Datenbankname, 11.2 Tabellen, 11.3 Migrationsprinzip, 11. Dexie-Datenbankschema, code:ts (BalkonBilanzDb), code:ts (export class BalkonBilanzDb extends Dexie {)

### Community 59 - "Community 59"
Cohesion: 0.4
Nodes (3): isArray(), isArrayOfClass(), NavigationRoute

### Community 60 - "Community 60"
Cohesion: 0.4
Nodes (3): featureUrl, meterAction, store

### Community 61 - "Community 61"
Cohesion: 0.4
Nodes (5): 7.1 Phase 1: Lokale Web-App mit DB und Tests, 7.2 Phase 2: Auswertungen und Speicherberater, 7.3 Phase 3: PWA und Offlinebetrieb, 7.4 Warum diese Reihenfolge wichtig ist, 7. Entwicklungsreihenfolge

### Community 62 - "Community 62"
Cohesion: 0.4
Nodes (5): 20.1 Performance, 20.2 Barrierearmut, 20.3 Bedienbarkeit, 20.4 Datenschutz, 20. Qualitätsanforderungen

### Community 63 - "Community 63"
Cohesion: 0.4
Nodes (5): 22. Roadmap, MVP, MVP+, PWA-Release, Spätere Optionen

### Community 66 - "Community 66"
Cohesion: 0.5
Nodes (4): 14.1 Zählerstände, 14.2 PV-Tageswerte, 14.3 Tarifperioden, 14. Plausibilitätsregeln

## Knowledge Gaps
- **437 isolated node(s):** `logger`, `messages$1`, `finalAssertExports`, `validMethods`, `_cacheNameDetails` (+432 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `mountShellApp()` connect `Community 8` to `Community 1`, `Community 7`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `flush()` connect `Community 7` to `Community 4`, `Community 39`, `Community 8`, `Community 9`, `Community 43`, `Community 13`, `Community 15`, `Community 49`, `Community 18`, `Community 60`, `Community 29`, `Community 30`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `createAppRouter()` connect `Community 1` to `Community 8`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `logger`, `messages$1`, `finalAssertExports` to the rest of the system?**
  _437 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
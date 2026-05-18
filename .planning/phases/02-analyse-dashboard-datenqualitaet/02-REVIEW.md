---
phase: 02-analyse-dashboard-datenqualitaet
reviewed: 2026-05-12T09:22:30Z
depth: standard
files_reviewed: 32
files_reviewed_list:
  - src/domain/analysis/intervalTypes.ts
  - src/domain/analysis/calculateMeterIntervals.ts
  - src/domain/analysis/calculateCombinedKpis.ts
  - src/domain/analysis/evaluateDataQuality.ts
  - tests/unit/analysisIntervals.test.ts
  - tests/unit/analysisCombinedKpis.test.ts
  - tests/unit/analysisQuality.test.ts
  - tests/bdd/analysis-quality.feature
  - tests/bdd/steps/analysisQuality.steps.ts
  - src/services/analysis/analysisService.ts
  - src/stores/analysisStore.ts
  - src/features/analysis/AnalysisRangeCard.vue
  - src/features/analysis/IntervalList.vue
  - src/features/analysis/PvDaySummaryList.vue
  - tests/unit/analysisStore.test.ts
  - tests/component/analysisRangeCard.test.ts
  - tests/component/intervalList.test.ts
  - src/router/index.ts
  - src/App.vue
  - src/main.ts
  - src/features/shell/AppShellNav.vue
  - src/features/dashboard/DashboardView.vue
  - src/features/analysis/AnalysisView.vue
  - tests/component/appShellNavRouter.test.ts
  - tests/component/dashboardView.test.ts
  - tests/support/vueHarness.ts
  - package.json
  - tests/bdd/analysis-dashboard.feature
  - tests/bdd/steps/analysisDashboard.steps.ts
  - tests/component/analysisViewStates.test.ts
  - tests/unit/analysisRegression.test.ts
  - tests/e2e/mobile-analysis.spec.ts
findings:
  critical: 0
  warning: 4
  info: 0
  total: 4
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-05-12T09:22:30Z
**Depth:** standard
**Files Reviewed:** 32
**Status:** issues_found

## Summary

Geprueft wurden die Phase-02-Domaenenlogik, Analyse-/Dashboard-Views, Router-Anbindung und die neu hinzugekommenen Tests. Die vorhandenen Phase-02-Tests laufen gruen, aber es bleiben mehrere fachliche und verhaltensrelevante Probleme bei Bereichsfilterung, UI-Texten und Testeinbindung.

## Warnings

### WR-01: Analysebereich filtert Intervalle fachlich falsch

**File:** `src/services/analysis/analysisService.ts:128-130`
**Issue:** Die Filterung vergleicht `interval.end` als kompletten ISO-Zeitstempel direkt mit `fromDay`/`toDay` im Format `YYYY-MM-DD`. Dadurch fallen Intervalle aus dem `toDay` selbst heraus (`2026-05-11T07:00:00.000Z` ist lexikografisch groesser als `2026-05-11`). Zusaetzlich wird ein ganzes Intervall uebernommen, auch wenn dessen `start` vor dem ausgewaehlten `fromDay` liegt, sodass Verbraeuche ausserhalb des gewaehlten Zeitraums in die Auswertung rutschen.
**Fix:** Vor dem Vergleich auf Tagesebene normalisieren (z. B. `toMeterDay(interval.end)`) und Intervalle, die vor `fromDay` beginnen, entweder sauber abschneiden oder explizit als nicht exakt/ungueltig fuer den Bereich ausschliessen. Dazu einen Regressionstest fuer Bereiche wie `2026-05-10..2026-05-11` und `2026-05-10..2026-05-12` ergaenzen.

### WR-02: Live-UI zeigt interne Codewerte statt nutzerverstaendlicher Texte

**File:** `src/domain/analysis/evaluateDataQuality.ts:20-27`, `src/domain/analysis/calculateCombinedKpis.ts:28-35`, `src/features/dashboard/DashboardView.vue:95-112`, `src/features/analysis/AnalysisView.vue:109-117`
**Issue:** Die Domain liefert Gruende und Warnungen als technische Codes wie `pv_coverage_partial`, `minimal_basis` oder `pv_below_export`. Dashboard und Analyse-View rendern diese Werte im Live-Pfad direkt. Damit weicht die echte UI vom spezifizierten deutschen Wording ab und zeigt fuer Nutzer rohe Schluessel statt erklaerender Hinweise.
**Fix:** Eine zentrale Mapping-Funktion von Domain-Codes auf UI-Texte einfuehren und nur diese formatierten Texte rendern. Ergaenzend einen Live-State-Test anlegen, der echte Domain-Ergebnisse statt Snapshot-Strings durch die Views laufen laesst.

### WR-03: Kosten-Fallback ist inkonsistent und im UI irrefuehrend

**File:** `src/domain/analysis/calculateMeterIntervals.ts:70-83`, `src/features/analysis/IntervalList.vue:50-54`
**Issue:** `calculateMeterIntervals()` berechnet auch ohne Tarifbasis immer einen numerischen `costEur`-Wert, obwohl der Status gleichzeitig `unavailable` bleibt. `IntervalList.vue` zeigt ausserdem immer den festen Hinweis `Standardpreis 0.305 EUR/kWh`, selbst wenn fuer ein Intervall tatsaechlich eine andere Tarifbasis verfuegbar waere. Das mischt ehrlichen Fallback mit scheinbar echten Kostenwerten und kann spaetere Verbraucher der API oder die UI in die Irre fuehren.
**Fix:** Bei `costStatus === 'unavailable'` konsequent `costEur: null` liefern und den Hinweistext im UI an `costStatus` bzw. `costBasisEurPerKwh` koppeln. Fuer tarifgestuetzte Intervalle den echten Satz anzeigen, fuer Fallback-Faelle nur einen klar als vorlaeufig markierten Hinweis.

### WR-04: Standard-Testskripte decken die neuen Phase-02-BDD/E2E-Tests nicht ab

**File:** `package.json:6-10`
**Issue:** Die Standard-Skripte referenzieren weiterhin nur die Capture-BDD- und Mobile-Smoke-Tests. Die neuen Analyse-BDDs (`tests/bdd/steps/analysisQuality.steps.ts`, `tests/bdd/steps/analysisDashboard.steps.ts`) und der neue Smoke-Test (`tests/e2e/mobile-analysis.spec.ts`) laufen daher nicht automatisch ueber `npm test` bzw. `npm run test:smoke`.
**Fix:** Die Skripte auf generische Muster wie `tests/bdd/steps/*.ts` und `tests/e2e/*.spec.ts` erweitern oder die neuen Analyse-Tests explizit in die bestehenden Kommandos aufnehmen.

---

_Reviewed: 2026-05-12T09:22:30Z_
_Reviewer: OpenCode (gsd-code-reviewer)_
_Depth: standard_

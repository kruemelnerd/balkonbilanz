# Project Research Summary

**Project:** BalkonBilanz
**Domain:** Local-first, mobile-first Home-Energy-Tracking (Balkonkraftwerk + manueller Zähler/PV-Input)
**Researched:** 2026-05-11
**Confidence:** HIGH

## Executive Summary

BalkonBilanz ist ein local-first Analyseprodukt für Haushaltsstrom, das bewusst mit manuellen Ereignisdaten arbeitet (Zählerablesungen als Zeitpunkte, PV als Tageswerte) statt mit kontinuierlichem Smart-Meter-Streaming. Die Forschung zeigt klar: erfolgreiche Lösungen in diesem Segment sind nicht durch „mehr Automatisierung im MVP“ stark, sondern durch saubere Datenmodelle, ehrliche Unsicherheitskommunikation und robuste Offline-/Backup-Mechanik.

Empfohlen wird ein Vue-3/Vite/TypeScript-Stack mit strikter Schichtentrennung: UI für Interaktion, Use Cases für Workflows, pure Domain-Funktionen für Berechnungen und Dexie-Repositorys für persistente Logik. Die Reihenfolge ist entscheidend: zuerst Datenmodell, Validierung, Intervall- und Analysekern; danach Datenqualitätsmodell und Speicherberater; PWA/Service Worker zuletzt. Damit wird Rechenkorrektheit vor Caching-Komplexität abgesichert.

Die größten Risiken sind Scheingenauigkeit (Intervall- vs. Tagesraster), lokaler Datenverlust und Date/Timezone-Fehler. Diese Risiken sind beherrschbar, wenn Qualitätslabels verpflichtend sind, Backup/Restore früh ausgeliefert wird, und Zeit-/Numerikregeln zentral im Domain-Layer getestet werden (inkl. DST/Mitternacht und Decimal-Arithmetik statt Float).

## Key Findings

### Recommended Stack

Der Stack ist modern, stabil und explizit auf local-only Browserbetrieb ausgelegt: Vue 3.5 + Vite 8 + TypeScript 5 als Kern, Dexie 4 für versionierte IndexedDB-Persistenz, Pinia/Router für App-Orchestrierung, Vitest + Testing Library + Playwright (mit BDD) für testgetriebene Qualität. PWA via `vite-plugin-pwa` ist empfohlen, aber bewusst zeitlich nachgelagert.

**Core technologies:**
- **Vue 3.5.x:** UI-Framework für mobile-first SPA — stabiler Standard mit starker TS-Integration.
- **Vite 8.x:** Build/Dev-Tooling — schnell, wenig Boilerplate, exzellente Vue- und Test-Integration.
- **TypeScript 5.x:** Domänen- und Validierungssicherheit — reduziert teure Rechen-/Regressionsfehler.
- **Dexie 4.4.x:** IndexedDB-Abstraktion — produktive, migrationsfähige lokale Persistenz statt fehleranfälliger nativer API.

Kritische Versionsthemen: `vite@8` mit `@vitejs/plugin-vue@6` und `vitest@4.1`; `chart.js@4` mit `vue-chartjs@5`; PWA-Plugin erst in späterer Phase aktivieren.

### Expected Features

**Must have (table stakes):**
- Ereignisbasierte Zählererfassung (1.8.0/2.8.0 + Timestamp) und Intervallberechnung inkl. kWh/Tag-Normalisierung.
- PV-Tageserfassung (nur Vergangenheit), Dashboard und Analyseansicht mit Zeitraumfilter.
- Plausibilitätsvalidierung (inkl. sinkender Werte/Zählerwechsel-Flow), Preis-/Tarifeinstellung (mind. aktueller Tarif).
- Versioniertes Backup/Restore als Kernfunktion des local-first Versprechens.

**Should have (competitive):**
- Datenqualitätsmodell (`good/limited/poor`) mit sichtbarer Begründung.
- Näherungsbewusste Kombinationslogik (Intervallstrom + PV-Tage) mit transparenter Unsicherheit.
- Speicherberater mit Szenarien (konservativ/realistisch/optimistisch/theoretisch), Wirkungsgrad und Break-even.

**Defer (v2+):**
- Auto-Import (Solakon/Growatt), OCR/IR/SML-Auslese.
- Exakte zeitreihenbasierte Batteriesimulation.
- Cloud-Account/Sync als Standard, dynamische Tarife im MVP.
- Mehrzähler-/Mehranlagenfähigkeit und erweiterte Reports.

### Architecture Approach

Die Zielarchitektur ist ein klarer Layer- und Feature-Slice-Ansatz: Vue-UI → Pinia/Use Cases → deterministischer Domain-Kern → Repositorys → Dexie; PWA als isolierte spätere Schicht. Kerngedanke: Fachlogik nie in Komponenten, sondern als pure, 100% unit-testbare Funktionen. Writes erfolgen atomar über Dexie-Transaktionen, und Use Cases sprechen nur gegen Repository-Interfaces (Ports-and-Adapters light), was Testbarkeit und Migrationssicherheit maximiert.

**Major components:**
1. **UI Layer (Views/Components)** — Eingabe, Feedback, Visualisierung; keine Business-Algorithmen.
2. **Application Layer (Stores/Use Cases)** — Workflow-Orchestrierung, Async-/Fehlerzustände.
3. **Domain Layer (pure functions)** — Intervall-, Qualitäts-, Tarif- und Speicherszenario-Berechnungen.
4. **Data Layer (Repositories + Dexie)** — versionierte Persistenz, Migrationspfade, atomare Writes.
5. **PWA Layer (später)** — App-Shell-Offlinefähigkeit und kontrollierter Update-Flow.

### Critical Pitfalls

1. **Scheingenauigkeit aus falschem Zeitraster** — Intervall- und Tagesdaten nicht als gleichwertige Messwerte behandeln; Kombi-KPIs immer als Näherung mit Qualitätslabel/Begründung.
2. **Lokaler Datenverlust** — Backup/Restore nicht verschieben; versioniertes JSON, Schema-Validierung, Quota-Fehlerpfade und Backup-Hinweise einbauen.
3. **Date/Timezone-Grenzfehler** — PV als lokales Datum, Zähler als Timestamp mit Offset, zentrale Date-Utils + DST/Mitternacht-Tests.
4. **Zählerwechsel nicht modelliert** — `MeterChangeEvent` als First-Class-Fall, negativer Verlauf nur mit dokumentiertem Wechsel.
5. **Zu frühe PWA/SW-Aktivierung** — erst nach stabiler Kernlogik; kontrollierte Cache-/Update-Strategie mit E2E-Regression.

## Implications for Roadmap

Basierend auf den Abhängigkeiten aus Features, Architektur und Pitfalls wird eine 4-Phasen-Struktur empfohlen.

### Phase 1: Domain Foundation & Capture MVP
**Rationale:** Alle späteren Funktionen hängen von korrekten Ereignis-/Intervallregeln, Numerik und Zeitlogik ab.
**Delivers:** Domänentypen, Date-/Decimal-Utilities, Dexie-Schema v1, Repository-Interfaces, Zähler- und PV-Erfassung mit Kernvalidierung.
**Addresses:** Zählerereignisse, PV-Tageserfassung, Plausibilitätsregeln (P1).
**Avoids:** Pitfalls 1, 3, 6, 7 (Scheingenauigkeit-Basis, Zeitbugs, UI-Fachlogik, Float-Fehler).

### Phase 2: Analytics, Quality & Trust Layer
**Rationale:** Erst nach stabiler Datenerfassung kann belastbare Analyse entstehen.
**Delivers:** Dashboard + Analysefluss, Intervallaggregation, Kostenlogik (Tarif), Datenqualitätsmodell mit Explainability, Zählerwechsel-Flow.
**Uses:** Pinia-Orchestrierung, Domain-Services, Chart.js für Visualisierung.
**Implements:** Analyse-, Tarif- und Qualitätskomponenten aus `features/analytics`, `settings`, `meter-readings`.
**Addresses:** Basisanalyse, Preisbezug, Datenqualität (P1/P2).
**Avoids:** Pitfalls 1, 4, 7 (falsche KPI-Interpretation, negative Intervalle, Rundungsdrift).

### Phase 3: Resilience & Advisor
**Rationale:** Produktnutzen skaliert erst mit Datensicherheit und entscheidungsorientierter Beratung.
**Delivers:** Versioniertes Backup/Restore, Restore-Validierung, Backup-Hinweise; Speicherberater-Szenarien inkl. Unsicherheitskontext.
**Addresses:** Backup/Restore (P1), Speicherberater und ggf. Tarifhistorie (P2).
**Avoids:** Pitfalls 2 und 4 (Datenverlust, inkonsistente Historie) sowie UX-Fehlentscheidungen durch fehlende Kontextwarnungen.

### Phase 4: PWA Hardening & Optional Extensions
**Rationale:** SW/Caching erst nach fachlicher Stabilität und Regressionstests.
**Delivers:** PWA-App-Shell, kontrollierter Update-Flow, Offline-Start, Update-Persistenztests; optionale Exporte/Erweiterungen.
**Addresses:** PWA-Layer und spätere Komfortfeatures (P3/v2+).
**Avoids:** Pitfall 5 (stale app, Cache-Chaos, DB-/Code-Mismatch).

### Phase Ordering Rationale

- Die Reihenfolge folgt harten Datenabhängigkeiten: Capture → Analyse → Beratung → PWA.
- Sie spiegelt die Architekturgrenzen wider (Domain/Data stabil vor UI- und Runtime-Härtung).
- Sie minimiert die größten Projektrisiken früh (Datenwahrheit, Datenverlust, Zeit-/Numerikfehler).

### Research Flags

Phasen likely needing deeper research during planning:
- **Phase 2:** Qualitätsscoring-Design (Schwellenwerte/Heuristik) und Tarif-Intervall-Split-Strategien bei längeren Intervallen.
- **Phase 3:** Speicherberater-Formelkalibrierung (Annahmen, Szenariogrenzen, sensible Defaults für Wirkungsgrad/Preis).
- **Phase 4:** Finale SW-Update-Policy (Prompt vs. autoUpdate), um UX und Sicherheit zu balancieren.

Phasen mit standard patterns (skip research-phase):
- **Phase 1:** Vue/Vite/TS + Dexie-Grundstruktur, Repository-Pattern und Unit-Test-Pyramide sind gut dokumentiert.
- **Große Teile von Backup/Restore-Basis:** versioniertes JSON + Schema-Validierung folgen etablierten Mustern.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Aktuelle Versionen und Kompatibilitäten aus offiziellen Docs/Registries klar belegt. |
| Features | HIGH | Hohe Deckung durch Projektspezifikation + etablierte Energieprodukt-Referenzen. |
| Architecture | HIGH | Muster sind reif (Ports/Adapter, pure domain, transactional writes) und passen exakt zu local-first Constraints. |
| Pitfalls | HIGH | Risiken sind konkret, praxisnah und mit belastbaren Präventionsmustern hinterlegt (MDN/Dexie/web.dev). |

**Overall confidence:** HIGH

### Gaps to Address

- **Qualitätsmodell-Parameterisierung:** Schwellen für `good/limited/poor` sind noch produktseitig zu kalibrieren → in Phase-2-Planung explizit als Discovery-Task.
- **Tarifhistorie vs. MVP-Kostenlogik:** Endtarif-Shortcut ist kurzfristig akzeptabel, aber verzerrungsanfällig → Roadmap-Item für anteilige Tarif-Splits vorm breiteren Rollout.
- **Langzeit-Backup-UX:** Reminder-Frequenz, Import-Feedback bei großen Dateien und Fehlermeldungstexte sollten mit Nutzertests validiert werden.

## Sources

### Primary (HIGH confidence)
- `.planning/research/STACK.md`
- `.planning/research/FEATURES.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/PITFALLS.md`
- Context7: `/vitejs/vite`, `/vitest-dev/vitest`, `/microsoft/playwright`, `/dexie/dexie.js`, `/vite-pwa/vite-plugin-pwa`
- Official docs: Dexie, vite-plugin-pwa, MDN Storage quotas/eviction, web.dev service worker lifecycle

### Secondary (MEDIUM confidence)
- Home Assistant Energy docs
- SolarAssistant docs (Dashboard/Export/Backup)
- OpenEnergyMonitor / emonCMS docs index

### Tertiary (LOW confidence)
- Keine relevanten Low-Confidence-Quellen in den Research-Dateien ausgewiesen.

---
*Research completed: 2026-05-11*
*Ready for roadmap: yes*

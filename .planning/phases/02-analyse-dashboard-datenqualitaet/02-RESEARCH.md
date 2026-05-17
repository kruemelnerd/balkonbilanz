# Phase 2: Analyse, Dashboard & Datenqualitaet - Research

**Researched:** 2026-05-12
**Domain:** Local-first Energieanalyse (Intervalle, Kosten, kombinierte KPI-Naeherung, Datenqualitaet) in Vue 3 + Dexie
**Confidence:** HIGH

## User Constraints (from CONTEXT.md)

### Locked Decisions

### Datenqualitaet
- **D-01:** `good` folgt einem ausgewogenen Modell statt einer ultrastrengen Nur-Ueberlappungs-Logik; kleinere Luecken duerfen also vorkommen, solange der Zeitraum insgesamt belastbar wirkt.
- **D-02:** Zaehlerintervalle mit mehr als 7 Tagen Laenge muessen die Qualitaet spaetestens nach unten ziehen und als konkreter Grund sichtbar werden.
- **D-03:** Fehlende PV-Tage fliessen ueber eine Vollstaendigkeitsquote des gewaehlten Zeitraums in `good`/`limited`/`poor` ein, nicht ueber ein hartes Einzel-Luecken-Verbot.
- **D-04:** Bei `poor` bleiben kombinierte KPIs sichtbar, werden aber deutlich abgegraut und mit einer klaren Warnung eingeordnet.

### KPI-Naeherung
- **D-05:** Kombinierte KPIs sollen bei unsicherer Datenlage moeglichst neutral wirken, also weder bewusst konservativ noch bewusst optimistisch.
- **D-06:** Fuer Schaetzungen duerfen Zaehlerintervalle und PV-Tage grob auf Zeitraumsebene zusammengebracht werden; eine strikt saubere Teilueberlappung pro Tag ist nicht zwingend.
- **D-07:** Kombinierte KPIs duerfen bereits mit minimaler Basis erscheinen, sobald mindestens ein relevantes Zaehlerintervall und ein PV-Tag vorhanden sind; die Qualitaetsstufe traegt die Unsicherheit.
- **D-08:** Wenn im gewaehlten Zeitraum der erfasste PV-Ertrag kleiner als die Einspeisung ist, bleiben kombinierte KPIs sichtbar, aber mit Plausibilitaetswarnung und downgradeter Qualitaet.

### Zeitraumsteuerung
- **D-09:** Die Analyse oeffnet standardmaessig mit den letzten 30 Tagen.
- **D-10:** Der Zeitraumblock bietet Schnell-Presets fuer 7, 30 und 90 Tage plus freie Datumswahl.
- **D-11:** `Filter zuruecksetzen` bringt die Analyse auf den Standardzeitraum zurueck, nicht auf einen leeren oder gemerkten Sonderzustand.
- **D-12:** Intervall-Ergebnisse werden standardmaessig `neueste zuerst` sortiert, passend zu den bestehenden Phase-1-Listen.

### Kostenbasis
- **D-13:** Phase 2 rechnet Netzbezugskosten zunaechst mit dem Projekt-Standardwert `0.305 EUR/kWh`; spaetere Tarifdaten duerfen diese Basis ueberschreiben.
- **D-14:** Diese vorlaeufige Standardpreis-Basis wird nur in einem Detailhinweis kenntlich gemacht, nicht als laute Primarmarkierung im Hauptwert.
- **D-15:** Die Kostenlogik soll fachlich bereits auf `gueltiger Tarif je Intervall` ausgerichtet werden, statt mit einem einzigen Preis pro Gesamtzeitraum zu denken.
- **D-16:** Wenn fuer ein Intervall keine belastbare Kostenbasis vorliegt, zeigt die UI `Kosten noch nicht verfuegbar` statt `0 EUR` oder scheinbar exakter Werte.

### OpenCode's Discretion
- Die exakten Schwellenbaender innerhalb des ausgewogenen Qualitaetsmodells, solange die 7-Tage-Regel, Vollstaendigkeitsquote und sichtbaren Gruende erhalten bleiben.
- Die konkrete Mikrocopy fuer Qualitaetsgruende, Plausibilitaetswarnung und Standardpreis-Hinweis, solange `Naeherung`/`Schaetzung` und ehrliche Einordnung erhalten bleiben.
- Das genaue UI-Layout von Preset-Chips, Datumsfeldern und Reset-Bestaetigung, solange Default, Presets und Reset-Ziel den oben festgelegten Entscheidungen folgen.

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INT-01 | Intervall mit Start/Ende/Dauer | Intervall-Service als pure Funktion + sortierte Ausgabe + Periodenfilter |
| INT-02 | Netzbezug/Einspeisung pro Intervall | Delta-Logik auf kumulierten Zaehlerstaenden, getrennt von PV-Tagesdaten |
| INT-03 | kWh/Tag normalisiert | Dauerberechnung in Tagen + Guard gegen 0/negative Dauer |
| INT-04 | Kosten je gueltigem Tarif | Tarifauflosung pro Intervall + Fallback-Text wenn Tarif fehlt |
| INT-05 | Plausibilitaetswarnung | Intervall-Warnregeln als nicht-blockierende Flags |
| DASH-01 | Dashboard leerer Zustand | Locked UI-Copy und Quick Actions aus UI-SPEC |
| DASH-02 | Dashboard mit letzten Werten/KPIs | Recency-Karten + Hero-KPI + Qualitaetskarte |
| ANLY-01 | Zeitraum waehlbar, Intervallanzeige | 7/30/90 Presets + DateRange + Reset auf 30 Tage |
| ANLY-02 | PV als Tageswerte getrennt | Separater PV-Block, niemals zeilenweise mit Intervallen mergen |
| ANLY-03 | Kombinierte KPI als Schaetzung | Sichtbares Label `Schaetzung`/`Naeherung`, neutraler Ton |
| ANLY-04 | Erklaerender Naeherungs-Hinweis | Fester Hint-Text nahe KPI + Qualitaetskarte |
| QUAL-01 | Quality-Level good/limited/poor | Balanced-Scoringmodell mit expliziten Schwellwerten |
| QUAL-02 | Konkrete Gruende | Reason-Codes (fehlende PV-Tage, lange Intervalle, geringe Basis) |
| QUAL-03 | Warnung bei PV < Einspeisung | Dedizierte persistente Warnkarte oberhalb kombinierter KPIs |

</phase_requirements>

## Summary

Phase 2 sollte als **Analyse-Schicht auf bestehender Capture-Architektur** gebaut werden: Komponente -> Store -> Service -> Repository/Dexie, mit fachlichen Berechnungen als pure Funktionen ausserhalb der Vue-SFCs. Dieses Muster ist im Projekt bereits etabliert und reduziert Regressionen in Phase 1-Flows. [VERIFIED: .planning/phases/02-analyse-dashboard-datenqualitaet/02-CONTEXT.md]

Fuer Planung entscheidend: Die Diskussion hat zentrale Produktentscheidungen bereits fixiert (Balanced-Qualitaet, 30-Tage-Default, Presets 7/30/90, Kostenhinweis statt lauter Warnung, KPIs auch bei `poor` sichtbar). Der Plan muss diese Entscheidungen als harte Akzeptanzkriterien behandeln, nicht erneut diskutieren. [VERIFIED: .planning/phases/02-analyse-dashboard-datenqualitaet/02-CONTEXT.md]

Test- und Delivery-Implikation: Laut AGENTS ist TDD/Spec-Driven mit Unit+Component+UI/E2E+Gherkin verpflichtend; gleichzeitig ist `workflow.nyquist_validation=false`, daher keine Nyquist-Validierungsarchitektur fuer diese Research-Ausgabe erforderlich. [VERIFIED: AGENTS.md] [VERIFIED: .planning/config.json]

**Primary recommendation:** Plane Phase 2 als 4 Streams: (1) Domain-Berechnung/Qualitaet, (2) Analyse-State/Zeitraumsteuerung, (3) Dashboard+Analyse-UI laut UI-SPEC, (4) abgestufte Testpyramide mit fruehen Unit-Oracle-Tests.

## Project Constraints (from AGENTS.md)

- Tech-Stack-Ziel: Vue 3 + Vite + TypeScript + Vue Router + Pinia + Dexie + Tailwind + Lucide + Chart.js. [VERIFIED: AGENTS.md]
- Datenhaltung ausschliesslich lokal in IndexedDB (Dexie), ohne Cloud/Account. [VERIFIED: AGENTS.md]
- Kombinierte Auswertungen duerfen keine Scheingenauigkeit erzeugen (kumulierte Zaehler + tagesbasierte PV). [VERIFIED: AGENTS.md]
- Mobile-first UX mit klarer Validierung/schneller Erfassung. [VERIFIED: AGENTS.md]
- TDD/Spec-Driven, verpflichtende Testabdeckung inkl. Gherkin. [VERIFIED: AGENTS.md]
- PWA/Service Worker erst nach stabiler Fachlogik. [VERIFIED: AGENTS.md]
- Kein Tracking/keine externen Requests als funktionale Zielabhaengigkeit. [VERIFIED: AGENTS.md]
- Projektphase folgt tdd-workflow (RED->GREEN->REFACTOR). [VERIFIED: AGENTS.md] [VERIFIED: .opencode/skills/tdd-workflow/SKILL.md]

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vue | 3.5.34 | UI/Reactive Layer | Bestehende App-Basis und aktuelle stabile Version im Projekt. [VERIFIED: npm registry] |
| vite | 8.0.12 (target), repo aktuell 7.2.4 | Build/Dev | Projektleitlinie nennt Vite als Standard; Upgrade kann separat geplant werden. [VERIFIED: AGENTS.md] [VERIFIED: npm registry] [VERIFIED: package.json] |
| dexie | 4.4.2 (target), repo aktuell 4.2.1 | IndexedDB-Abstraktion | Lokale Persistenzpflicht + robustere Query/Live-Patterns als native IndexedDB. [VERIFIED: AGENTS.md] [CITED: https://dexie.org/docs/Tutorial/Design] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vue-router | 5.0.6 | Navigation Dashboard/Erfassung/Analyse | Mit neuem App-Shell-Navigationsvertrag in Phase 2. [VERIFIED: npm registry] [CITED: https://github.com/vuejs/router/blob/main/packages/docs/guide/essentials/history-mode.md] |
| pinia | 3.0.4 | Analyse-/UI-Querschnittszustand | Fuer Filter, loading/error-state und derived selectors. [VERIFIED: npm registry] [CITED: https://github.com/vuejs/pinia/blob/v4/README.md] |
| chart.js + vue-chartjs | 4.5.1 + 5.3.3 | KPI-/Trendvisualisierung | Nur falls Phase-2-Plan Charts explizit vorsieht; responsiv via container control. [VERIFIED: npm registry] [CITED: https://context7.com/chartjs/chart.js/llms.txt] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pinia global store | reine Composables | Weniger Overhead, aber schlechter fuer screen-uebergreifenden UI-State und Testbarkeit bei wachsender App. [ASSUMED] |
| Chart.js | KPI nur als Textkarten | Schnellere Umsetzung; weniger visuelle Trend-Erkennbarkeit. [ASSUMED] |

**Installation:**
```bash
npm install vue-router pinia chart.js vue-chartjs
```

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── domain/analysis/          # pure functions: interval, cost, quality, combined KPI
├── services/analysis/        # orchestration (period filter, tariff resolution)
├── stores/analysisStore.ts   # UI-facing state for dashboard/analyse
├── features/dashboard/       # Dashboard cards + empty state
├── features/analysis/        # Zeitraum, Intervallliste, KPI, warnings
└── router/                   # app shell navigation (dashboard/erfassung/analyse)
```

### Pattern 1: Pure domain functions + thin orchestration
**What:** Berechnungen (Intervalle/Kosten/Qualitaet) sind pure und deterministic; Store/Service orchestrieren nur Datenfluss. [VERIFIED: .planning/phases/02-analyse-dashboard-datenqualitaet/02-CONTEXT.md]
**When to use:** Immer bei INT-01..05, ANLY-03..04, QUAL-01..03.
**Example:**
```typescript
// Source: existing domain rule style in spec + code context
const importKwh = current.importTotalKwh - previous.importTotalKwh
const exportKwh = current.exportTotalKwh - previous.exportTotalKwh
```

### Pattern 2: Derived UI state via computed/selectors
**What:** UI-Karten sollten aus zentralem State abgeleitet werden statt duplizierter Berechnungen in Komponenten. [CITED: https://github.com/vuejs/pinia/blob/v4/README.md] [CITED: https://github.com/vuejs/vue/blob/main/examples/composition/todomvc.html]
**When to use:** Dashboard-Hero, QualityStatusCard, graue KPI-States bei `poor`.

### Pattern 3: Router shell with 3 mobile destinations
**What:** Bottom-Navigation mit `Dashboard`, `Erfassung`, `Analyse` als app shell contract. [VERIFIED: .planning/phases/02-analyse-dashboard-datenqualitaet/02-UI-SPEC.md]
**When to use:** Phase-2 Einstieg in `Dashboard`; bestehende Erfassungsansicht bleibt intakt.

### Anti-Patterns to Avoid
- **PV+Intervall row-by-row mergen:** Fuehrt zu Scheingenauigkeit; stattdessen getrennte Darstellung + explizite Naeherungslabel. [VERIFIED: AGENTS.md] [VERIFIED: .planning/phases/02-analyse-dashboard-datenqualitaet/02-UI-SPEC.md]
- **`0 EUR` bei fehlender Kostenbasis:** Muss als `Kosten noch nicht verfuegbar` angezeigt werden. [VERIFIED: .planning/phases/02-analyse-dashboard-datenqualitaet/02-CONTEXT.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB low-level API | Eigene IDB wrapper mit Request/Transaction-Boilerplate | Dexie table/where/transaction API | Weniger Fehler bei Queries/Migrationen. [CITED: https://dexie.org/docs/Tutorial/Design] |
| Reaktives DB polling | setInterval-basierte Poller | Dexie `liveQuery()` | Event-getriebene Updates statt Polling. [CITED: https://dexie.org/docs/liveQuery%28%29] |
| Global cross-view state wiring per props/events | Tiefes Prop-Drilling | Pinia stores | Skaliert besser fuer 3-Screen app shell. [CITED: https://github.com/vuejs/pinia/blob/v4/README.md] |

**Key insight:** Der Risikohebel in Phase 2 liegt in fachlicher Konsistenz (Naeherung + Qualitaet), nicht in custom Infrastruktur.

## Common Pitfalls

### Pitfall 1: Exaktheit suggerieren bei gemischten Datengranularitaeten
**What goes wrong:** KPI-Werte wirken wie genaue Zeitreihenmathematik.
**Why it happens:** Zaehlerintervalle (kumuliert) und PV-Tageswerte werden implizit gleichgesetzt.
**How to avoid:** Immer `Schaetzung/Naeherung` labeln und Erklaerhinweis anzeigen.
**Warning signs:** UI-Text ohne Unsicherheitsmarker. [VERIFIED: AGENTS.md] [VERIFIED: 02-UI-SPEC.md]

### Pitfall 2: Qualitaetsmodell als harte Blockade statt Einordnung
**What goes wrong:** Bei lueckigen Daten werden KPIs komplett versteckt.
**How to avoid:** Bei `poor` sichtbar lassen, aber abgegraut + Warnung + Gruende.
**Warning signs:** Empty card statt degraded card. [VERIFIED: 02-CONTEXT.md]

### Pitfall 3: Kosten falsch als globaler Zeitraumspreis
**What goes wrong:** Intervallkosten werden unzutreffend mit einem einzigen Tarif gerechnet.
**How to avoid:** Tarifaufloesung pro Intervall; ohne Basis explizit Nicht-Verfuegbarkeit.
**Warning signs:** `0 EUR` oder stiller Fallback ohne Hinweis. [VERIFIED: 02-CONTEXT.md]

## Code Examples

### Router setup fuer Phase-2-App-Shell
```typescript
// Source: https://github.com/vuejs/router/blob/main/packages/docs/guide/essentials/history-mode.md
import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: () => import('../features/dashboard/DashboardView.vue') },
    { path: '/capture', component: () => import('../features/capture/CaptureView.vue') },
    { path: '/analysis', component: () => import('../features/analysis/AnalysisView.vue') }
  ]
})
```

### Pinia Setup Store fuer Analysefilter
```typescript
// Source: https://context7.com/vuejs/pinia/llms.txt
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAnalysisStore = defineStore('analysis', () => {
  const rangeDays = ref(30)
  const from = ref<Date | null>(null)
  const to = ref<Date | null>(null)
  const effectiveRange = computed(() => ({ rangeDays: rangeDays.value, from: from.value, to: to.value }))
  function resetFilter() { rangeDays.value = 30; from.value = null; to.value = null }
  return { rangeDays, from, to, effectiveRange, resetFilter }
})
```

### Dexie Query fuer Zeitraum-Subset
```typescript
// Source: https://dexie.org/docs/Tutorial/Design
const rows = await db.meterReadings
  .where('timestamp')
  .between(fromIso, toIso, true, true)
  .toArray()
```

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Reine Composables sind in Phase 2 schlechter skalierend als Pinia fuer Cross-view-State | Standard Stack / Alternatives | Mittel - koennte zu Overengineering fuehren |
| A2 | Charts sind optional und textuelle KPI-Karten koennen reichen | Standard Stack / Alternatives | Niedrig - betrifft nur UI-Umfang |

## Open Questions (RESOLVED)

1. **Soll Vite in Phase 2 auf 8.x angehoben werden oder in separatem Tech-Debt-Task bleiben?**
   - Resolution: Kein Vite-Upgrade in Phase 2 einplanen. Die Phase bleibt auf dem aktuellen Repo-Stand, solange kein konkreter Umsetzungsblocker auftritt. Ein moegliches Upgrade bleibt separater Tech-Debt- oder Vorbereitungs-Task ausserhalb des Phase-2-Scopes.
   - Basis: Phase-2-Ziel und Context priorisieren Analyse-, Qualitaets- und UI-Lieferumfang statt Stack-Migration. [VERIFIED: .planning/ROADMAP.md] [VERIFIED: .planning/phases/02-analyse-dashboard-datenqualitaet/02-CONTEXT.md]

2. **Werden in Phase 2 bereits echte Tarifperioden persistiert oder nur Fallbackkosten gerechnet?**
   - Resolution: Phase 2 fuehrt keine Tarifverwaltung und keine persistierte Tarifhistorie ein. Geplant wird stattdessen eine tariffaehige Kosten-Engine mit Default `0.305 EUR/kWh`, ehrlichem `Kosten noch nicht verfuegbar`-Fallback und spaeter anschlussfaehiger Intervall-API.
   - Basis: Tarifverwaltung bleibt laut Phase Boundary ausserhalb dieser Phase; D-13 bis D-16 verlangen jedoch eine costs engine, die bereits in Intervallen denkt. [VERIFIED: .planning/phases/02-analyse-dashboard-datenqualitaet/02-CONTEXT.md]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| node | Vite/Vue build + tests | ✓ | v22.20.0 | — |
| npm/npx | dependency install + scripts | ✓ | 11.10.0 | — |
| playwright runtime | mobile smoke/e2e | ✓ | 1.54.2 (installed) | node:test smoke scripts |
| python3 | optional skills tooling only | ✓ | 3.12.3 | not required for phase impl |

Missing dependencies with no fallback:
- None. [VERIFIED: local environment probes]

Missing dependencies with fallback:
- None. [VERIFIED: local environment probes]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | local-only app without account/auth flow [VERIFIED: AGENTS.md] |
| V3 Session Management | no | no authenticated sessions [VERIFIED: AGENTS.md] |
| V4 Access Control | no | no multi-user role model [VERIFIED: AGENTS.md] |
| V5 Input Validation | yes | strict domain validation in services/forms (already project pattern) [VERIFIED: REQUIREMENTS.md] |
| V6 Cryptography | no | no server/API secret transport in Phase 2 scope [VERIFIED: AGENTS.md] |

### Known Threat Patterns for Vue+Dexie local analytics

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Invalid numeric input distorts KPIs | Tampering | central validators + blocking rules from existing meter/PV flows |
| Misleading certainty in combined KPIs | Information Disclosure (misinterpretation risk) | mandatory `Naeherung` labels + quality reasons |
| Accidental data loss through reset confusion | Denial of Service (user-level) | reset confirmation + clear reset target (30-day default) |

## Sources

### Primary (HIGH confidence)
- `.planning/phases/02-analyse-dashboard-datenqualitaet/02-CONTEXT.md` - locked phase decisions and scope
- `.planning/phases/02-analyse-dashboard-datenqualitaet/02-UI-SPEC.md` - approved UI interaction contract
- `AGENTS.md` - project constraints and workflow guardrails
- npm registry (`npm view`) - current versions and package currency
- Context7 `/vuejs/router`, `/vuejs/pinia`, `/websites/dexie`, `/chartjs/chart.js` - implementation patterns

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` - requirement wording and traceability
- `.planning/STATE.md` - historical decisions affecting delivery

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions and API patterns verified via npm + Context7.
- Architecture: HIGH - directly constrained by CONTEXT/UI-SPEC and existing project layering.
- Pitfalls: HIGH - derived from locked decisions and explicit product constraints.

**Research date:** 2026-05-12
**Valid until:** 2026-06-11

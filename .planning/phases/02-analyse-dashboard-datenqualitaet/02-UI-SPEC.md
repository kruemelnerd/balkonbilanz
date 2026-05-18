---
phase: 2
slug: analyse-dashboard-datenqualitaet
status: approved
shadcn_initialized: false
preset: none
created: 2026-05-11
reviewed_at: 2026-05-11T20:18:00Z
---

# Phase 2 - UI Design Contract

> Visual and interaction contract for Phase 2 dashboard, analysis, and data-quality flows. Built to extend the existing capture-first Vue app without introducing a new UI framework.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | none in Phase 2 baseline; text labels first |
| Font | system-ui, sans-serif |

Phase 2 should continue with a small manual CSS design system in Vue SFCs. Do not introduce shadcn, Tailwind, or a third-party component kit as part of this phase.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Inline icon/text gaps, badge padding |
| sm | 8px | Label-to-input gap, compact stacks |
| md | 16px | Default card padding and vertical rhythm |
| lg | 24px | Section spacing inside a screen |
| xl | 32px | Gap between major cards/sections |
| 2xl | 48px | Screen edge padding on wider breakpoints |
| 3xl | 64px | Major page breaks only |

Exceptions: none

Touch targets: interactive controls must be at least 44px tall, achieved with padding and line height rather than off-scale spacing tokens.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 | 1.5 |
| Label | 14px | 600 | 1.4 |
| Heading | 20px | 600 | 1.2 |
| Display | 28px | 600 | 1.15 |

Use exactly two font weights: 400 for body/supporting text, 600 for headings, labels, badges, and KPI values.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #F7F8F4 | App background, dashboard canvas, empty-state backdrop |
| Secondary (30%) | #FFFFFF | Cards, sheets, filter panels, tab surfaces |
| Accent (10%) | #1F6B5C | Primary CTA, active tab, selected date preset, focus ring, quality badge for `good` |
| Destructive | #B54708 | Delete actions, destructive confirmations, `poor` warning emphasis |

Accent reserved for: primary CTA, active navigation state, selected filter chip, keyboard focus ring, and positive `good` quality badge only.

Additional semantic neutrals may be derived with opacity from #1F2937 for body text and #6B7280 for secondary text. `limited` quality uses neutral emphasis instead of a second accent color.

60/30/10 split: dominant background 60%, card/surface white 30%, accent 10% maximum across a screen.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Analyse aktualisieren |
| Empty state heading | Noch keine Auswertung moeglich |
| Empty state body | Erfasse zuerst mindestens zwei Zaehlerstaende und einen vergangenen PV-Tag. Ueber die Schnellaktionen kommst du direkt zur Erfassung. |
| Error state | Die Auswertung konnte nicht geladen werden. Pruefe, ob lokale Daten vorhanden sind, und versuche es erneut. |
| Destructive confirmation | Analysefilter zuruecksetzen: Zeitraum und Auswahl wirklich auf Standard zuruecksetzen? |

Additional locked copy rules:
- Combined KPIs must always use the word `Schaetzung` or `Naeherung`, never imply exactness.
- PV day data must be labeled as `Tageswert`, not `Intervall`.
- Soft plausibility warnings must state why the value is unusual and that the data remains saved.
- Quality reasons must be concrete, for example `Nur 3 von 7 PV-Tagen vorhanden` or `Zaehlerintervall laenger als 10 Tage`.

---

## Screen and Interaction Contract

### Information architecture
- Keep a single-app shell and add a mobile bottom navigation with three labeled destinations: `Dashboard`, `Erfassung`, `Analyse`.
- `Erfassung` keeps the existing Phase 1 screen structure and copy intact.
- Default landing screen after Phase 2 becomes `Dashboard`.

### Dashboard
- Primary focal point: the top KPI card showing the most recent estimated self-consumption context, with a visible `Naeherung` badge when combined data is used.
- Secondary focal point: a compact `Datenqualitaet` card directly under the lead KPI.
- Tertiary content: two recency cards for `Letzte Zaehlerablesung` and `Letzter PV-Tageswert`, then quick actions.
- Empty state must include two visible actions: `Zaehlerstand erfassen` and `PV-Tageswert erfassen`.
- Populated state must show only a small set of KPIs on mobile: last import delta, last export delta, latest PV day, estimated self-consumption, estimated autarky.
- Every estimated KPI card must include a one-line hint that links visually to the quality card: `Berechnet aus Zaehlerintervallen und PV-Tageswerten.`

### Analyse
- Primary focal point: date-range filter block pinned near the top of the screen.
- Show the chosen period before any KPI or table output.
- Use three stacked sections in this order: `Zeitraum`, `Intervalle`, `Kombinierte Kennzahlen`.
- Interval rows must show start, end, duration, import, export, kWh/Tag, and cost if tariff data exists.
- PV daily values stay in a separate card/list below interval output, never merged row-by-row with meter intervals.
- If no tariff exists yet, show `Kosten noch nicht verfuegbar` instead of zero-cost pretending.

### Data quality and plausibility
- Show a dedicated quality badge plus explanation card on every combined-analysis view.
- Quality levels use exact labels `good`, `limited`, `poor` plus a German explainer sentence beneath the label.
- If PV is lower than export for the selected period, show a warning card above combined KPIs with the copy pattern `Plausibilitaetswarnung: Einspeisung liegt ueber dem erfassten PV-Tagesertrag.`
- Soft warnings use persistent inline cards, not toast notifications.

### Destructive and reset behavior
- Filter reset is the only destructive action in this phase and uses a confirmation dialog or inline confirm row.
- Existing delete flows from Phase 1 remain in `Erfassung`; Phase 2 must not duplicate them in dashboard or analysis cards.

---

## Component Inventory

| Component | Purpose | Notes |
|-----------|---------|-------|
| AppShellNav | Bottom navigation between Dashboard, Erfassung, Analyse | Text labels required on mobile |
| KpiHeroCard | Lead summary with estimate badge | Only one hero card per screen |
| QualityStatusCard | Quality level plus concrete reasons | Reused on dashboard and analysis |
| RecencyCard | Last meter/PV snapshot | Compact two-column metadata |
| AnalysisRangeCard | Period picker and reset action | Sticky/pinned near top on mobile |
| IntervalList | Meter interval output list | Card rows, not dense data table on narrow screens |
| PvDaySummaryList | Calendar-day PV values for selected period | Separate from intervals |
| PlausibilityWarningCard | Soft warning with explanation | Non-blocking, persistent |
| EmptyStateActionsCard | Onboarding empty state with quick actions | Contains two action buttons |

---

## State Contract

| State | Required UI treatment |
|-------|-----------------------|
| Loading | Skeleton cards for KPI and interval rows; no spinner-only full screen |
| Empty dashboard | Friendly explanation plus two quick actions |
| Empty analysis | Prompt to choose a period or add missing data |
| Partial data | Show what is known, gray out unavailable KPI cards, explain why |
| Warning | Inline card with title and corrective explanation |
| Error | Inline error card with retry action label `Erneut laden` |

---

## Accessibility Contract

- Bottom navigation, tabs, and chips require visible text labels.
- Status cards must not rely on color alone; each needs explicit words like `Naeherung`, `good`, `limited`, or `poor`.
- Date-range controls must have programmatic labels and preserve keyboard/focus visibility.
- KPI cards should expose a heading and supporting description so mobile screen readers can skim them.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party registries | none | not applicable |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-11

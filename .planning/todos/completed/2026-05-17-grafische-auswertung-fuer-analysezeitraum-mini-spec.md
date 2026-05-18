# Mini-Spec: Grafische Auswertung fuer Analysezeitraum

Status: Draft (brainstormed, implementation-ready)
Related Todo: `.planning/todos/pending/2026-05-17-grafische-auswertung-fuer-analysezeitraum.md`
Roadmap Fit: Phase 2 (Analyse, Dashboard & Datenqualitaet)

## Scope

In der Analyseansicht wird eine dedizierte Zeitraum-Grafik ergaenzt, die exakt den aktuell gewaehlten Analysezeitraum abbildet.

In Scope:
- Visualisierung von Netzbezug, Einspeisung und PV-Ertrag im ausgewaehlten Zeitraum
- Direkte Bindung an bestehende Analyse-Zeitraumwahl (Presets + Custom Range)
- Sichtbarer Datenqualitaetskontext (good/limited/poor + Gruende)
- Mobile-first Darstellung (lesbar und bedienbar auf kleinen Displays)

Out of Scope:
- Neue Berechnungsfachlogik fuer KPIs
- Backend/Cloud/externes Datenladen
- Erweiterung auf separate Dashboard-Filterlogik

## Data Model

Der Chart verwendet ein explizites ViewModel als einzige Input-Schnittstelle zur Komponente.

```ts
type ChartSeriesId = 'importKwh' | 'exportKwh' | 'pvKwh'
type ChartPointSource = 'meter-interval' | 'pv-day'
type ChartQualityFlag = 'gap' | 'outside-range-trimmed'

type AnalysisRangeChartPoint = {
  x: string // ISO-Zeit oder ISO-Tag
  value: number | null
  series: ChartSeriesId
  source: ChartPointSource
  qualityFlag?: ChartQualityFlag
}

type AnalysisRangeChartModel = {
  range: { start: string; end: string }
  meterSeries: AnalysisRangeChartPoint[] // import/export
  pvSeries: AnalysisRangeChartPoint[]
  quality: {
    level: 'good' | 'limited' | 'poor'
    reasons: string[]
  }
  meta: {
    meterCoverageDays: number
    pvCoverageDays: number
    missingDays: string[]
  }
}
```

## Mapping Rules

1. Zeitraumquelle
- `range.start` und `range.end` kommen ausschliesslich aus dem bestehenden Analysis Store.
- Keine zweite Datumslogik in der Chart-Komponente.

2. Bereichsfilter
- Meter- und PV-Daten werden strikt auf den gewaehlten Zeitraum beschnitten.
- Punkte ausserhalb des Zeitraums werden nicht dargestellt.

3. Seriensemantik
- `importKwh` und `exportKwh` stammen aus Intervallauswertung.
- `pvKwh` stammt aus Tageswerten.
- Keine implizite Verschmelzung zu einer gemeinsamen "genauen" Zeitreihe.

4. Lueckenverhalten
- Fehlende Tage/Werte werden als `value: null` dargestellt.
- Gap wird markiert (`qualityFlag: 'gap'`) statt visuell interpoliert.

5. Qualitaetskontext
- `quality.level` und `quality.reasons` werden aus vorhandener Analysequalitaet uebernommen.
- Bei `limited`/`poor` wird im Chart-Kontext ein deutlicher Hinweis angezeigt.

## Chart Configuration

Technik: Chart.js (bestehender Stack)

Darstellung:
- Combo-Chart: PV als Balken, Import/Export als Linien
- X-Achse primar tagesorientiert fuer mobile Lesbarkeit
- Y-Achse in kWh, standardmaessig eine Achse (zweite nur bei starker Skalenabweichung)

Visuelle Konventionen:
- Import: durchgezogene Linie
- Export: gestrichelte Linie
- PV: halbtransparente Balken
- Gaps: Linienunterbrechung (keine Verbindung ueber null/missing)

UX-Elemente:
- Titel: "Analysezeitraum"
- Subtext: Zeitraum + Datenqualitaetslevel
- Hinweisblock bei `limited`/`poor`
- Klarer Leerzustand mit Handlungshinweis

## Acceptance Criteria

1. Zeitraumbindung
- Given ein gewaehlter Analysezeitraum
- When die Analyseansicht angezeigt wird
- Then enthaelt die Grafik nur Werte innerhalb dieses Zeitraums

2. Datenebenen sauber getrennt
- Given Intervallwerte und PV-Tageswerte sind vorhanden
- Then werden PV-Werte als Tagesbalken und Meterwerte als Intervall-/Trendlinien dargestellt

3. Keine Scheingenauigkeit
- Given Datenluecken oder geringe Qualitaet
- Then zeigt die Grafik keine Interpolation ueber Luecken und blendet `limited`/`poor` inkl. Gruenden ein

4. Reaktive Aktualisierung
- Given der Nutzer aendert Preset oder Custom Range
- Then aktualisieren sich Chart und Analyseausgaben konsistent ohne Reload

5. Mobile Nutzbarkeit
- Then bleiben Achsenbeschriftung, Legende und Tooltip auf kleinen Displays lesbar und bedienbar

## TDD Slice Plan

Slice 1 - Mapper als Pure Function
- Implementiere `buildAnalysisRangeChartModel(...)`
- Unit-Tests fuer Range-Filter, Sortierung, Gap-Marking, Quality-Passthrough

Slice 2 - Chart-Komponente isoliert
- Neue Komponente `AnalysisRangeChart`
- Component-Tests fuer Serienrendering, Leerzustand, Quality-Hinweis

Slice 3 - Analyse-View Integration
- Wiring an existierenden Analysis Store
- Tests fuer Reaktivitaet bei Preset-/Range-Wechsel

Slice 4 - BDD/E2E Flow
- Szenario: Zeitraum wechseln, Gaps sichtbar, Quality-Copy sichtbar
- Mobile Smoke fuer Lesbarkeit

Slice 5 - Stabilisierung
- Tick-Dichte, Tooltip-Text und Legendenlayout fuer Mobile optimieren
- Regressionslauf fuer Analyse-/Dashboard-Flow

## Risiken und Guardrails

Risiko 1: Scheingenauigkeit durch implizites Re-Binning
- Guardrail: Keine neue Umrechnungslogik ohne explizite Fachentscheidung; nur bestehende Domain-Outputs visualisieren.

Risiko 2: Inkonsistenz zwischen KPIs/Liste/Chart
- Guardrail: Chart speist sich aus derselben Analyse-Ergebnisquelle wie die Text/KPI-Ausgabe.

Risiko 3: Ueberladene Mobile-Ansicht
- Guardrail: Begrenzte Tick-Anzahl, kurze Labels, reduzierte Legende, priorisierte Tooltip-Infos.

Risiko 4: Fehlende Transparenz bei Datenluecken
- Guardrail: Sichtbare Unterbrechungen + klarer Quality-Hinweis statt Glattung.

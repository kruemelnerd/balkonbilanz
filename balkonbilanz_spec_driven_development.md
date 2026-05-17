# Spec Driven Development: BalkonBilanz

**Stand:** 2026-05-11  
**Status:** v1 – Neuspezifikation als mobile-first lokale Web-App / spätere PWA  
**Produktname:** BalkonBilanz  
**Zielplattform:** Mobile-first Web-App, später installierbare Progressive Web App (PWA)  
**Primäre Nutzung:** Android-Smartphone im Browser, lokal und offline nutzbar  
**Datenhaltung:** lokal im Browser über IndexedDB  
**Entwicklungsprinzip:** TDD, Spec Driven Development, UI-Testabdeckung für jedes größere Feature  
**Designprinzip:** einfache Bedienung, ehrliche Dateninterpretation, wenig Eigenentwicklung, etablierte Open-Source-Bibliotheken

---

## 1. Ziel der Anwendung

**BalkonBilanz** ist eine mobile-first Web-Anwendung zur manuellen Erfassung und Auswertung von Stromzählerständen und PV-Ertragsdaten eines Balkonkraftwerks.

Die Anwendung soll helfen, diese Fragen zu beantworten:

> Wie viel Strom beziehe ich aus dem Netz?

> Wie viel Strom speise ich kostenfrei ein?

> Wie viel meines Balkonkraftwerk-Ertrags nutze ich selbst?

> Wäre ein Batteriespeicher für mich wirtschaftlich sinnvoll?

Die Anwendung ersetzt keine professionelle Energieberatung und keine exakte Lastprofilanalyse. Sie liefert eine nachvollziehbare, konservative Entscheidungsgrundlage auf Basis manuell gepflegter Daten.

---

## 2. Zentrale Produktentscheidungen

| Bereich | Entscheidung |
|---|---|
| Name | BalkonBilanz |
| Plattform | Web-App, mobile-first |
| Native Android-App | Nein, bewusst nicht |
| Spätere Installierbarkeit | Ja, als PWA |
| Offlinefähigkeit | Ja, nach PWA-Ausbaustufe |
| Datenhaltung | Lokal im Browser, IndexedDB |
| Cloud | Nein |
| Account/Login | Nein |
| Sync | Nein |
| Stromzähler | Iskra MT176 |
| Zählerregister | `1.8.0` Netzbezug, `2.8.0` Einspeisung |
| Zählerdaten | kumulierte Gesamtstände, daraus werden Intervalle berechnet |
| PV-Daten | manuell aus Solakon-App, nur als Tageswert für vergangene Kalendertage |
| Strompreis Default | 0,305 €/kWh |
| Einspeisevergütung Default | 0 €/kWh |
| Icons | Lucide, keine eigene Iconbibliothek |
| Entwicklungsstil | TDD, zuerst Tests, dann Implementierung |

---

## 3. Fachliche Grundsätze

### 3.1 Zählerdaten sind keine Tageswerte

Der Iskra MT176 zeigt kumulierte Zählerstände an. Diese Werte gelten nicht für einzelne Tage, sondern sind Gesamtstände seit Zählerstart, Zählerwechsel oder Reset.

Für die App bedeutet das:

- Jeder Stromzähler-Eintrag ist ein **Ableseereignis**.
- Jedes Ableseereignis hat einen genauen Zeitpunkt: Datum und Uhrzeit.
- Verbrauch und Einspeisung entstehen erst durch die Differenz zwischen zwei Ableseereignissen.
- Die App berechnet daraus ein **Zählerintervall**.
- Variable Ableseabstände und unterschiedliche Uhrzeiten sind erlaubt.

Beispiel:

```text
01.05.2026 19:15  1.8.0 = 1200,0 kWh  2.8.0 = 50,0 kWh
04.05.2026 07:45  1.8.0 = 1210,5 kWh  2.8.0 = 55,2 kWh
```

Daraus folgt:

```text
Intervall: 01.05.2026 19:15 bis 04.05.2026 07:45
Dauer: 60,5 Stunden
Netzbezug: 10,5 kWh
Einspeisung: 5,2 kWh
Ø Netzbezug pro Tag: 4,17 kWh/Tag
Ø Einspeisung pro Tag: 2,06 kWh/Tag
```

Die absoluten Differenzen sind zuverlässig. Die Verteilung auf einzelne Kalendertage ist unbekannt.

### 3.2 PV-Daten sind nur Tageswerte für vergangene Tage

Die Solakon-App liefert manuell ablesbare PV-Ertragswerte. Für BalkonBilanz gilt:

- PV-Erzeugung wird **separat** von Zählerständen gepflegt.
- PV-Erzeugung wird ausschließlich als **Tagesertrag pro abgeschlossenem Kalendertag** erfasst.
- PV-Erzeugung kann nur für vergangene Tage eingetragen werden.
- Für den heutigen Tag darf kein PV-Ertrag eingetragen werden, da der Tag noch nicht abgeschlossen ist.
- Es gibt keine PV-Zeiträume im MVP.
- Es gibt keinen automatischen Import aus Solakon/Growatt.

Beispiel:

```text
PV-Ertrag für 2026-05-10: 3,2 kWh
PV-Ertrag für 2026-05-11: nicht erlaubt, solange 2026-05-11 noch läuft
```

### 3.3 Kombinierte Auswertungen sind Näherungen

Zählerdaten liegen als Zeitintervalle vor. PV-Daten liegen als Kalendertage vor.

Das ist fachlich nicht schlimm, aber wichtig für die Interpretation:

- Zählerintervalle sind exakt für den Zeitraum zwischen zwei Ablesungen.
- PV-Tageswerte sind exakt für abgeschlossene Kalendertage.
- Kombinierte Kennzahlen wie Eigenverbrauchsquote oder Autarkiegrad sind nur dann sehr belastbar, wenn die Zeiträume gut zueinander passen.
- Die App muss Datenqualität sichtbar machen.
- Bei schlechter zeitlicher Passung darf die App keine Scheingenauigkeit erzeugen.

---

## 4. Zielgruppen und Nutzungskontext

### 4.1 Primäre Nutzerrolle

Eine Privatperson mit:

- Iskra MT176 Zweirichtungszähler
- Balkonkraftwerk
- Solakon-App mit Growatt-Wechselrichter
- manueller Ablesung statt automatischem Export
- Interesse an Speicherwirtschaftlichkeit
- Wunsch nach lokaler Datenhaltung ohne Cloud

### 4.2 Typischer Alltag

Die Person liest den Zähler nicht jeden Tag ab. Manchmal liegen zwischen zwei Ablesungen zwei Tage, manchmal eine Woche. Die Uhrzeit variiert.

Die PV-Erzeugung wird nachträglich für vergangene Tage aus der Solakon-App eingetragen, z. B. am nächsten Morgen oder am Wochenende gesammelt für mehrere vergangene Tage.

Die App muss diesen realistischen Ablauf unterstützen, statt tägliche Disziplin zu erzwingen.

---

## 5. Nicht-Ziele

Diese Punkte werden im MVP bewusst nicht umgesetzt:

- native Android-App
- iOS-native App
- Backend
- Benutzerkonten
- Cloud-Sync
- automatischer Solakon-/Growatt-Import
- OCR-Erkennung des Zählerdisplays
- IR-/SML-Auslesung des Stromzählers
- Smart-Home-Anbindung
- minutengenaue Lastprofilanalyse
- exakte Batteriesimulation auf Zeitreihenbasis
- dynamische Stromtarife
- mehrsprachige UI
- Veröffentlichung im Play Store

---

## 6. Technologiestack

### 6.1 Empfohlener Stack

| Bereich | Bibliothek / Werkzeug | Zweck |
|---|---|---|
| Framework | Vue 3 | einsteigerfreundliches UI-Framework |
| Build Tool | Vite | schnelle lokale Entwicklung und Build |
| Sprache | TypeScript | Typsicherheit und bessere Wartbarkeit |
| Routing | Vue Router | Seitenwechsel in SPA |
| State Management | Pinia | globaler UI-/App-State |
| Lokale Datenbank | Dexie.js | einfache IndexedDB-Nutzung |
| Styling | Tailwind CSS | utility-first Styling |
| Komponenten | DaisyUI oder einfache eigene Wrapper | schnelle mobile UI ohne großes Designsystem |
| Icons | Lucide Vue | Open-Source-Icons als Vue-Komponenten |
| Charts | Chart.js + vue-chartjs | einfache Diagramme |
| Unit Tests | Vitest | schnelle Tests für Domainlogik |
| Component Tests | Vue Testing Library | Tests aus Nutzersicht |
| UI-/E2E-Tests | Playwright | echte Browser-Tests |
| Gherkin/BDD | playwright-bdd oder Cucumber.js + Playwright | ausführbare Akzeptanzszenarien |
| PWA | vite-plugin-pwa | Service Worker, Manifest, Offlinefähigkeit |

### 6.2 Warum Vue 3 + Vite

Vue 3 ist für diesen Anwendungsfall gut geeignet, weil die App stark aus Formularen, Listen, Diagrammen, Detailseiten und Einstellungen besteht. Vue Single File Components trennen Template, Logik und Styling verständlich. Vite reduziert Setup-Komplexität und liefert schnelle Feedbackzyklen.

### 6.3 Warum nicht Next.js

Next.js ist für diese Anwendung zu groß. BalkonBilanz braucht im MVP:

- keinen Server
- kein serverseitiges Rendering
- keine API-Routes
- keine Authentifizierung
- kein Deployment mit Backendlogik

Eine Vite-basierte SPA ist einfacher, transparenter und besser passend für lokale Offline-Nutzung.

### 6.4 Warum Dexie.js

IndexedDB ist die passende Browserdatenbank für lokale, strukturierte Offline-Daten. Die native IndexedDB-API ist allerdings umständlich. Dexie.js reduziert diese Komplexität und erlaubt klare Repository-Schichten.

### 6.5 Warum Playwright

Playwright testet echte Browser und kann mobile Viewports simulieren. Da die Anwendung mobile-first entwickelt wird, müssen die wichtigsten Abläufe im Smartphone-Viewport getestet werden.

### 6.6 Warum Lucide

Lucide liefert konsistente, quelloffene SVG-Icons und kann als Vue-Komponenten genutzt werden. Es werden nur Icons importiert, die wirklich verwendet werden.

Beispielhafte Icons:

| Bereich | Lucide Icon |
|---|---|
| Dashboard | `LayoutDashboard` |
| Zählerstand | `Gauge` |
| PV-Ertrag | `Sun` |
| Speicherberater | `BatteryCharging` |
| Einstellungen | `Settings` |
| Backup | `Download`, `Upload` |
| Warnung | `TriangleAlert` |
| Datenqualität | `ShieldCheck`, `ShieldAlert` |
| Kosten | `Euro` |

---

## 7. Entwicklungsreihenfolge

Die App wird bewusst nicht sofort als vollständige PWA gebaut. Der Ablauf reduziert Komplexität.

### 7.1 Phase 1: Lokale Web-App mit DB und Tests

Ziel: Eine mobile-first Web-App im Browser, lokal laufend, mit funktionierender IndexedDB und vollständiger Testbasis.

Umfang:

- Vite/Vue/TypeScript Projekt
- Routing
- mobile Layoutstruktur
- Dexie-Datenbank
- Zählerstand-Erfassung
- PV-Tagesertrag-Erfassung
- Dashboard-Grundansicht
- Einstellungen mit Strompreis
- Unit Tests für Berechnungen
- Component Tests für Formulare
- Playwright UI-Tests für Hauptflüsse
- Gherkin-Szenarien als Akzeptanzbasis

Noch nicht enthalten:

- Service Worker
- Installierbarkeit
- Offline-Asset-Caching
- Update-Mechanismus

### 7.2 Phase 2: Auswertungen und Speicherberater

Ziel: Die fachlichen Kennzahlen werden nutzbar und testbar.

Umfang:

- Intervallberechnungen
- normalisierte kWh/Tag
- PV-Tagesauswertung
- Datenqualitätsmodell
- Eigenverbrauchsquote als Näherung
- Autarkiegrad als Näherung
- Speicherberater mit Szenarien
- Diagramme
- Plausibilitätswarnungen
- Tarifhistorie
- Zählerwechsel/Reset
- Backup/Restore

### 7.3 Phase 3: PWA und Offlinebetrieb

Ziel: Die Web-App wird installierbar und nach einmaligem Laden offline bedienbar.

Umfang:

- `vite-plugin-pwa`
- Web App Manifest
- App-Icons
- Service Worker
- Offline-Startfähigkeit
- Cache-Strategie für statische Assets
- Offline-UI-Test mit Playwright
- Update-Hinweis bei neuer Version
- Regressionstest: Daten bleiben nach App-Update erhalten

### 7.4 Warum diese Reihenfolge wichtig ist

Service Worker und Browser-Caching können Entwicklungsfehler verdecken. Wenn PWA zu früh aktiviert wird, wird Debugging schwerer. Deshalb wird zuerst die Fachlogik mit lokaler DB und Tests stabil gebaut. Erst danach kommt die PWA-Schicht.

---

## 8. Architekturprinzipien

### 8.1 Fachlogik außerhalb von Vue-Komponenten

Vue-Komponenten dürfen keine komplexe Berechnungslogik enthalten.

Nicht erlaubt:

```text
DashboardView.vue berechnet direkt Eigenverbrauch, Autarkie und Speicher-Amortisation.
```

Erlaubt:

```text
batteryAdvisorService.ts berechnet Szenarien.
DashboardView.vue zeigt nur Ergebnisse an.
```

### 8.2 Schichtenmodell

```text
UI-Komponenten
  ↓
Feature Stores / Composables
  ↓
Use Cases / Services
  ↓
Repositories
  ↓
Dexie / IndexedDB
```

### 8.3 Pure Functions für Berechnungen

Berechnungen sollen als reine Funktionen implementiert werden:

```ts
calculateMeterIntervals(readings: MeterReading[]): MeterInterval[]
calculateSolarSelfConsumption(input: SelfConsumptionInput): SelfConsumptionEstimate
calculateBatteryScenarios(input: BatteryScenarioInput): BatteryScenarioResult[]
calculateDataQuality(input: DataQualityInput): DataQualityResult
```

Vorteile:

- leicht testbar
- keine Browserabhängigkeit
- keine Vue-Abhängigkeit
- gute Grundlage für TDD

---

## 9. Projektstruktur

```text
balkonbilanz/
  docs/
    spec/
      balkonbilanz_spec.md
    decisions/
      adr-001-platform-pwa.md
      adr-002-vue-vite.md
      adr-003-indexeddb-dexie.md
      adr-004-tdd-playwright-gherkin.md
  public/
    icons/
  src/
    app/
      App.vue
      router.ts
      main.ts
    shared/
      db/
        balkonBilanzDb.ts
        migrations.ts
      ui/
        AppShell.vue
        BottomNavigation.vue
        PageHeader.vue
        StatCard.vue
        EmptyState.vue
        WarningBox.vue
      date/
        dateUtils.ts
      number/
        decimalUtils.ts
      testing/
        testDataBuilders.ts
    features/
      dashboard/
        DashboardView.vue
        dashboardService.ts
      meter-readings/
        MeterReadingCreateView.vue
        MeterReadingListView.vue
        meterReadingRepository.ts
        meterReadingService.ts
        meterReadingCalculations.ts
        meterReadingTypes.ts
      solar-generation/
        SolarDailyGenerationCreateView.vue
        SolarDailyGenerationListView.vue
        solarGenerationRepository.ts
        solarGenerationService.ts
        solarGenerationTypes.ts
      analytics/
        AnalyticsView.vue
        energyBalanceService.ts
        dataQualityService.ts
      battery-advisor/
        BatteryAdvisorView.vue
        batteryAdvisorService.ts
        batteryAdvisorTypes.ts
      settings/
        SettingsView.vue
        tariffRepository.ts
        settingsRepository.ts
      backup-restore/
        BackupRestoreView.vue
        backupService.ts
      meter-management/
        MeterManagementView.vue
        meterChangeService.ts
  tests/
    unit/
    component/
    e2e/
      features/
      steps/
      pages/
    fixtures/
  package.json
  vite.config.ts
  playwright.config.ts
```

---

## 10. Datenmodell

### 10.1 `MeterReading`

Ein Zählerstand ist ein Ableseereignis mit exaktem Zeitpunkt.

```ts
export interface MeterReading {
  id: string;
  readAt: string; // ISO datetime, z. B. 2026-05-11T19:15:00+02:00
  importTotalKwh: string; // OBIS 1.8.0, decimal string
  exportTotalKwh: string; // OBIS 2.8.0, decimal string
  meterId: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
```

Regeln:

- `readAt` ist Pflicht.
- `importTotalKwh` ist Pflicht.
- `exportTotalKwh` ist Pflicht.
- Werte werden als Decimal-Strings gespeichert, nicht als Float.
- Mehrere Ablesungen pro Tag sind erlaubt.
- Zwei Ablesungen mit identischem `readAt` sind nicht erlaubt.
- Sinkende Werte sind nur bei markiertem Zählerwechsel/Reset erlaubt.

### 10.2 `MeterInterval`

Ein Intervall wird nicht direkt eingegeben, sondern aus zwei sortierten Zählerständen berechnet.

```ts
export interface MeterInterval {
  id: string;
  fromReadingId: string;
  toReadingId: string;
  from: string;
  to: string;
  durationHours: string;
  importKwh: string;
  exportKwh: string;
  importKwhPerDay: string;
  exportKwhPerDay: string;
  costEuro: string;
  warnings: DataWarning[];
}
```

Regeln:

- Das erste Ableseereignis erzeugt kein Intervall.
- Ein Intervall entsteht immer aus zwei zeitlich aufeinanderfolgenden Ablesungen desselben Zählers.
- Intervallwerte dürfen nicht negativ sein, außer bei dokumentiertem Zählerwechsel.

### 10.3 `SolarDailyGeneration`

PV-Erzeugung wird ausschließlich als Tageswert für vergangene Tage gespeichert.

```ts
export interface SolarDailyGeneration {
  id: string;
  date: string; // ISO date, z. B. 2026-05-10
  generationKwh: string;
  source: 'SOLAKON_MANUAL';
  note?: string;
  createdAt: string;
  updatedAt: string;
}
```

Regeln:

- `date` ist Pflicht.
- `date` muss vor dem heutigen lokalen Datum liegen.
- Für den heutigen Tag ist keine Eingabe erlaubt.
- Für zukünftige Tage ist keine Eingabe erlaubt.
- Pro Kalendertag darf es genau einen PV-Ertragswert geben.
- Eine Änderung überschreibt den Tageswert nachvollziehbar über `updatedAt`.
- PV-Erträge sind Mengenwerte, keine kumulierten Zählerstände.
- PV-Erträge werden nicht als Zeiträume erfasst.

### 10.4 `TariffPeriod`

Strompreise werden historisiert, damit alte Auswertungen nicht rückwirkend verändert werden.

```ts
export interface TariffPeriod {
  id: string;
  validFrom: string; // ISO date
  validTo?: string; // ISO date, exclusive or undefined
  importPriceEuroPerKwh: string; // default 0.305
  feedInPriceEuroPerKwh: string; // default 0
  note?: string;
}
```

Regeln:

- Es muss mindestens ein Tarif existieren.
- Der initiale Tarif hat `importPriceEuroPerKwh = 0.305`.
- Der initiale Einspeisewert ist `0`.
- Tarifzeiträume dürfen sich nicht überschneiden.
- Bei Tarifwechsel werden historische Zeiträume mit dem damaligen Preis bewertet.

### 10.5 `Meter`

```ts
export interface Meter {
  id: string;
  name: string;
  model?: string; // z. B. Iskra MT176
  activeFrom: string;
  activeTo?: string;
  note?: string;
}
```

### 10.6 `MeterChangeEvent`

```ts
export interface MeterChangeEvent {
  id: string;
  previousMeterId: string;
  newMeterId: string;
  changedAt: string;
  newImportStartKwh: string;
  newExportStartKwh: string;
  note?: string;
}
```

### 10.7 `AppSettings`

```ts
export interface AppSettings {
  id: 'default';
  appName: 'BalkonBilanz';
  locale: 'de-DE';
  currency: 'EUR';
  defaultImportPriceEuroPerKwh: string; // 0.305
  defaultFeedInPriceEuroPerKwh: string; // 0
  batteryRoundTripEfficiency: string; // default 0.85
  dataQualityStrictness: 'relaxed' | 'balanced' | 'strict';
}
```

---

## 11. Dexie-Datenbankschema

### 11.1 Datenbankname

```ts
BalkonBilanzDb
```

### 11.2 Tabellen

```ts
export class BalkonBilanzDb extends Dexie {
  meterReadings!: Table<MeterReading, string>;
  solarDailyGenerations!: Table<SolarDailyGeneration, string>;
  tariffPeriods!: Table<TariffPeriod, string>;
  meters!: Table<Meter, string>;
  meterChangeEvents!: Table<MeterChangeEvent, string>;
  appSettings!: Table<AppSettings, string>;

  constructor() {
    super('BalkonBilanzDb');

    this.version(1).stores({
      meterReadings: 'id, readAt, meterId',
      solarDailyGenerations: 'id, &date',
      tariffPeriods: 'id, validFrom, validTo',
      meters: 'id, activeFrom, activeTo',
      meterChangeEvents: 'id, changedAt, previousMeterId, newMeterId',
      appSettings: 'id'
    });
  }
}
```

### 11.3 Migrationsprinzip

- Jede Änderung am Datenmodell erhöht die Dexie-Version.
- Migrationen müssen getestet werden.
- Backup/Restore muss versionierte Backups unterstützen.
- Die App darf bei unbekannter DB-Version keine Daten stillschweigend löschen.

---

## 12. Berechnungsregeln

### 12.1 Zählerintervalle

```ts
importKwh = current.importTotalKwh - previous.importTotalKwh
exportKwh = current.exportTotalKwh - previous.exportTotalKwh
durationHours = current.readAt - previous.readAt
importKwhPerDay = importKwh / durationHours * 24
exportKwhPerDay = exportKwh / durationHours * 24
```

Regeln:

- Die Berechnung erfolgt pro Zähler.
- Ablesungen werden nach `readAt` sortiert.
- Ein Intervall benötigt exakt zwei aufeinanderfolgende Ablesungen.
- Bei weniger als zwei Ablesungen gibt es noch keine Intervallauswertung.

### 12.2 Netzbezugskosten

```ts
costEuro = importKwh * applicableImportPriceEuroPerKwh
```

Bei Intervallen, die über mehrere Tarifperioden laufen, gibt es zwei erlaubte MVP-Strategien:

1. Einfach: Tarif zum Intervallende verwenden und Warnung anzeigen.
2. Besser: Intervall anteilig nach Dauer auf Tarifperioden aufteilen.

Für den MVP wird Strategie 1 verwendet. Strategie 2 ist Roadmap.

### 12.3 Wert eingespeister Energie

Da die Einspeisevergütung `0 €/kWh` beträgt, ist der direkte Auszahlungswert:

```ts
feedInRevenueEuro = exportKwh * 0
```

Für Speicherbewertung ist aber der Opportunitätswert relevant:

```ts
potentialAvoidedImportValueEuro = exportKwh * importPriceEuroPerKwh
```

Dieser Wert ist kein tatsächlicher Gewinn, sondern ein theoretisches Einsparpotenzial.

### 12.4 PV-Tagesertrag

```ts
solarGenerationKwh(date) = manual value from Solakon app
```

Regeln:

- PV-Erträge werden nicht normalisiert.
- PV-Erträge haben keine Uhrzeit.
- PV-Erträge beziehen sich auf einen vollständigen vergangenen Kalendertag.

### 12.5 Kombination von PV-Tagesdaten und Zählerintervallen

Die Kombination ist eine Schätzung, weil die Zeitraster unterschiedlich sind.

Die App berechnet kombinierte Kennzahlen nur für einen gewählten Analysezeitraum und versieht sie mit Datenqualität.

Eingaben:

- Zählerintervalle im Analysezeitraum
- PV-Tageswerte im Analysezeitraum
- Tarifinformationen

Berechnung:

```ts
totalImportKwh = sum(importKwh over included meter intervals)
totalExportKwh = sum(exportKwh over included meter intervals)
totalSolarGenerationKwh = sum(solar daily generation for included dates)
estimatedDirectSolarUseKwh = max(0, totalSolarGenerationKwh - totalExportKwh)
estimatedHouseholdConsumptionKwh = totalImportKwh + estimatedDirectSolarUseKwh
selfConsumptionRate = estimatedDirectSolarUseKwh / totalSolarGenerationKwh
autarkyRate = estimatedDirectSolarUseKwh / estimatedHouseholdConsumptionKwh
```

Warnungen:

- Wenn PV-Tagesdaten fehlen, sinkt die Datenqualität.
- Wenn PV-Erzeugung kleiner als Einspeisung ist, wird eine Plausibilitätswarnung angezeigt.
- Wenn Zählerintervalle nur teilweise mit den PV-Tagen überlappen, wird die Auswertung als Näherung markiert.

### 12.6 Speicher-Szenarien

Die Speicherbewertung nutzt mehrere Szenarien:

| Szenario | Nutzbarer Anteil eingespeister Energie |
|---|---:|
| konservativ | 30 % |
| realistisch | 50 % |
| optimistisch | 70 % |
| theoretisches Maximum | 100 % |

Zusätzlich wird ein Rundtrip-Wirkungsgrad berücksichtigt:

```ts
usableStoredKwh = exportKwh * scenarioUsableShare * batteryRoundTripEfficiency
annualSavingsEuro = usableStoredKwhPerYear * importPriceEuroPerKwh
breakEvenYears = batteryInvestmentEuro / annualSavingsEuro
```

Default:

```text
batteryRoundTripEfficiency = 0.85
```

Die App muss deutlich machen:

- Das ist keine exakte Speicher-Simulation.
- Tages- und Intervallwerte reichen nicht für eine genaue Speichergröße.
- Die Schätzung ist für eine erste Kaufentscheidung gedacht.

---

## 13. Datenqualitätsmodell

### 13.1 Qualitätsstufen

```ts
export type DataQualityLevel = 'good' | 'limited' | 'poor';
```

| Stufe | Bedeutung |
|---|---|
| `good` | genügend Daten, geringe Lücken, Zeitraum passt gut |
| `limited` | brauchbare Näherung, aber Lücken oder unsaubere Zeitpassung |
| `poor` | Auswertung nur grob oder nicht sinnvoll |

### 13.2 Kriterien

Die Datenqualität hängt ab von:

- Anzahl der Zählerablesungen
- Länge der Zählerintervalle
- Anzahl fehlender PV-Tage
- Anteil vorhandener PV-Tage am Analysezeitraum
- zeitlicher Passung zwischen Zählerintervallen und PV-Tageswerten
- Plausibilitätswarnungen
- Zählerwechseln im Zeitraum

### 13.3 Beispielbewertung

```text
Analysezeitraum: 2026-05-01 bis 2026-05-31
PV-Tage erwartet: 31
PV-Tage vorhanden: 28
PV-Abdeckung: 90,3 %
Zählerintervalle: 5
Längstes Intervall: 9 Tage
Plausibilitätswarnungen: 0
Datenqualität: gut
```

```text
Analysezeitraum: 2026-05-01 bis 2026-05-31
PV-Tage erwartet: 31
PV-Tage vorhanden: 14
PV-Abdeckung: 45,2 %
Zählerintervalle: 1
Längstes Intervall: 31 Tage
Plausibilitätswarnungen: 2
Datenqualität: schlecht
```

### 13.4 UI-Anforderung

Jede kombinierte Auswertung muss eine sichtbare Qualitätsanzeige enthalten:

```text
Datenqualität: eingeschränkt
Grund: PV-Erträge fehlen für 6 Tage. Zählerintervall umfasst 12 Tage.
```

---

## 14. Plausibilitätsregeln

### 14.1 Zählerstände

| Regel | Verhalten |
|---|---|
| `1.8.0` kleiner als vorher | blockieren oder Zählerwechsel verlangen |
| `2.8.0` kleiner als vorher | blockieren oder Zählerwechsel verlangen |
| sehr hoher Sprung | warnen, aber Speichern erlauben |
| identischer Zeitpunkt | blockieren |
| fehlender Wert | blockieren |
| negativer Wert | blockieren |
| ungültiges Zahlenformat | blockieren |

### 14.2 PV-Tageswerte

| Regel | Verhalten |
|---|---|
| heutiger Tag | blockieren |
| zukünftiger Tag | blockieren |
| bereits vorhandener Tag | Bearbeiten anbieten |
| negativer Ertrag | blockieren |
| extrem hoher Tagesertrag | warnen, Speichern erlauben |
| fehlender Ertrag | blockieren |

### 14.3 Tarifperioden

| Regel | Verhalten |
|---|---|
| negativer Strompreis | blockieren |
| überlappende Tarifzeiträume | blockieren |
| Einspeisevergütung negativ | blockieren |
| fehlender Starttermin | blockieren |

---

## 15. Screens und UX

### 15.1 Mobile Navigation

Die App nutzt eine Bottom Navigation.

Tabs:

1. Dashboard
2. Zähler
3. PV
4. Analyse
5. Mehr

Lucide-Icons:

```ts
LayoutDashboard
Gauge
Sun
ChartNoAxesCombined
Menu
```

### 15.2 Dashboard

Zweck:

- schneller Überblick
- letzte Ablesung
- letzter PV-Tageswert
- aktuelle Kennzahlen
- Warnungen

Elemente:

- App-Titel `BalkonBilanz`
- Stat Cards:
  - Netzbezug letzter Zeitraum
  - Einspeisung letzter Zeitraum
  - Ø Netzbezug pro Tag
  - letzter PV-Ertrag
- Datenqualitätskarte
- Schnellaktionen:
  - Zählerstand eintragen
  - PV-Ertrag eintragen

### 15.3 Zählerstand erfassen

Felder:

- Datum/Uhrzeit der Ablesung, Default `jetzt`
- `1.8.0 Netzbezug gesamt in kWh`
- `2.8.0 Einspeisung gesamt in kWh`
- Notiz optional

UX-Anforderungen:

- große Eingabefelder
- numerische Tastatur auf Mobilgeräten
- klare OBIS-Bezeichnung
- erklärende Hilfe: „Die Werte wechseln am MT176 alle paar Sekunden.“
- Speichern-Button sticky am unteren Rand
- nach dem Speichern Anzeige des neu berechneten Intervalls, falls möglich

### 15.4 Zählerstand-Liste

Anzeige:

- Datum/Uhrzeit
- `1.8.0`
- `2.8.0`
- daraus entstehendes Intervall zum vorherigen Eintrag
- Warnungen

Aktionen:

- bearbeiten
- löschen
- Notiz ansehen

### 15.5 PV-Ertrag erfassen

Felder:

- Kalendertag, Default `gestern`
- PV-Ertrag in kWh
- Notiz optional

Regeln in UI:

- heute ist nicht auswählbar
- Zukunft ist nicht auswählbar
- bei bereits vorhandenem Tag wird Bearbeiten angeboten
- Text: „PV-Erträge können nur für abgeschlossene vergangene Tage eingetragen werden.“

### 15.6 PV-Ertrag-Liste

Anzeige:

- Datum
- kWh
- Notiz
- Quelle `Solakon manuell`

Aktionen:

- bearbeiten
- löschen

### 15.7 Analyse

Ansichten:

- Zeitraum wählen
- Netzbezug als Intervallwerte
- Einspeisung als Intervallwerte
- normalisierte kWh/Tag
- PV-Tageserträge
- kombinierte Schätzung
- Datenqualität

Wichtiger UI-Text:

```text
Zählerwerte werden als Intervalle ausgewertet. PV-Erträge sind Tageswerte. Kombinierte Kennzahlen sind daher Näherungen, wenn die Zeiträume nicht exakt passen.
```

### 15.8 Speicherberater

Eingaben:

- geplanter Speicherpreis
- Speichergröße in kWh
- Wirkungsgrad, Default 85 %
- Betrachtungszeitraum

Ausgaben:

- konservatives Szenario
- realistisches Szenario
- optimistisches Szenario
- theoretisches Maximum
- jährliche Einsparung
- Break-even in Jahren
- Datenqualitätswarnung

### 15.9 Einstellungen

Inhalte:

- Strompreis: Default 0,305 €/kWh
- Einspeisevergütung: Default 0 €/kWh
- Tarifhistorie verwalten
- Wirkungsgrad Speicher: Default 85 %
- Datenqualität: relaxed/balanced/strict
- Backup exportieren
- Backup importieren
- App-Info

### 15.10 Backup & Restore

Backup:

- JSON-Datei herunterladen
- enthält alle lokalen Daten
- enthält Schema-Version
- enthält Exportzeitpunkt

Restore:

- JSON-Datei auswählen
- Validierung anzeigen
- Importvorschau anzeigen
- bestehende Daten überschreiben oder zusammenführen

MVP-Entscheidung:

- initial nur vollständiger Export und vollständiger Restore mit Bestätigung
- Merge-Import später

---

## 16. TDD-Strategie

### 16.1 Grundsatz

Kein größeres Feature wird ohne Test begonnen.

Für jedes Feature gilt:

```text
1. Akzeptanzkriterien in Gherkin schreiben
2. Domain-Unit-Test schreiben
3. Component- oder UI-Test schreiben
4. minimale Implementierung
5. Refactoring
6. Datenqualitäts-/Edgecase-Tests ergänzen
```

### 16.2 Testpyramide

| Ebene | Tool | Häufigkeit | Zweck |
|---|---|---:|---|
| Unit Tests | Vitest | sehr viele | Berechnungen, Validierung, Datenqualität |
| Component Tests | Vue Testing Library | einige | Formulare, Fehlertexte, UI-Zustände |
| UI/E2E Tests | Playwright | pro größerem Feature mindestens einer | Nutzerflüsse im Browser |
| Gherkin | Cucumber/playwright-bdd | Feature-Akzeptanz | lesbare Spezifikation |

### 16.3 Was zwingend per Unit Test getestet wird

- Intervallberechnung
- Normalisierung auf kWh/Tag
- Tarifauswahl
- PV-Tageswertvalidierung
- Datenqualitätsberechnung
- Speicher-Szenarien
- Backup-Serialisierung
- Plausibilitätswarnungen

### 16.4 Was zwingend per UI-Test getestet wird

- Zählerstand erfassen
- PV-Ertrag erfassen
- Dashboard aktualisiert sich
- Analyse zeigt Intervallwerte
- Speicherberater zeigt Szenarien
- Einstellungen ändern Strompreis
- Backup exportieren/importieren
- Offline-Nutzung nach PWA-Aktivierung

### 16.5 Mobile-first Testvorgabe

Playwright-Tests laufen mindestens in:

- Desktop Chromium
- Mobile Chrome Emulation, z. B. Pixel 7 oder vergleichbar

Die mobile Ansicht ist nicht optional. Wenn mobile Hauptflüsse brechen, ist das Feature nicht fertig.

### 16.6 Definition of Done pro Feature

Ein Feature ist nur fertig, wenn:

- Gherkin-Szenario existiert
- Unit Tests für Fachlogik grün sind
- mindestens ein UI-Test für den Hauptfluss grün ist
- Fehlermeldungen verständlich sind
- mobile Ansicht geprüft ist
- keine Fachlogik in Vue-Komponenten liegt
- Datenmodelländerung dokumentiert ist
- Backup-Kompatibilität bedacht wurde

---

## 17. Gherkin-Testfälle

Die folgenden Szenarien sind als Grundlage für `.feature`-Dateien gedacht.

### 17.1 Feature: Zählerstand erfassen

```gherkin
# language: de
Funktionalität: Zählerstand erfassen
  Als Nutzer von BalkonBilanz
  möchte ich die kumulierten Registerwerte meines Iskra MT176 erfassen,
  damit die App daraus Verbrauchs- und Einspeiseintervalle berechnen kann.

  Grundlage:
    Angenommen die App ist lokal geöffnet
    Und es existiert ein aktiver Stromzähler "Iskra MT176"

  Szenario: Erste Zählerablesung speichern
    Wenn ich einen Zählerstand mit folgenden Daten erfasse:
      | Zeitpunkt         | 2026-05-01 19:15 |
      | 1.8.0 Netzbezug  | 1200.0           |
      | 2.8.0 Einspeisung| 50.0             |
    Dann wird die Ablesung gespeichert
    Und die App zeigt "Erste Ablesung" an
    Und es wird noch kein Verbrauchsintervall berechnet

  Szenario: Zweite Zählerablesung erzeugt ein Intervall
    Angenommen es existiert eine Zählerablesung:
      | Zeitpunkt         | 2026-05-01 19:15 |
      | 1.8.0 Netzbezug  | 1200.0           |
      | 2.8.0 Einspeisung| 50.0             |
    Wenn ich einen Zählerstand mit folgenden Daten erfasse:
      | Zeitpunkt         | 2026-05-04 07:45 |
      | 1.8.0 Netzbezug  | 1210.5           |
      | 2.8.0 Einspeisung| 55.2             |
    Dann wird ein Intervall von "2026-05-01 19:15" bis "2026-05-04 07:45" berechnet
    Und der Netzbezug im Intervall beträgt "10.5 kWh"
    Und die Einspeisung im Intervall beträgt "5.2 kWh"
    Und die App zeigt einen normalisierten Netzbezug pro Tag an

  Szenario: Sinkender Zählerstand wird verhindert
    Angenommen es existiert eine Zählerablesung mit 1.8.0 "1200.0" und 2.8.0 "50.0"
    Wenn ich eine spätere Zählerablesung mit 1.8.0 "1199.0" und 2.8.0 "51.0" erfasse
    Dann wird der Eintrag nicht gespeichert
    Und die App zeigt eine Warnung zu einem möglichen Zählerwechsel an

  Szenario: Variable Uhrzeiten sind erlaubt
    Angenommen es existiert eine Zählerablesung am "2026-05-01 06:10"
    Wenn ich eine weitere Zählerablesung am "2026-05-03 22:40" erfasse
    Dann wird das Intervall anhand der tatsächlichen Stunden berechnet
    Und die App erzwingt keine Tagesablesung
```

### 17.2 Feature: PV-Tagesertrag erfassen

```gherkin
# language: de
Funktionalität: PV-Tagesertrag erfassen
  Als Nutzer von BalkonBilanz
  möchte ich die täglichen PV-Erträge aus der Solakon-App nachtragen,
  damit Eigenverbrauch und Speicherpotenzial besser geschätzt werden können.

  Grundlage:
    Angenommen das heutige lokale Datum ist "2026-05-11"
    Und die App ist lokal geöffnet

  Szenario: PV-Ertrag für vergangenen Tag speichern
    Wenn ich einen PV-Ertrag mit folgenden Daten erfasse:
      | Datum      | 2026-05-10 |
      | PV-Ertrag  | 3.2        |
    Dann wird der PV-Ertrag gespeichert
    Und die App zeigt für "2026-05-10" den Wert "3.2 kWh" an

  Szenario: PV-Ertrag für heutigen Tag ist nicht erlaubt
    Wenn ich einen PV-Ertrag für "2026-05-11" erfassen möchte
    Dann ist das Speichern nicht möglich
    Und die App zeigt "PV-Erträge können nur für abgeschlossene vergangene Tage eingetragen werden" an

  Szenario: PV-Ertrag für zukünftigen Tag ist nicht erlaubt
    Wenn ich einen PV-Ertrag für "2026-05-12" erfassen möchte
    Dann ist das Speichern nicht möglich
    Und die App zeigt eine verständliche Validierungsmeldung an

  Szenario: Bereits vorhandener PV-Tag wird bearbeitet
    Angenommen für "2026-05-10" existiert ein PV-Ertrag von "3.2 kWh"
    Wenn ich für "2026-05-10" den PV-Ertrag auf "3.5 kWh" ändere
    Dann zeigt die App für "2026-05-10" den Wert "3.5 kWh" an
    Und es existiert weiterhin genau ein PV-Eintrag für diesen Tag

  Szenario: PV-Ertrag wird nicht als Zeitraum erfasst
    Wenn ich die PV-Ertragsmaske öffne
    Dann gibt es genau ein Datumsfeld
    Und es gibt kein Feld für ein Enddatum
    Und es gibt kein Feld für eine Uhrzeit
```

### 17.3 Feature: Dashboard

```gherkin
# language: de
Funktionalität: Dashboard anzeigen
  Als Nutzer von BalkonBilanz
  möchte ich beim Öffnen der App die wichtigsten Kennzahlen sehen,
  damit ich schnell erkenne, ob meine Daten aktuell und plausibel sind.

  Szenario: Dashboard ohne Daten zeigt Einstiegshilfe
    Angenommen es existieren keine Zählerdaten
    Und es existieren keine PV-Daten
    Wenn ich das Dashboard öffne
    Dann sehe ich eine Einstiegshilfe
    Und ich sehe eine Aktion "Zählerstand eintragen"
    Und ich sehe eine Aktion "PV-Ertrag eintragen"

  Szenario: Dashboard zeigt letzte Zählerablesung und letzten PV-Ertrag
    Angenommen es existieren zwei Zählerablesungen
    Und es existiert ein PV-Ertrag für "2026-05-10" mit "3.2 kWh"
    Wenn ich das Dashboard öffne
    Dann sehe ich den letzten Zählerstand
    Und ich sehe den letzten PV-Ertrag
    Und ich sehe die Kennzahl "Ø Netzbezug pro Tag"

  Szenario: Dashboard zeigt Datenqualitätswarnung
    Angenommen im Analysezeitraum fehlen PV-Erträge für mehrere Tage
    Wenn ich das Dashboard öffne
    Dann sehe ich eine Datenqualitätswarnung
    Und die Warnung erklärt, welche Daten fehlen
```

### 17.4 Feature: Analyse mit Zählerintervallen und PV-Tagesdaten

```gherkin
# language: de
Funktionalität: Analyse anzeigen
  Als Nutzer von BalkonBilanz
  möchte ich Zählerintervalle und PV-Tageswerte gemeinsam auswerten,
  damit ich Verbrauch, Einspeisung und Eigenverbrauch besser verstehe.

  Szenario: Zählerintervalle werden als Intervalle angezeigt
    Angenommen es existieren zwei Zählerablesungen mit unterschiedlichen Uhrzeiten
    Wenn ich die Analyse öffne
    Dann sehe ich ein Intervall mit Startzeitpunkt und Endzeitpunkt
    Und die App bezeichnet den Wert nicht als echten Tagesverbrauch

  Szenario: PV-Tageswerte werden kalenderbasiert angezeigt
    Angenommen es existieren PV-Erträge für vergangene Tage
    Wenn ich die Analyse öffne
    Dann sehe ich die PV-Erträge gruppiert nach Kalendertag
    Und die App zeigt keine PV-Zeiträume an

  Szenario: Kombinierte Kennzahl wird als Näherung markiert
    Angenommen die Zählerintervalle passen zeitlich nicht exakt zu den PV-Tageswerten
    Wenn ich die kombinierte Analyse öffne
    Dann zeigt die App Eigenverbrauchsquote und Autarkiegrad als Schätzung an
    Und die App zeigt eine Erklärung zur eingeschränkten Genauigkeit

  Szenario: Fehlende PV-Tage reduzieren Datenqualität
    Angenommen der Analysezeitraum umfasst 10 vergangene Tage
    Und für 4 Tage fehlen PV-Erträge
    Wenn ich die Analyse öffne
    Dann zeigt die App eine eingeschränkte Datenqualität an
    Und die App nennt "4 fehlende PV-Tage" als Grund
```

### 17.5 Feature: Speicherberater

```gherkin
# language: de
Funktionalität: Speicherberater
  Als Nutzer von BalkonBilanz
  möchte ich einschätzen, ob ein Batteriespeicher sinnvoll wäre,
  damit ich keine Kaufentscheidung nur aus Bauchgefühl treffe.

  Grundlage:
    Angenommen der Strompreis beträgt "0.305 €/kWh"
    Und die Einspeisevergütung beträgt "0 €/kWh"
    Und der Speicherwirkungsgrad beträgt "85 %"

  Szenario: Speicherberater zeigt mehrere Szenarien
    Angenommen im Analysezeitraum wurden "100 kWh" eingespeist
    Wenn ich den Speicherberater öffne
    Dann sehe ich ein konservatives Szenario
    Und ich sehe ein realistisches Szenario
    Und ich sehe ein optimistisches Szenario
    Und ich sehe ein theoretisches Maximum

  Szenario: Speicherberater berücksichtigt Wirkungsgrad
    Angenommen im Analysezeitraum wurden "100 kWh" eingespeist
    Und das realistische Szenario nutzt "50 %" der Einspeisung
    Wenn die Speicherersparnis berechnet wird
    Dann werden vor Preisberechnung nur "42.5 kWh" als nutzbar angesetzt

  Szenario: Speicherberater warnt bei schlechter Datenqualität
    Angenommen die Datenqualität im Analysezeitraum ist "poor"
    Wenn ich den Speicherberater öffne
    Dann sehe ich eine deutliche Warnung
    Und die App empfiehlt eine längere Datenerfassung vor einer Kaufentscheidung
```

### 17.6 Feature: Einstellungen und Tarifhistorie

```gherkin
# language: de
Funktionalität: Einstellungen und Tarifhistorie
  Als Nutzer von BalkonBilanz
  möchte ich meinen Strompreis konfigurieren,
  damit Kosten und Speicherbewertung korrekt berechnet werden.

  Szenario: Initialer Strompreis ist vorbelegt
    Wenn ich die Einstellungen öffne
    Dann sehe ich den Strompreis "0.305 €/kWh"
    Und ich sehe die Einspeisevergütung "0 €/kWh"

  Szenario: Strompreis ändern
    Wenn ich den Strompreis auf "0.330 €/kWh" ändere
    Dann speichert die App den neuen Strompreis
    Und zukünftige Berechnungen verwenden "0.330 €/kWh"

  Szenario: Überlappende Tarifperioden werden verhindert
    Angenommen es existiert ein Tarif ab "2026-01-01"
    Wenn ich einen zweiten Tarif mit demselben Startdatum anlege
    Dann wird der Tarif nicht gespeichert
    Und die App zeigt eine Validierungsmeldung an
```

### 17.7 Feature: Backup und Restore

```gherkin
# language: de
Funktionalität: Backup und Restore
  Als Nutzer von BalkonBilanz
  möchte ich meine lokalen Daten exportieren und wiederherstellen,
  damit ich sie bei Gerätewechsel oder Browserproblemen nicht verliere.

  Szenario: Backup exportieren
    Angenommen es existieren Zählerdaten, PV-Daten und Einstellungen
    Wenn ich ein Backup exportiere
    Dann wird eine JSON-Datei erzeugt
    Und die Datei enthält eine Schema-Version
    Und die Datei enthält die App-Daten

  Szenario: Backup wiederherstellen
    Angenommen ich habe eine gültige BalkonBilanz-Backup-Datei
    Wenn ich das Backup importiere
    Dann zeigt die App eine Vorschau der enthaltenen Daten
    Und nach Bestätigung werden die Daten wiederhergestellt

  Szenario: Ungültiges Backup wird abgelehnt
    Angenommen ich wähle eine ungültige Datei aus
    Wenn ich das Backup importiere
    Dann werden keine vorhandenen Daten überschrieben
    Und die App zeigt eine Fehlermeldung an
```

### 17.8 Feature: PWA Offlinebetrieb

```gherkin
# language: de
Funktionalität: Offlinebetrieb als PWA
  Als Nutzer von BalkonBilanz
  möchte ich die App auch ohne Internet verwenden,
  damit ich Zählerstände direkt am Zähler erfassen kann.

  Szenario: App startet nach einmaligem Laden offline
    Angenommen die App wurde bereits einmal online geladen
    Wenn die Netzwerkverbindung deaktiviert wird
    Und ich die App erneut öffne
    Dann wird das Dashboard angezeigt
    Und die App zeigt nicht nur eine Browser-Fehlerseite

  Szenario: Zählerstand offline speichern
    Angenommen die App ist offline geöffnet
    Wenn ich einen gültigen Zählerstand erfasse
    Dann wird der Zählerstand lokal gespeichert
    Und er ist nach einem Neuladen weiterhin vorhanden

  Szenario: PV-Ertrag offline speichern
    Angenommen die App ist offline geöffnet
    Und das heutige lokale Datum ist "2026-05-11"
    Wenn ich einen PV-Ertrag für "2026-05-10" erfasse
    Dann wird der PV-Ertrag lokal gespeichert
    Und er ist nach einem Neuladen weiterhin vorhanden
```

---

## 18. UI-Test-Mapping pro Feature

| Feature | Mindestens ein UI-Test | Zusätzlich Unit Tests |
|---|---|---|
| Zählerstand erfassen | Formular ausfüllen, speichern, Intervall sehen | Intervallberechnung, Validierung |
| PV-Ertrag erfassen | gestrigen PV-Wert speichern | Datumsvalidierung, Duplikatregel |
| Dashboard | Kennzahlen nach Testdaten sichtbar | Dashboard-Service |
| Analyse | Intervall und PV-Tageswerte sichtbar | Datenqualität, Aggregation |
| Speicherberater | Szenarien berechnen und anzeigen | Szenarioformeln |
| Einstellungen | Strompreis ändern | Tarifvalidierung |
| Backup | Export/Import ausführen | Serialisierung, Schema-Prüfung |
| PWA Offline | App ohne Netzwerk öffnen und speichern | nicht primär Unit, eher E2E |

---

## 19. Implementierungsplan nach TDD

### 19.1 Sprint 0: Projektbasis

Ziele:

- Vite/Vue/TypeScript Projekt erzeugen
- Testumgebung einrichten
- Playwright einrichten
- Gherkin-Struktur anlegen
- erste leere App mit mobilem Layout

Definition of Done:

- `npm test` läuft
- `npm run test:e2e` läuft
- Startseite wird im mobilen Playwright-Test geöffnet
- CI-fähige Scripts existieren

### 19.2 Sprint 1: Lokale Datenbank

TDD-Schritte:

1. Unit Test für DB-Initialisierung schreiben.
2. Repository-Test für Speichern und Lesen von Zählerständen schreiben.
3. Dexie-DB implementieren.
4. Repository implementieren.
5. Testdaten-Builder ergänzen.

Definition of Done:

- Zählerstände können lokal gespeichert und gelesen werden.
- PV-Tageswerte können lokal gespeichert und gelesen werden.
- Tests laufen ohne echte UI.

### 19.3 Sprint 2: Zählerstand-Erfassung

TDD-Schritte:

1. Gherkin-Szenario für erste und zweite Ablesung schreiben.
2. Unit Tests für Intervallberechnung schreiben.
3. Component Test für Formularvalidierung schreiben.
4. Playwright UI-Test für Speichern schreiben.
5. Implementierung bauen.

Definition of Done:

- erste Ablesung zeigt „Erste Ablesung“
- zweite Ablesung erzeugt Intervall
- variable Uhrzeiten werden korrekt berücksichtigt
- sinkende Werte werden verhindert

### 19.4 Sprint 3: PV-Tagesertrag-Erfassung

TDD-Schritte:

1. Gherkin-Szenario für vergangenen Tag, heute, Zukunft schreiben.
2. Unit Tests für Datumsvalidierung schreiben.
3. Component Test für Datepicker/Datumseingabe schreiben.
4. Playwright UI-Test für Speichern schreiben.
5. Implementierung bauen.

Definition of Done:

- PV-Ertrag kann nur für vergangene Tage gespeichert werden.
- Pro Tag gibt es höchstens einen Eintrag.
- Es gibt keine Enddatum- oder Zeitraum-Eingabe.

### 19.5 Sprint 4: Dashboard

TDD-Schritte:

1. Gherkin-Szenario für leeren und gefüllten Zustand schreiben.
2. Unit Tests für Dashboard-Service schreiben.
3. Playwright-Test für Hauptansicht schreiben.
4. Implementierung bauen.

Definition of Done:

- Dashboard zeigt Einstiegshilfe ohne Daten.
- Dashboard zeigt letzte Werte mit Daten.
- Schnellaktionen funktionieren mobil.

### 19.6 Sprint 5: Analyse und Datenqualität

TDD-Schritte:

1. Gherkin-Szenarien für Intervallanzeige, PV-Tageswerte und fehlende PV-Daten schreiben.
2. Unit Tests für Datenqualitätsservice schreiben.
3. Unit Tests für kombinierte Schätzungen schreiben.
4. UI-Test für Analyseansicht schreiben.
5. Implementierung bauen.

Definition of Done:

- Zählerintervalle werden nicht als echte Tageswerte dargestellt.
- PV-Daten werden als Tageswerte dargestellt.
- Datenqualität ist sichtbar.

### 19.7 Sprint 6: Speicherberater

TDD-Schritte:

1. Gherkin-Szenarien für Szenarien und Wirkungsgrad schreiben.
2. Unit Tests für Szenarioformeln schreiben.
3. UI-Test für Speicherberater schreiben.
4. Implementierung bauen.

Definition of Done:

- vier Szenarien werden angezeigt.
- Break-even wird berechnet.
- schlechte Datenqualität erzeugt Warnung.

### 19.8 Sprint 7: Einstellungen, Tarifhistorie, Backup

TDD-Schritte:

1. Gherkin-Szenarien schreiben.
2. Unit Tests für Tarifvalidierung schreiben.
3. Unit Tests für Backup-Service schreiben.
4. UI-Tests für Einstellungen und Backup schreiben.
5. Implementierung bauen.

Definition of Done:

- Strompreis ist konfigurierbar.
- Default 0,305 €/kWh ist vorhanden.
- Backup-Export und Restore funktionieren.

### 19.9 Sprint 8: PWA-Ausbau

TDD-Schritte:

1. Offline-Gherkin-Szenarien schreiben.
2. Playwright-Test für Offline-Start schreiben.
3. `vite-plugin-pwa` integrieren.
4. Manifest und Icons ergänzen.
5. Offline-Test stabilisieren.

Definition of Done:

- App startet offline nach erstem Laden.
- Zählerstand kann offline gespeichert werden.
- PV-Ertrag kann offline gespeichert werden.
- Daten bleiben nach Reload erhalten.

---

## 20. Qualitätsanforderungen

### 20.1 Performance

- Dashboard lädt mit vorhandenen lokalen Daten unter 1 Sekunde auf typischem Smartphone.
- Keine Berechnung blockiert die UI merklich.
- Diagramme werden nur für den gewählten Zeitraum berechnet.

### 20.2 Barrierearmut

- alle Eingabefelder haben Labels
- Icons werden nicht allein zur Bedeutung genutzt
- Warnungen haben Text
- Kontrast ist ausreichend
- Buttons sind auf Mobilgeräten groß genug

### 20.3 Bedienbarkeit

- Zählerstand in weniger als 30 Sekunden eintragbar
- PV-Ertrag in weniger als 15 Sekunden eintragbar
- keine Pflicht zur täglichen Nutzung
- Fehlermeldungen erklären, was zu tun ist

### 20.4 Datenschutz

- keine personenbezogenen Daten notwendig
- keine Cloud
- kein Tracking
- keine Analytics im MVP
- keine externen Requests zur Laufzeit nach PWA-Installation

---

## 21. Risiken und Gegenmaßnahmen

| Risiko | Auswirkung | Gegenmaßnahme |
|---|---|---|
| Browserdaten werden gelöscht | Datenverlust | Backup/Restore früh einbauen |
| Service Worker cached alte Version | verwirrende Fehler | PWA erst spät aktivieren, Update-Hinweis testen |
| PV-Tage fehlen | ungenaue Speicherbewertung | Datenqualität sichtbar machen |
| Zählerintervalle sind sehr lang | schlechte Tagesinterpretation | normalisierte Werte und Warnung anzeigen |
| manuelle Tippfehler | falsche Auswertung | Plausibilitätswarnungen und Bearbeiten ermöglichen |
| zu viele UI-Tests | langsame Entwicklung | Fachlogik primär per Unit Test absichern |
| Fachlogik in Komponenten | schwer testbar | Services und pure functions erzwingen |

---

## 22. Roadmap

### MVP

- lokale Web-App
- Zählerstand-Erfassung
- PV-Tagesertrag-Erfassung
- Dashboard
- einfache Analyse
- Strompreis-Einstellung
- Unit Tests
- UI-Tests für Hauptflüsse

### MVP+

- Datenqualitätsmodell
- Speicherberater
- Tarifhistorie
- Backup/Restore
- Diagramme

### PWA-Release

- installierbare PWA
- Offlinebetrieb
- App-Manifest
- Service Worker
- Offline-Tests

### Spätere Optionen

- CSV-Export
- Monatsberichte
- mehrere Zähler
- mehrere Balkonkraftwerke
- optionale manuelle Speicher-Testphase
- optionaler Import, falls Solakon/Growatt jemals Export bereitstellt
- optionale SML-Auslesung als separates Projekt

---

## 23. Akzeptanzkriterien Gesamtprodukt

BalkonBilanz ist für den ersten produktiven Eigengebrauch fertig, wenn:

- Zählerstände mit `1.8.0` und `2.8.0` erfasst werden können.
- Zählerwerte als Intervalle berechnet werden.
- PV-Erträge nur für vergangene Tage erfasst werden können.
- PV-Erträge separat von Zählerständen gepflegt werden.
- Dashboard und Analyse verständliche Kennzahlen zeigen.
- Strompreis 0,305 €/kWh als Default vorhanden und änderbar ist.
- Einspeisevergütung 0 €/kWh als Default vorhanden ist.
- Speicherberater Szenarien mit Warnhinweisen liefert.
- Datenqualität sichtbar ist.
- Backup/Restore funktioniert.
- jedes größere Feature mindestens einen UI-Test hat.
- Fachlogik durch Unit Tests abgesichert ist.
- die App mobile-first nutzbar ist.
- nach PWA-Phase Offlinebetrieb getestet ist.

---

## 24. Quellen und technische Referenzen

- Vue 3 Quick Start: https://vuejs.org/guide/quick-start
- Vue Testing: https://vuejs.org/guide/scaling-up/testing
- Vite Guide: https://vite.dev/guide/
- Vite PWA Plugin: https://vite-pwa-org.netlify.app/
- Dexie.js: https://dexie.org/
- Playwright: https://playwright.dev/
- Cucumber / Gherkin: https://cucumber.io/docs/gherkin/
- Cucumber.js: https://cucumber.io/docs/installation/javascript/
- playwright-bdd: https://vitalets.github.io/playwright-bdd/
- Pinia: https://pinia.vuejs.org/
- Vitest: https://vitest.dev/
- Vue Testing Library: https://testing-library.com/docs/vue-testing-library/intro/
- Lucide Vue: https://lucide.dev/guide/vue

---

## 25. Offene Entscheidungen

| Entscheidung | Empfehlung | Status |
|---|---|---|
| DaisyUI vs. PrimeVue | mit Tailwind + DaisyUI starten | offen |
| Chart.js vs. ECharts | mit Chart.js starten | offen |
| Gherkin runner | playwright-bdd bevorzugen | offen |
| Backup-Merge | nach MVP | offen |
| App-Hosting | lokal/privat, später statisches Hosting möglich | offen |

---

## 26. Klare Startempfehlung

Starte nicht mit PWA, Speicherberater und Diagrammen gleichzeitig.

Die beste Reihenfolge ist:

```text
1. Vue/Vite/TypeScript Projekt
2. Testsetup mit Vitest und Playwright
3. Dexie-Datenbank
4. Zählerstand-Erfassung mit Intervallberechnung
5. PV-Tagesertrag-Erfassung
6. Dashboard
7. Analyse und Datenqualität
8. Speicherberater
9. Backup/Restore
10. PWA/Offlinefähigkeit
```

Das hält die Komplexität niedrig und passt gut zu TDD. Die Fachlogik wird stabil, bevor Service Worker und Browser-Caching ins Spiel kommen.

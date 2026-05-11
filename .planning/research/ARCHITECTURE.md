# Architecture Research

**Domain:** Local-first Energieanalyse (manuelle Zähler- und PV-Daten)  
**Researched:** 2026-05-11  
**Confidence:** HIGH

## Standard Architecture

### System Overview

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ UI Layer (Vue Views + Components, mobile-first)                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ Dashboard │ Zähler erfassen │ PV erfassen │ Analyse │ Speicherberater │ Mehr │
└───────┬──────────────────────────────────────────────────────────────────────┘
        │ user intents / rendering only
┌───────▼──────────────────────────────────────────────────────────────────────┐
│ Application Layer (Pinia Stores + Composables + Use Cases)                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ meterStore │ solarStore │ analyticsStore │ settingsStore │ backupStore       │
│ + orchestrierende Use Cases (createReading, runAnalysis, restoreBackup, …)  │
└───────┬──────────────────────────────────────────────────────────────────────┘
        │ calls
┌───────▼──────────────────────────────────────────────────────────────────────┐
│ Domain Layer (Pure Functions, deterministic)                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ IntervalCalc │ DataQuality │ SelfConsumptionEstimate │ BatteryScenarios      │
│ ValidationRules │ TariffSelection                                               │
└───────┬──────────────────────────────────────────────────────────────────────┘
        │ persistence contracts
┌───────▼──────────────────────────────────────────────────────────────────────┐
│ Data Layer (Repositories + Dexie/IndexedDB)                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ meterReadingRepo │ solarRepo │ tariffRepo │ settingsRepo │ backupRepo        │
│ Dexie schema versions + migrations + atomic transactions                     │
└───────┬──────────────────────────────────────────────────────────────────────┘
        │ static asset/runtime shell caching (Phase 3)
┌───────▼──────────────────────────────────────────────────────────────────────┐
│ PWA Layer (vite-plugin-pwa / Workbox)                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ App shell precache │ update prompt/auto-update policy │ offline bootstrap    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Vue Views/Components | Eingabe, Validierungsanzeige, Ergebnisdarstellung | SFCs ohne Fachberechnungen |
| Pinia Stores + Composables | UI-State, Lade-/Fehlerzustände, Orchestrierung | Actions rufen Use Cases auf |
| Use Cases/Services | Business-Workflows (z. B. „Ablesung speichern und Intervall refreshen“) | schlanke Klassen/Funktionen |
| Domain Functions | Reine Berechnung + fachliche Regeln | pure TypeScript functions, 100% unit-testbar |
| Repositories | Persistenzzugriff kapseln | Dexie Table APIs hinter klaren Interfaces |
| Dexie DB | Lokale, versionierte Datenhaltung | `db.version(n).stores(...)` + migrations |
| PWA/Service Worker | Offline Startfähigkeit, Cache-Lifecycle, Update-UX | `vite-plugin-pwa` (start with `generateSW`) |

## Recommended Project Structure

```text
src/
├── app/                     # App-Start, Router, globale Provider
│   ├── main.ts
│   └── router.ts
├── shared/                  # Querschnitt: DB, Utils, UI-Bausteine, Test-Builder
│   ├── db/
│   │   ├── balkonBilanzDb.ts
│   │   └── migrations.ts
│   ├── number/
│   ├── date/
│   └── ui/
├── features/                # Vertikale Feature-Slices
│   ├── meter-readings/
│   │   ├── views/
│   │   ├── store/
│   │   ├── service/
│   │   ├── domain/
│   │   └── repository/
│   ├── solar-generation/
│   ├── analytics/
│   ├── battery-advisor/
│   ├── settings/
│   └── backup-restore/
├── pwa/                     # erst ab PWA-Phase: update prompt, sw helper
└── types/                   # zentrale Domain-Typen

tests/
├── unit/                    # Domain & Service
├── component/               # Form/UI units
└── e2e/                     # Playwright + Gherkin Flows
```

### Structure Rationale

- **features/**: Fachlich getrennt, minimiert Coupling und erleichtert phasenweises Bauen.
- **shared/db/**: Eine einzige DB-Quelle verhindert inkonsistente Schema-Nutzung.
- **domain/** je Feature: Berechnungen bleiben unabhängig von Vue/Pinia und robust testbar.
- **pwa/** isoliert: Verhindert, dass SW-Logik früh in Kernfeatures “hineinblutet”.

## Architectural Patterns

### Pattern 1: Ports-and-Adapters im Kleinen

**What:** Use Cases hängen von Repository-Interfaces, nicht von Dexie direkt.  
**When to use:** Immer für schreib/lese Workflows mit Fachregeln.  
**Trade-offs:** Etwas mehr Boilerplate, dafür exzellente Testbarkeit.

**Example:**
```typescript
export interface MeterReadingRepository {
  save(reading: MeterReading): Promise<void>
  listByMeter(meterId: string): Promise<MeterReading[]>
}

export async function createMeterReading(
  repo: MeterReadingRepository,
  input: MeterReadingInput,
) {
  validateMeterReading(input)
  await repo.save(mapToEntity(input))
}
```

### Pattern 2: Deterministic Domain Core

**What:** Alle Kennzahlen als pure functions mit Decimal-String Input/Output.  
**When to use:** Intervall-, Qualitäts-, Speicher- und Tarifberechnungen.  
**Trade-offs:** Konvertierungsaufwand in UI/Repos, dafür keine versteckten Seiteneffekte.

**Example:**
```typescript
export function calculateMeterInterval(prev: MeterReading, next: MeterReading): MeterInterval {
  // no IO, no global state, deterministic output
  return {/* ... */} as MeterInterval
}
```

### Pattern 3: Transactional Write Model (Dexie)

**What:** Zusammengehörige Writes atomar in `db.transaction('rw', ...)`.  
**When to use:** Meterwechsel, Restore, Multi-Table-Updates.  
**Trade-offs:** Striktere Struktur nötig, verhindert aber Teilzustände.

**Example:**
```typescript
await db.transaction('rw', db.meters, db.meterReadings, db.meterChangeEvents, async () => {
  await db.meters.put(newMeter)
  await db.meterChangeEvents.add(changeEvent)
  await db.meterReadings.add(firstReadingForNewMeter)
})
```

## Data Flow

### Request Flow

```text
[User erfasst Zählerstand]
    ↓
[MeterReadingView submit]
    ↓
[meterStore.createReading]
    ↓
[createMeterReading use case]
    ↓
[validate rules + write via repository]
    ↓
[Dexie transaction commit]
    ↓
[read updated readings]
    ↓
[calculate intervals + quality]
    ↓
[store state update]
    ↓
[UI rerender + Feedback/Warnungen]
```

### State Management

```text
Pinia Store (single source of UI truth)
  ├─ actions: call use-cases
  ├─ state: entities + derived summaries + async status
  └─ getters: lightweight view projections (no heavy business math)

Heavy calculations live in domain/services and are injected into actions.
```

### Key Data Flows

1. **Capture Flow (Meter/PV):** UI → Store Action → Validation → Repository Write → Recompute affected aggregates.
2. **Analysis Flow:** Zeitraum wählen → Fetch interval + PV day sets → Domain aggregation → Data-quality scoring → Annotated result DTO for charts/cards.
3. **Backup/Restore Flow:** Export all tables + schema version; import validates version first, then atomic restore transaction.
4. **PWA Flow (later phase):** First online load precaches app shell; subsequent launches boot offline; update policy shows prompt before reloading.

## Build Order & Dependency Implications (for roadmap)

1. **Domain Contracts + Types zuerst**  
   Ohne stabile Typen (`MeterReading`, `MeterInterval`, `SolarDailyGeneration`) entstehen spätere Migrations- und Testbrüche.

2. **Dexie Schema + Repositories als Fundament**  
   Alle Feature-Flows hängen an korrekter Persistenz und Indizes (`readAt`, `date`, Tarif-Zeiträume).

3. **Meter + PV Capture Features vor Analytics**  
   Analytics ist vollständig abhängig von verlässlichen Input-Daten und Validierungsregeln.

4. **Data Quality Service vor Speicherberater**  
   Speicherempfehlungen ohne Qualitätslabel erzeugen Scheingenauigkeit.

5. **Backup/Restore vor PWA-Härtung**  
   Schutz vor Browserdatenverlust muss vor Offline-Rollout stehen.

6. **PWA-Schicht zuletzt**  
   Service Worker/Caching erschwert Debugging; erst integrieren, wenn Domain + Persistenz + Kernflows stabil und getestet sind.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k Nutzer (typisch) | Aktueller Client-only Ansatz reicht; Fokus auf Testbarkeit und UX |
| 1k-100k Installationen | Keine Server-Skalierung nötig; Fokus auf Migrationsstabilität, SW-Update-Strategie, Import/Export Robustheit |
| 100k+ Installationen | Optional: Telemetrie-freie Crash-Report-Mechanik (opt-in), evtl. später optionaler Sync-Dienst als separates Produkt |

### Scaling Priorities

1. **First bottleneck:** Datenkonsistenz bei Schemaänderungen → strikte Migrationstests + versionierte Backups.
2. **Second bottleneck:** SW-Update-Verwirrung → prompt-basierte Updates + klare „Neue Version verfügbar“-UX.

## Anti-Patterns

### Anti-Pattern 1: Fachlogik in Vue-Komponenten

**What people do:** Intervall-/Speicherformeln direkt in `*.vue`.  
**Why it's wrong:** schwer testbar, hohe Regression-Gefahr, Copy/Paste-Rechenlogik.  
**Do this instead:** Pure domain functions + service orchestration.

### Anti-Pattern 2: Frühes aggressive SW-Caching

**What people do:** PWA von Tag 1 mit Auto-Update + breiten Runtime-Caches.  
**Why it's wrong:** stale UI, schwer reproduzierbare Fehler, Debugging-Hölle.  
**Do this instead:** PWA erst in später Phase, mit enger Cache-Policy (App shell), kontrollierter Update-UX.

### Anti-Pattern 3: Float-basierte Energierechnung

**What people do:** `number`/Float direkt für kWh- und Euro-Formeln.  
**Why it's wrong:** Rundungsfehler summieren sich und untergraben Vertrauen.  
**Do this instead:** Decimal-Strings + zentrale Rechen-/Rundungsutilities.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Keine Laufzeit-Cloud | N/A | Zielarchitektur bleibt offline-first, lokal-only |
| Browser PWA APIs | Manifest + Service Worker | Nur für Shell/Assets, nicht für Fachdatenhaltung |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| UI ↔ Store | direkte Action-Aufrufe | keine Fachberechnung im UI |
| Store ↔ Use Case | Funktionsaufruf/DI | mockbar für Tests |
| Use Case ↔ Repository | Interface-basiert | Dexie austauschbar/migrationssicher |
| Repository ↔ Dexie | Adapter | alle DB writes kontrolliert/atomar |

## Sources

- Projektkontext: `.planning/PROJECT.md` (HIGH)
- Produktspezifikation: `balkonbilanz_spec_driven_development.md` (HIGH)
- Dexie docs (transactions/versioning): https://dexie.org/ und Context7 `/dexie/dexie.js` (HIGH)
- Vite PWA docs (registerType, strategies): https://vite-pwa-org.netlify.app/ und Context7 `/vite-pwa/vite-plugin-pwa` (HIGH)

---
*Architecture research for: BalkonBilanz (Architecture dimension)*  
*Researched: 2026-05-11*

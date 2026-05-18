# Phase 2: Analyse, Dashboard & Datenqualitaet - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 liefert ein Dashboard und eine Analyseansicht, die aus lokal erfassten Zaehler- und PV-Daten nachvollziehbare Intervall-, Kosten- und Kombinationsauswertungen mit sichtbarer Datenqualitaet erzeugen. Zur Phase gehoeren Leer- und Teilzustand, Zeitraumwahl, Qualitaetserklaerung, Plausibilitaetswarnungen und ehrliche Kostenanzeige. Tarifverwaltung, Speicherberatung und PWA-Verhalten bleiben ausserhalb dieser Phase.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` - Phase-2-Ziel, Success Criteria und Einordnung zwischen Phase 1 und Phase 3.
- `.planning/REQUIREMENTS.md` - INT-01..05, DASH-01..02, ANLY-01..04 und QUAL-01..03 als verbindliche Phase-2-Anforderungen.

### Product and upstream data constraints
- `.planning/PROJECT.md` - Produktprinzipien wie local-first, mobile-first, keine Scheingenauigkeit und das Schichtenmodell.
- `.planning/phases/01-datenerfassung-fachfundament/01-CONTEXT.md` - Lockt die Trennung aus Zaehlerereignissen und PV-Tageswerten, die Phase 2 nicht verwischen darf.

### Approved UI contract
- `.planning/phases/02-analyse-dashboard-datenqualitaet/02-UI-SPEC.md` - Verbindlicher UI-Vertrag fuer Bottom-Navigation, Dashboard-Hero, Qualitaetskarte, Estimate-Labeling sowie Loading-, Empty- und Error-States.

### Spec-driven delivery
- `balkonbilanz_spec_driven_development.md` - Fachliche und TDD-orientierte Umsetzungsleitplanke fuer weitere Phase-2-Planung und Testableitung.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/stores/captureStore.ts`: Etabliert den Zustandsschnitt fuer Meter- und PV-Daten und das Zusammenspiel aus Store, Services und Repositories.
- `src/db/database.ts`: Bietet die bestehende Browser-Wiring-Schicht fuer Dexie, Services und Store-Erzeugung; geeignet als Vorlage fuer Analyse-/Dashboard-Abhaengigkeiten.
- `src/features/meter/MeterReadingsList.vue` und `src/features/pv/PvDailyList.vue`: Vorhandenes mobile-first Card-/Listenmuster mit Sortierung `neueste zuerst`.
- `tests/support/captureTestUtils.ts`: In-memory Repositories und Store-Harness fuer fachliche Tests ohne Browser-Datenbank.
- `tests/e2e/mobile-capture.spec.ts`: Bestehendes Smoke-Muster fuer produktionsnahe Browserfluesse mit lokaler Persistenz.

### Established Patterns
- Die App ist aktuell eine schlanke Vue-SFC-Struktur ohne Router, Pinia oder Tailwind im produktiven Code; Phase 2 muss die genehmigte manuelle CSS-Linie fortsetzen.
- Daten fliessen heute ueber das Muster `Komponente -> Store -> Service -> Repository -> Dexie`, was auch fuer Analyse- und Dashboard-Logik anschlussfaehig ist.
- Die persistierte Datenbasis umfasst bisher nur Zaehlerablesungen und PV-Tageswerte; Intervalle, Tarife und abgeleitete Analyseobjekte muessen erst eingefuehrt oder zur Laufzeit berechnet werden.

### Integration Points
- `src/App.vue` und `src/main.ts`: Aktueller Single-Screen-Einstiegspunkt, an dem Phase 2 den neuen App-Shell-/Navigationszustand verankern muss.
- `src/domain/types.ts` und `src/db/schema.ts`: Muessen fuer kosten- und analysebezogene Datenmodelle erweitert oder durch abgeleitete Typen/Services ergaenzt werden.
- `package.json`: Vorhandene Testskripte setzen auf `node --test` und vorhandene Smoke-Flows; neue Analyse-/Dashboard-Tests sollten sich daran orientieren.

</code_context>

<specifics>
## Specific Ideas

- Kombinierte KPIs sollen trotz Unsicherheit nicht alarmistisch wirken, sondern moeglichst neutral erklaert werden.
- Kosten duerfen frueh sichtbar sein, aber der vorlaeufige Standardpreis soll nur im Detailhinweis auftauchen, nicht als dominante Warnetikette.
- Die Analyse soll sich wie eine alltagstaugliche mobile Auswertung anfuehlen: 30-Tage-Default, schnelle Presets und klare Rueckkehr zum Standardzustand.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 02-analyse-dashboard-datenqualitaet*
*Context gathered: 2026-05-12*

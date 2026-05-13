# Roadmap: BalkonBilanz

## Overview

Diese Roadmap liefert BalkonBilanz in vier aufeinander aufbauenden Faehigkeitsbloecken: erst verlässliche lokale Datenerfassung mit validen Zaehler-/PV-Regeln, dann nachvollziehbare Analyse mit Qualitaetskontext und Tarifen, danach resiliente Datensicherung plus Speicherberatung und zuletzt die PWA/Offline-Haertung. So entsteht frueh nutzbarer Fachwert ohne Cloud, mit klar als Naeherung gekennzeichneten Kennzahlen.

## Phases

- [ ] **Phase 1: Datenerfassung & Fachfundament** - Nutzer koennen Zaehler- und PV-Daten lokal korrekt erfassen und pflegen.
- [ ] **Phase 2: Analyse, Dashboard & Datenqualitaet** - Nutzer erhalten belastbare Auswertungen, Kostenbezug und transparente Unsicherheiten.
- [x] **Phase 3: Einstellungen, Backup & Speicherberater** - Nutzer koennen Annahmen steuern, Daten sichern/wiederherstellen und Speicher-Szenarien bewerten. (completed 2026-05-13)
- [ ] **Phase 4: PWA & Offline-Haertung** - Nutzer koennen die App robust offline nutzen und kontrolliert aktualisieren.

## Phase Details

### Phase 1: Datenerfassung & Fachfundament
**Goal**: Nutzer koennen alle notwendigen Eingabedaten (Zaehlerereignisse und PV-Tageswerte) lokal, valide und ohne Datenwidersprueche erfassen.
**Depends on**: Nothing (first phase)
**Requirements**: METER-01, METER-02, METER-03, METER-04, METER-05, METER-06, PV-01, PV-02, PV-03, PV-04, PV-05
**Success Criteria** (what must be TRUE):
  1. Nutzer kann Zaehlerablesungen mit Zeitpunkt sowie OBIS 1.8.0/2.8.0 erfassen, bearbeiten und loeschen.
  2. Nutzer wird beim Speichern ungueltiger oder kollidierender Zaehlerdaten (Pflichtfelder, Format, negative Werte, doppelter Zeitpunkt) klar blockiert.
  3. Nutzer kann bei sinkenden Zaehlerwerten entweder nicht speichern oder wird in einen dokumentierten Zaehlerwechsel-Flow gefuehrt.
  4. Nutzer kann PV-Ertraege nur fuer abgeschlossene vergangene Kalendertage erfassen/aktualisieren und sieht sie als reine Tageswerte in einer Liste.
**Plans**: 7 (01-01, 01-02, 01-03, 01-04, 01-05, 01-06 gap-closure, 01-07 gap-closure)
**UI hint**: yes

### Phase 2: Analyse, Dashboard & Datenqualitaet
**Goal**: Nutzer koennen aus den erfassten Daten Intervall-, Kosten- und Kombinationsauswertungen inklusive Qualitaetsaussage nachvollziehen.
**Depends on**: Phase 1
**Requirements**: INT-01, INT-02, INT-03, INT-04, INT-05, DASH-01, DASH-02, ANLY-01, ANLY-02, ANLY-03, ANLY-04, QUAL-01, QUAL-02, QUAL-03
**Success Criteria** (what must be TRUE):
  1. Nutzer sieht im Dashboard einen sinnvollen Leerzustand ohne Daten und bei vorhandenen Daten die letzte Ablesung, den letzten PV-Wert und zentrale Kennzahlen.
  2. Nutzer kann einen Analysezeitraum waehlen und pro Intervall Start/Ende/Dauer, Netzbezug, Einspeisung und kWh/Tag einsehen.
  3. Nutzer sieht Kosten fuer Netzbezug auf Basis gueltiger Tarife sowie Plausibilitaetswarnungen bei auffaelligen, aber speicherbaren Werten.
  4. Nutzer sieht kombinierte KPIs (z. B. Eigenverbrauch/Autarkie) explizit als Naeherung inkl. erklaerendem Hinweis.
  5. Nutzer sieht fuer kombinierte Auswertungen ein Qualitaetslevel (good/limited/poor) mit konkreten Gruenden und Warnung bei PV < Einspeisung.
**Plans**: 5 plans
Plans:
- [ ] 02-01-PLAN.md — TDD-Domain-Engine fuer Intervalle, Kosten-Fallback, Naeherung und Datenqualitaet
- [ ] 02-02-PLAN.md — Analyse-Service/Store mit Zeitraumsteuerung (7/30/90, Reset) und getrennten Intervall/PV-Listen
- [ ] 02-03-PLAN.md — Router-App-Shell + Dashboard/Analyse-Views gemaess UI-SPEC
- [ ] 02-04-PLAN.md — Verifikationspyramide (Unit/Component/Gherkin/Mobile-E2E) fuer Phase-2-Regression
- [ ] 02-05-PLAN.md — Gap-Closure fuer lesbare Warn-/Qualitaetscopy, Intervall-Flags und verdrahtete Dashboard-Schnellaktionen
**UI hint**: yes

### Phase 3: Einstellungen, Backup & Speicherberater
**Goal**: Nutzer koennen Rechenannahmen steuern, lokale Daten sicher migrierbar sichern/wiederherstellen und Speicherpotenzial in Szenarien bewerten.
**Depends on**: Phase 2
**Requirements**: SET-01, SET-02, SET-03, SET-04, BKP-01, BKP-02, BKP-03, BATT-01, BATT-02, BATT-03, BATT-04
**Success Criteria** (what must be TRUE):
  1. Nutzer sieht sinnvolle Standardwerte fuer Strompreis/Einspeisung und kann Preise, Tarifperioden (ohne Ueberlappung) sowie Datenqualitaetsmodus persistent konfigurieren.
  2. Nutzer kann ein vollstaendiges, schema-versioniertes JSON-Backup exportieren.
  3. Nutzer kann ein gueltiges Backup nach Vorschau und bestaetigtem Voll-Restore importieren; ungueltige Backups werden ohne Datenverlust abgewiesen.
  4. Nutzer kann im Speicherberater konservative, realistische, optimistische und theoretische Szenarien mit eigenen Parametern vergleichen.
  5. Nutzer sieht pro Szenario jaehrliche Einsparung und Break-even sowie bei schlechter Datenqualitaet eine deutliche Aussagekraft-Warnung.
**Plans**: 8 plans
Plans:
- [x] 03-01-PLAN.md — TDD-Basis für Einstellungen, Tarifperioden und Qualitätsmodus mit No-Overlap-Regeln
- [x] 03-02-PLAN.md — Versionierter Backup/Restore-Service mit Preview-Gate und Invalid-Import-Schutz
- [x] 03-03-PLAN.md — TDD-Speicherberater-Kernlogik mit vier Szenarien, Parametern und Qualitätswarnung
- [x] 03-04-PLAN.md — Mehr/Einstellungen-Route mit Settings-, Tarif- und Backup-UI gemäß 03-UI-SPEC
- [x] 03-05-PLAN.md — Speicherberater-UI-Verdrahtung plus Component/BDD/mobile Regression
- [x] 03-06-PLAN.md — Gap-Closure: Tarifperioden edit/delete in UI und sicheres malformed-Backup-Handling
- [x] 03-07-PLAN.md — Gap-Closure: Batterieberater mit Live-Analyse-/Settings-Verdrahtung und quality-getriebener Warnung
- [x] 03-08-PLAN.md — Gap-Closure: Analyse-output-basierte Einsparungslogik + reaktiver Settings-Refresh fuer Batterieberater
**UI hint**: yes

### Phase 4: PWA & Offline-Haertung
**Goal**: Nutzer koennen BalkonBilanz nach Erstladen offline weiterverwenden, Daten behalten und Updates kontrolliert erkennen.
**Depends on**: Phase 3
**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04, TEST-01, TEST-02, TEST-03, TEST-04, TEST-05
**Success Criteria** (what must be TRUE):
  1. Nutzer kann die App nach erstem Laden auch ohne Internet starten und bedienen.
  2. Nutzer kann offline neue Zaehlerablesungen und PV-Ertraege lokal speichern.
  3. Nutzerdaten bleiben nach Reload und App-Update erhalten.
  4. Nutzer sieht bei verfuegbaren neuen Versionen einen klaren Update-Hinweis.
  5. Nutzerrelevante Fachlogik und Hauptfluesse sind durch Unit-, Component-, UI/E2E-, Gherkin- und mobile Playwright-Tests nachweisbar abgesichert.
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Datenerfassung & Fachfundament | 3/7 (planned incl. gap-closure) | Gaps found (replan required) | - |
| 2. Analyse, Dashboard & Datenqualitaet | 0/5 (planned incl. gap-closure) | Replan complete | - |
| 3. Einstellungen, Backup & Speicherberater | 8/8 | Complete   | 2026-05-13 |
| 4. PWA & Offline-Haertung | 0/TBD | Not started | - |

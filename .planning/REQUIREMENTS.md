# Requirements: BalkonBilanz

**Defined:** 2026-05-11
**Core Value:** Der Nutzer kann mit wenig Aufwand belastbare, transparent als Naeherung gekennzeichnete Aussagen zu Verbrauch, Einspeisung und Speicherwirtschaftlichkeit aus lokalen Daten ableiten.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Meter Readings

- [x] **METER-01**: Nutzer kann eine Zaehlerablesung mit Zeitpunkt sowie OBIS 1.8.0 und 2.8.0 erfassen.
- [x] **METER-02**: Nutzer kann mehrere Ablesungen mit variablen Uhrzeiten erfassen, ohne Tagesrhythmus-Zwang.
- [x] **METER-03**: Nutzer kann eine gespeicherte Zaehlerablesung bearbeiten oder loeschen.
- [x] **METER-04**: Nutzer wird beim Speichern blockiert, wenn Pflichtwerte fehlen, negativ sind oder ungueltig formatiert sind.
- [x] **METER-05**: Nutzer wird beim Speichern blockiert, wenn eine neue Ablesung denselben Zeitpunkt wie eine bestehende Ablesung hat.
- [x] **METER-06**: Nutzer wird bei sinkenden Zaehlerwerten blockiert oder in einen dokumentierten Zaehlerwechsel-Flow gefuehrt.

### Meter Intervals And Costs

- [ ] **INT-01**: Nutzer sieht fuer jede aufeinanderfolgende Ablesung ein berechnetes Intervall mit Start, Ende und Dauer.
- [ ] **INT-02**: Nutzer sieht pro Intervall den berechneten Netzbezug und die Einspeisung als kWh-Differenz.
- [ ] **INT-03**: Nutzer sieht pro Intervall normalisierte Kennzahlen in kWh/Tag.
- [ ] **INT-04**: Nutzer sieht eine Kostenberechnung fuer Netzbezug auf Basis des gueltigen Tarifs.
- [ ] **INT-05**: Nutzer sieht bei auffaelligen, aber speicherbaren Werten (z. B. grosser Sprung) eine Plausibilitaetswarnung.

### PV Daily Generation

- [x] **PV-01**: Nutzer kann einen PV-Ertrag fuer einen abgeschlossenen vergangenen Kalendertag erfassen.
- [x] **PV-02**: Nutzer kann keinen PV-Ertrag fuer heute oder die Zukunft speichern.
- [x] **PV-03**: Nutzer kann einen bestehenden PV-Tageswert fuer denselben Tag bearbeiten, ohne Duplikate zu erzeugen.
- [x] **PV-04**: Nutzer sieht PV-Ertraege als Tageswerte ohne Enddatum- oder Uhrzeitkonzept.
- [x] **PV-05**: Nutzer kann PV-Eintraege in einer Liste mit Datum, Wert, Notiz und Quelle anzeigen.

### Dashboard And Analytics

- [ ] **DASH-01**: Nutzer sieht im Dashboard einen leeren Einstiegszustand mit Schnellaktionen, wenn noch keine Daten vorhanden sind.
- [ ] **DASH-02**: Nutzer sieht im Dashboard die letzte Zaehlerablesung, den letzten PV-Wert und zentrale Kennzahlen, sobald Daten vorliegen.
- [ ] **ANLY-01**: Nutzer kann einen Analysezeitraum waehlen und Intervallwerte fuer Netzbezug/Einspeisung anzeigen.
- [ ] **ANLY-02**: Nutzer sieht PV-Tageswerte kalenderbasiert und getrennt von Zaehlerintervallen.
- [ ] **ANLY-03**: Nutzer sieht kombinierte Kennzahlen (Eigenverbrauchsquote, Autarkiegrad) als klar markierte Schaetzung.
- [ ] **ANLY-04**: Nutzer sieht einen erklaerenden Hinweis, dass die Kombination von Intervall- und Tagesdaten eine Naeherung ist.

### Data Quality And Plausibility

- [ ] **QUAL-01**: Nutzer sieht fuer kombinierte Auswertungen ein Datenqualitaetslevel (`good`, `limited` oder `poor`).
- [ ] **QUAL-02**: Nutzer sieht zur Datenqualitaet konkrete Gruende (z. B. fehlende PV-Tage, lange Intervalle, geringe Ueberlappung).
- [ ] **QUAL-03**: Nutzer sieht eine Plausibilitaetswarnung, wenn PV-Erzeugung kleiner als Einspeisung ausfaellt.

### Battery Advisor

- [ ] **BATT-01**: Nutzer kann im Speicherberater mindestens konservatives, realistisches, optimistisches und theoretisches Szenario vergleichen.
- [ ] **BATT-02**: Nutzer kann Speicherpreis, Speicherkapazitaet, Wirkungsgrad und Betrachtungszeitraum als Eingaben setzen.
- [ ] **BATT-03**: Nutzer sieht je Szenario die geschaetzte jaehrliche Einsparung und den Break-even in Jahren.
- [ ] **BATT-04**: Nutzer sieht bei schlechter Datenqualitaet eine deutliche Warnung zur eingeschraenkten Aussagekraft.

### Settings And Tariffs

- [ ] **SET-01**: Nutzer sieht standardmaessig 0.305 EUR/kWh als Strompreis und 0 EUR/kWh als Einspeiseverguetung.
- [ ] **SET-02**: Nutzer kann Strompreis und Einspeisewert aendern und fuer kuenftige Berechnungen speichern.
- [ ] **SET-03**: Nutzer kann Tarifperioden verwalten, ohne dass Zeitraeume sich ueberlappen.
- [ ] **SET-04**: Nutzer kann den Datenqualitaetsmodus (`relaxed`, `balanced`, `strict`) konfigurieren.

### Backup And Restore

- [ ] **BKP-01**: Nutzer kann ein vollstaendiges, schema-versioniertes JSON-Backup aller lokalen Daten exportieren.
- [ ] **BKP-02**: Nutzer kann ein gueltiges Backup nach Vorschau und bestaetigtem Voll-Restore importieren.
- [ ] **BKP-03**: Nutzer wird bei ungueltigem Backup am Import gehindert, ohne bestehende Daten zu ueberschreiben.

### PWA And Offline

- [ ] **PWA-01**: Nutzer kann die App nach erstmaligem Laden auch ohne Internet starten.
- [ ] **PWA-02**: Nutzer kann offline neue Zaehlerablesungen und PV-Ertraege lokal speichern.
- [ ] **PWA-03**: Nutzerdaten bleiben nach App-Reload und App-Update erhalten.
- [ ] **PWA-04**: Nutzer sieht bei verfuegbaren neuen App-Versionen einen klaren Update-Hinweis.

### Quality Assurance

- [ ] **TEST-01**: Nutzerrelevante Fachlogik ist durch Unit Tests fuer Intervallberechnung, Validierung, Datenqualitaet und Speicherformeln abgesichert.
- [ ] **TEST-02**: Hauptformulare und Fehlermeldungen sind durch Component Tests abgesichert.
- [ ] **TEST-03**: Jeder groessere Hauptfluss ist durch mindestens einen UI/E2E-Test im Browser abgesichert.
- [ ] **TEST-04**: Pro groesserem Feature existiert mindestens ein ausfuehrbares Gherkin-Akzeptanzszenario.
- [ ] **TEST-05**: Mobile Hauptfluesse sind in Playwright-Mobilansicht verifiziert.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Extensions

- **EXT-01**: Nutzer kann mehrere Zaehler in derselben App getrennt verwalten.
- **EXT-02**: Nutzer kann mehrere Balkonkraftwerke getrennt auswerten.
- **EXT-03**: Nutzer kann CSV-Exporte und Monatsberichte erzeugen.
- **EXT-04**: Nutzer kann optional einen stabilen externen Datenimport (falls Anbieter-API verfuegbar) aktivieren.
- **EXT-05**: Nutzer kann eine optionale manuelle Speicher-Testphase mit erweiterten Parametern nutzen.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Native Android- oder iOS-App | Web/PWA-first deckt Zielnutzung bei geringerer Komplexitaet ab |
| Account-System und Cloud-Sync im MVP | Widerspricht local-first und erhoeht Betriebs-/Sicherheitsaufwand |
| OCR-/IR-/SML-Zaehlerauslesung im MVP | Hohe Integrations- und Hardwarekomplexitaet fuer geringen Initialnutzen |
| Exakte zeitreihenbasierte Batteriesimulation im MVP | Datenbasis reicht dafuer nicht aus; Szenariologik ist passender |
| Dynamische Tarife im MVP | Hoher fachlicher und UX-Aufwand ohne Prioritaetsnutzen fuer v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| METER-01 | Phase 1 | Complete |
| METER-02 | Phase 1 | Complete |
| METER-03 | Phase 1 | Complete |
| METER-04 | Phase 1 | Complete |
| METER-05 | Phase 1 | Complete |
| METER-06 | Phase 1 | Complete |
| INT-01 | Phase 2 | Pending |
| INT-02 | Phase 2 | Pending |
| INT-03 | Phase 2 | Pending |
| INT-04 | Phase 2 | Pending |
| INT-05 | Phase 2 | Pending |
| PV-01 | Phase 1 | Complete |
| PV-02 | Phase 1 | Complete |
| PV-03 | Phase 1 | Complete |
| PV-04 | Phase 1 | Complete |
| PV-05 | Phase 1 | Complete |
| DASH-01 | Phase 2 | Pending |
| DASH-02 | Phase 2 | Pending |
| ANLY-01 | Phase 2 | Pending |
| ANLY-02 | Phase 2 | Pending |
| ANLY-03 | Phase 2 | Pending |
| ANLY-04 | Phase 2 | Pending |
| QUAL-01 | Phase 2 | Pending |
| QUAL-02 | Phase 2 | Pending |
| QUAL-03 | Phase 2 | Pending |
| BATT-01 | Phase 3 | Pending |
| BATT-02 | Phase 3 | Pending |
| BATT-03 | Phase 3 | Pending |
| BATT-04 | Phase 3 | Pending |
| SET-01 | Phase 3 | Pending |
| SET-02 | Phase 3 | Pending |
| SET-03 | Phase 3 | Pending |
| SET-04 | Phase 3 | Pending |
| BKP-01 | Phase 3 | Pending |
| BKP-02 | Phase 3 | Pending |
| BKP-03 | Phase 3 | Pending |
| PWA-01 | Phase 4 | Pending |
| PWA-02 | Phase 4 | Pending |
| PWA-03 | Phase 4 | Pending |
| PWA-04 | Phase 4 | Pending |
| TEST-01 | Phase 4 | Pending |
| TEST-02 | Phase 4 | Pending |
| TEST-03 | Phase 4 | Pending |
| TEST-04 | Phase 4 | Pending |
| TEST-05 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 45 total
- Mapped to phases: 45
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-11*
*Last updated: 2026-05-11 after initial definition*

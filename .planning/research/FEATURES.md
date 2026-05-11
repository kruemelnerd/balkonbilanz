# Feature Research

**Domain:** Local-first Home-Energy-Tracking (Balkonkraftwerk + manueller Zähler)
**Researched:** 2026-05-11
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Manuelle Erfassung von Zählerständen (1.8.0/2.8.0) mit Datum/Uhrzeit | Kern-Input ohne den es keine Auswertung gibt | MEDIUM | Muss Ereignis-basiert sein (keine Tagesverbrauch-Fiktion). |
| Intervallberechnung aus aufeinanderfolgenden Ablesungen inkl. kWh/Tag-Normalisierung | Nutzer erwarten sofort nutzbare Kennzahlen aus Eingaben | MEDIUM | Exakte Differenzen + klar als Intervall kommunizieren. |
| PV-Tageserfassung für vergangene Tage | Bei Balkonkraftwerk Standard-Workflow (abends/nachträglich eintragen) | LOW | Heute/Zukunft blockieren, 1 Eintrag pro Tag. |
| Dashboard mit letztem Stand + wichtigsten Kennzahlen | Erwarteter „auf einen Blick“-Einstieg | MEDIUM | Leerer Zustand + Schnellaktionen „Zähler“/„PV“. |
| Analyseansicht (Verbrauch, Einspeisung, PV, Zeitraumfilter) | Ohne Analyse ist App nur Datenspeicher | HIGH | Muss Intervall- und Tagesdaten getrennt darstellen. |
| Plausibilitätsvalidierung + verständliche Fehlermeldungen | Nutzer erwarten Schutz vor Tippfehlern | MEDIUM | Sinkende Zählerstände blockieren oder Zählerwechsel erzwingen. |
| Preis-/Tarif-Einstellungen (mind. aktueller Strompreis) | Kosten-/Spar-Aussagen ohne Preis sind wertlos | MEDIUM | Default-Werte vorbelegen, spätere Tarifhistorie unterstützen. |
| Backup/Restore lokaler Daten | Bei lokal-first zwingend gegen Browser-/Geräteverlust | MEDIUM | Versioniertes JSON, Validierung vor Import. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Ehrliches Datenqualitätsmodell (good/limited/poor + Begründung) | Baut Vertrauen auf, verhindert Scheingenauigkeit | HIGH | Bei kombinierten Kennzahlen immer sichtbar anzeigen. |
| „Näherungsbewusste“ Kombinationslogik (Intervallstrom + PV-Tageswerte) | Löst reales Datenraster-Problem besser als naive Tagessummen | HIGH | Klare UX-Texte: Schätzung, nicht Messwert. |
| Speicherberater mit Szenarien (konservativ/realistisch/optimistisch/theoretisch) + Wirkungsgrad + Break-even | Direkter Nutzwert für Kaufentscheidung ohne Überversprechen | HIGH | Als Entscheidungsunterstützung, nicht Batteriesimulation. |
| Mobile-first Erfassungsgeschwindigkeit (Zähler <30s, PV <15s) | In realen Keller/Balkon-Situationen entscheidend für Nutzungstreue | MEDIUM | Große Inputs, numerische Tastatur, sticky Save. |
| Lokale Datenhoheit ohne Konto/Cloud/Tracking | Starke Positionierung für privacy-bewusste Nutzer | MEDIUM | Klare Produktbotschaft + keine externen Laufzeitabhängigkeiten. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Automatischer Solakon/Growatt-Import im MVP | „Weniger manuelle Arbeit“ | Hohe Integrations-/Wartungslast, API-Drift, Scope-Sprengung | Saubere manuelle Tageserfassung + später optionales Import-Modul. |
| OCR/IR/SML-Zählerauslese im MVP | „Komfort, keine Tippfehler“ | Hardware-/Kalibrierungs-/Gerätefragmentierung, hoher Supportaufwand | Starke Validierung + schnelle manuelle Eingabe. |
| Exakte zeitreihenbasierte Batteriesimulation | Klingt präziser und professioneller | Benötigt hochfrequente Daten, passt nicht zu manuellem Datenmodell | Szenario-basierter Speicherberater mit Unsicherheitskommunikation. |
| Cloud-Account + Sync als Standard | Gerätübergreifender Zugriff | Widerspricht local-first/privacy, erhöht Betriebs- und Sicherheitsrisiko | Lokales Backup/Restore, optional später expliziter Opt-in-Sync. |
| Dynamische Tarife im MVP | „Zukunftssicher“ | Fachlich und UX-seitig komplex, lenkt von Kernproblem ab | Feste Tarife + Tarifhistorie, dynamisch erst nach Validierung. |

## Feature Dependencies

```
Manuelle Zählererfassung
    └──requires──> Validierung (OBIS, monotone Werte, Timestamp-Regeln)
                        └──enables──> Intervallberechnung

Intervallberechnung + PV-Tageserfassung
    └──requires──> Zeitraum-Analyse
                        └──enables──> Kombinierte Kennzahlen (Näherung)
                                             └──requires──> Datenqualitätsmodell
                                                                  └──enables──> Speicherberater mit Warnkontext

Lokale Datenhaltung
    └──requires──> Backup/Restore

Tarif-/Preis-Einstellungen
    └──enhances──> Kostenkennzahlen und Speicherberatung

Auto-Import/OCR/SML (MVP)
    └──conflicts──> Fokus auf schnelle, robuste MVP-Auslieferung
```

### Dependency Notes

- **Intervallberechnung requires valide Ereignisdaten:** Ohne korrekte Zeitpunkte/monotone Zählerstände sind Kennzahlen unbrauchbar.
- **Kombinierte Kennzahlen require Datenqualitätsmodell:** Sonst werden Schätzungen als Fakten fehlinterpretiert.
- **Speicherberater requires Analyse + Tarife + Qualität:** Ohne diese Basis sind Break-even-Werte irreführend.
- **Local-first requires Backup/Restore:** Sonst wird Datenverlust zum Produkt-Killer.
- **Auto-Import/OCR/SML conflicts with MVP-Fokus:** Verzögert Kernnutzen und erhöht technisches Risiko stark.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Zählerstand-Erfassung als Ereignis (1.8.0/2.8.0 + Zeitpunkt) — fundamentaler Dateninput
- [ ] Intervallberechnung + Basis-Dashboard + Analyse — unmittelbarer Nutzwert aus Daten
- [ ] PV-Tageserfassung (nur vergangene Tage) — notwendig für Eigenverbrauchs-/Einspeiseverständnis
- [ ] Plausibilitätsregeln + verständliche Warnungen — verhindert grobe Fehlinterpretationen
- [ ] Strompreis-Einstellung (Default + editierbar) — Kostenbezug für Entscheidungen
- [ ] Backup/Restore (vollständig, versioniert) — Absicherung local-first Nutzung

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Datenqualitätsmodell mit Explainability — sobald Nutzer regelmäßig kombinierte Auswertungen nutzen
- [ ] Speicherberater mit Szenarien und Break-even — nach stabiler Datenbasis über mehrere Wochen
- [ ] Tarifhistorie — wenn Preiswechsel historisch relevant werden
- [ ] Diagrammvergleiche für Zeiträume — wenn Analysefrequenz im Alltag steigt

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] PWA-Offline-Schicht mit Service Worker — nach stabiler Kernlogik (Debugging-Risiko sonst hoch)
- [ ] Optionaler CSV-Export/erweiterte Reports — für Power-User, nicht für MVP-Validierung
- [ ] Optionaler Import-Konnektor (falls stabile Anbieter-API) — nur als separater, gekapselter Ausbau
- [ ] Mehrzähler-/Mehranlagenfähigkeit — erst nach Single-Household-Product-Fit

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Zählerereignisse + Intervallberechnung | HIGH | MEDIUM | P1 |
| PV-Tageserfassung | HIGH | LOW | P1 |
| Dashboard + Basisanalyse | HIGH | MEDIUM/HIGH | P1 |
| Validierung + Plausibilitätswarnungen | HIGH | MEDIUM | P1 |
| Preis-Einstellungen + einfache Kostenrechnung | HIGH | MEDIUM | P1 |
| Backup/Restore | HIGH | MEDIUM | P1 |
| Datenqualitätsmodell (Explainability) | HIGH | HIGH | P2 |
| Speicherberater (Szenarien) | HIGH | HIGH | P2 |
| Tarifhistorie | MEDIUM | MEDIUM | P2 |
| PWA Offline-Layer | MEDIUM/HIGH | HIGH | P3 (zeitlich spät) |
| Auto-Import/OCR/SML | MEDIUM | HIGH | P3 / Anti-Feature für MVP |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Home Assistant Energy | SolarAssistant | Our Approach |
|---------|------------------------|----------------|--------------|
| Energie-Dashboard (Verbrauch/Produktion/Speicher) | Umfassend, viele Datenquellen/Integrationen | Echtzeit-Dashboard je Inverter-Setup | Schlankes, erklärbares Dashboard für manuelle Datenbasis |
| Historische Analyse | Vorhanden, stark integrationsgetrieben | Charts/Totals vorhanden | Intervall + Tagesdaten mit Qualitätskennzeichnung |
| Backup/Export | Plattformabhängig, aber Ökosystem-stark | CSV-Export + Backup/Restore dokumentiert | Versioniertes JSON Backup/Restore als Kernfunktion |
| Lokale/Privacy-Orientierung | Stark selbst-hostbar/lokal möglich | Lokales Device-Monitoring | Browser-local-first ohne Konto/Cloud als Standard |

## Sources

- BalkonBilanz PROJECT.md und Spezifikation (interne Primärquelle, HIGH)
- Home Assistant Energy docs: https://www.home-assistant.io/docs/energy/ (HIGH)
- OpenEnergyMonitor / emonCMS docs index: https://docs.openenergymonitor.org/emoncms/ (MEDIUM; eher Strukturüberblick)
- SolarAssistant docs (Dashboard, Export, Backup):
  - https://www.solar-assistant.io/help/dashboard/overview (MEDIUM)
  - https://www.solar-assistant.io/help/historic-data/export (MEDIUM)
  - https://www.solar-assistant.io/help/historic-data/backup (MEDIUM)

---
*Feature research for: Local-first home-energy tracking (BalkonBilanz)*
*Researched: 2026-05-11*

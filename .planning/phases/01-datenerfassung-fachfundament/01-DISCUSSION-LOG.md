# Phase 1: Datenerfassung & Fachfundament - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-11T10:37:25+02:00
**Phase:** 1-Datenerfassung & Fachfundament
**Areas discussed:** Zaehlererfassung, Validierung und Fachregeln, PV-Tageswerte, Darstellungs- und Bedienkontext

---

## Zaehlererfassung

| Option | Description | Selected |
|--------|-------------|----------|
| Ereignisbasiert mit Datum/Uhrzeit + OBIS 1.8.0/2.8.0 Feldern | Entspricht Fachmodell und Iskra-Zaehlerlogik | ✓ |
| Tagesaggregierte Eingabe ohne genaue Uhrzeit | Weniger Eingabeaufwand, aber fachlich unpraezise | |
| Hybrid mit optionaler Uhrzeit | Mehr Flexibilitaet, aber inkonsistente Datenbasis | |

**User's choice:** Ereignisbasiert mit Datum/Uhrzeit + OBIS 1.8.0/2.8.0 Feldern (auto recommended)
**Notes:** [auto] Default gewaehlt, da direkt mit ROADMAP Phase-1-Ziel und METER-Requirements konsistent.

---

## Validierung und Fachregeln

| Option | Description | Selected |
|--------|-------------|----------|
| Harte Blockierung bei ungueltigen Werten + dokumentierter Zaehlerwechsel-Flow | Verhindert Datenwidersprueche frueh und klar | ✓ |
| Nur Warnungen, trotzdem speichern | Schnellere Eingabe, aber hohes Risiko fuer falsche Auswertungen | |
| Teilweise Blockierung, teilweise stille Korrektur | Wirkt komfortabel, verschleiert aber Datenmanipulation | |

**User's choice:** Harte Blockierung bei ungueltigen Werten + dokumentierter Zaehlerwechsel-Flow (auto recommended)
**Notes:** [auto] Default gewaehlt, da METER-04..06 explizit blockierende Regeln fordern.

---

## PV-Tageswerte

| Option | Description | Selected |
|--------|-------------|----------|
| Vergangene Kalendertage only, ein Wert pro Tag (Upsert) | Entspricht PV-01..04 und verhindert Duplikate | ✓ |
| Tageswerte inkl. heute/future | Komfortabel, aber fachlich falsch fuer abgeschlossene Ertraege | |
| Mehrere Werte pro Tag mit Uhrzeiten | Erhoeht Komplexitaet ohne Requirement-Mehrwert | |

**User's choice:** Vergangene Kalendertage only, ein Wert pro Tag (Upsert) (auto recommended)
**Notes:** [auto] Default gewaehlt, da PV-Daten laut Projektkontext strikt tagesbasiert sind.

---

## Darstellungs- und Bedienkontext

| Option | Description | Selected |
|--------|-------------|----------|
| Mobile-first Listenansicht, neueste zuerst, klare Fehlertexte | Schnell erfassbar auf Smartphone, geringe Fehlbedienung | ✓ |
| Tabellenlastige Desktop-Ansicht zuerst | Fuer Zielkontext (Android-Browser) unpassend | |
| Komplexe Mehrspalten-Ansicht mit Detailpanel | Zu schwergewichtig fuer Phase-1-Ziel | |

**User's choice:** Mobile-first Listenansicht, neueste zuerst, klare Fehlertexte (auto recommended)
**Notes:** [auto] Default gewaehlt, da PROJECT.md mobile-first Bedienung als Kern-Constraint setzt.

---

## OpenCode's Discretion

- Feldanordnung innerhalb der Erfassungsformulare.
- Inline-Hilfe und Mikrocopy, solange Blockierungsregeln fachlich unveraendert bleiben.

## Deferred Ideas

None.

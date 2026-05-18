# Phase 2: Analyse, Dashboard & Datenqualitaet - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `02-CONTEXT.md` - this log preserves the alternatives considered.

**Date:** 2026-05-12
**Phase:** 02-analyse-dashboard-datenqualitaet
**Areas discussed:** Datenqualitaet, KPI-Naeherung, Zeitraumsteuerung, Kostenbasis

---

## Datenqualitaet

| Option | Description | Selected |
|--------|-------------|----------|
| Streng ueberlappend | Nur wenn kurze Zaehlerintervalle und fast vollstaendige PV-Tage im Zeitraum zusammenpassen. Ehrlich, aber schneller `limited`. | |
| Ausgewogen | Kleine Luecken sind okay, solange der Zeitraum insgesamt noch belastbar wirkt. | ✓ |
| Grosszuegig | `good` schon dann, wenn sich trotz grober Datenlage eine klare Tendenz ableiten laesst. | |
| OpenCode entscheidet | OpenCode leitet spaeter sinnvolle Schwellen aus Requirements und UI-SPEC ab. | |

**User's choice:** Ausgewogen
**Notes:** `good` darf erreichbar bleiben; ab Intervallen ueber 7 Tagen soll die Qualitaet spaetestens kippen. Fehlende PV-Tage sollen ueber eine Vollstaendigkeitsquote wirken. `poor` zeigt KPIs weiterhin, aber abgegraut und mit Warnung.

---

## KPI-Naeherung

| Option | Description | Selected |
|--------|-------------|----------|
| Eher konservativ | Im Zweifel lieber etwas zu vorsichtig als zu optimistisch. | |
| Moeglichst neutral | Sucht die Mitte zwischen Unter- und Ueberschaetzung. | ✓ |
| Eher optimistisch | Zeigt das eher positive Potenzial, auch wenn die Datenlage lueckig ist. | |
| OpenCode entscheidet | OpenCode leitet spaeter eine sinnvolle Produktlinie ab. | |

**User's choice:** Moeglichst neutral
**Notes:** Zeitraumbezogener grober Abgleich zwischen Zaehlerintervallen und PV-Tagen ist akzeptabel. Kombinierte KPIs duerfen schon mit Minimalbasis erscheinen. Bei `PV < Einspeisung` bleiben sie sichtbar, aber mit Warnung und downgradeter Qualitaet.

---

## Zeitraumsteuerung

| Option | Description | Selected |
|--------|-------------|----------|
| Letzte 30 Tage | Genug Substanz fuer unregelmaessige manuelle Daten, ohne gleich zu breit zu werden. | ✓ |
| Letzte 7 Tage | Frischer und fokussierter, kann aber oft zu duenne Daten zeigen. | |
| Aktueller Monat | Kalenderlogisch, aber je nach Monatsstand frueh unvollstaendig. | |
| OpenCode entscheidet | OpenCode waehlt spaeter den passendsten Standard. | |

**User's choice:** Letzte 30 Tage
**Notes:** Schnell-Presets sollen `7 / 30 / 90 Tage` plus freie Auswahl bieten. Reset geht auf den Standardzeitraum zurueck. Intervalle bleiben `neueste zuerst` sortiert, analog zu den bestehenden Listen.

---

## Kostenbasis

| Option | Description | Selected |
|--------|-------------|----------|
| Standardpreis + Override | Nutzt vorerst `0.305 EUR/kWh`; spaetere Tarifdaten duerfen ueberschreiben. | ✓ |
| Nur echte Tarifdaten | Kosten erscheinen erst, wenn spaeter echte Tarifdaten vorhanden sind. | |
| Nur Standardpreis | Phase 2 rechnet konsequent nur mit dem festen Default. | |
| OpenCode entscheidet | OpenCode waehlt spaeter die passendste Zwischenloesung. | |

**User's choice:** Standardpreis + Override
**Notes:** Der Standardpreis soll nur im Detailhinweis sichtbar sein. Spaetere Tariflogik soll pro Intervall denken. Wenn keine belastbare Basis vorliegt, zeigt die UI `Kosten noch nicht verfuegbar`.

---

## OpenCode's Discretion

- Exakte Schwellenbaender zwischen `good`, `limited` und `poor` innerhalb des ausgewogenen Modells.
- Endgueltige Mikrocopy fuer Standardpreis-Hinweise, Qualitaetsgruende und Plausibilitaetswarnungen.
- Genaue Platzierung und Ausgestaltung von Preset-Chips, Datumsfeldern und Reset-Bestaetigung.

## Deferred Ideas

None.

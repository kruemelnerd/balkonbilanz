# BalkonBilanz

## What This Is

BalkonBilanz ist eine mobile-first Web-App fuer Privatnutzer mit Balkonkraftwerk und Iskra MT176 Zaehler, um manuell erfasste Zaehlerstaende und PV-Tagesertraege lokal im Browser auszuwerten. Die App macht Netzbezug, Einspeisung, Eigenverbrauchsnahe und Speicherpotenzial nachvollziehbar, ohne Cloud, ohne Konto und ohne automatische Datenimporte. Sie ist bewusst als einfache, ehrliche Entscheidungsunterstuetzung fuer den Alltag konzipiert, nicht als professionelle Lastprofilanalyse.

## Core Value

Der Nutzer kann mit wenig Aufwand belastbare, transparent als Naeherung gekennzeichnete Aussagen zu Verbrauch, Einspeisung und Speicherwirtschaftlichkeit aus seinen eigenen lokalen Daten ableiten.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Zaehlerablesungen (OBIS 1.8.0 und 2.8.0) als Ereignisse mit Datum/Uhrzeit erfassen und validieren
- [ ] Zaehlerintervalle aus aufeinanderfolgenden Ablesungen korrekt berechnen (inkl. kWh/Tag-Normalisierung)
- [ ] PV-Erzeugung als Tageswerte fuer abgeschlossene vergangene Tage erfassen und pflegen
- [ ] Dashboard mit letzter Ablesung, letztem PV-Wert, Kennzahlen und Datenqualitaet bereitstellen
- [ ] Analyseansicht fuer Intervallwerte, PV-Tageswerte und kombinierte Naeherungen bereitstellen
- [ ] Speicherberater mit Szenarien (konservativ bis theoretisch) inkl. Wirkungsgrad und Break-even anbieten
- [ ] Einstellungen fuer Strompreis, Einspeisewert, Tarifhistorie und Datenqualitaetsmodus anbieten
- [ ] Backup/Restore der lokalen Daten als JSON (Schema-versioniert) anbieten
- [ ] TDD-First Umsetzung mit Unit-, Component-, UI/E2E- und Gherkin-Akzeptanzabdeckung je groesserem Feature
- [ ] Phaseweise Entwicklung: zuerst lokale Web-App und Fachlogik, danach PWA/Offline-Schicht

### Out of Scope

- Native Android- oder iOS-App — Web-App/PWA reduziert Komplexitaet bei gleichem Nutzwert
- Backend, Cloud-Sync, Benutzerkonten, Login — lokale Datenhoheit ist Kernprinzip
- Automatischer Solakon/Growatt-Import, OCR, IR/SML-Auslesung — bewusst MVP-fremd und aufwaendig
- Smart-Home-Integrationen und minutengenaue Lastprofilanalyse — Ziel ist robuste Naeherung, nicht Hochfrequenzmessung
- Exakte Batteriesimulation auf Zeitreihenbasis und dynamische Tarife — fuer MVP zu komplex, spaeter optional
- Mehrsprachigkeit und Play-Store-Distribution — kein MVP-Muss fuer Erstnutzung

## Context

- Nutzungskontext: Android-Smartphone im Browser, unregelmaessige manuelle Ablesungen, variable Uhrzeiten.
- Fachliche Datennatur:
  - Stromzaehler liefert kumulierte Gesamtstaende; Verbrauch/Einspeisung entstehen nur als Differenz zweier Zeitpunkte.
  - PV-Daten liegen als Tageswerte vor und duerfen nur fuer vergangene, abgeschlossene Tage gepflegt werden.
  - Kombinierte Kennzahlen aus Intervallen und Tageswerten sind Naeherungen; Datenqualitaet muss sichtbar sein.
- Kernobjekte laut Spezifikation: MeterReading, MeterInterval, SolarDailyGeneration, TariffPeriod, Meter, MeterChangeEvent, AppSettings.
- Zielgerichtete Entwicklungslogik:
  - Fachlogik als pure Functions ausserhalb von Vue-Komponenten.
  - Schichtenmodell UI -> Stores/Composables -> Services/Use Cases -> Repositories -> Dexie/IndexedDB.
  - Plausibilitaetsregeln blockieren ungueltige Eingaben und warnen bei auffaelligen, aber moeglichen Werten.
- Test- und Qualitaetskontext:
  - Jede groessere Funktion startet mit Gherkin + Tests vor Implementierung.
  - Mobile Hauptfluesse sind verpflichtend per Playwright zu testen (inkl. Mobile Emulation).

## Constraints

- **Tech stack**: Vue 3 + Vite + TypeScript + Vue Router + Pinia + Dexie + Tailwind + Lucide + Chart.js — passt zu SPA ohne Backend und lokaler DB-Nutzung.
- **Datenhaltung**: Ausschliesslich lokal in IndexedDB (Dexie) — keine Cloud und kein Account-System.
- **Domain constraint**: Zaehlerdaten sind kumuliert, PV-Daten tagesbasiert — kombinierte Auswertungen duerfen keine Scheingenauigkeit erzeugen.
- **UX constraint**: Mobile-first Bedienung mit grossen Eingaben, klarer Validierung und schneller Datenerfassung.
- **Qualitaetsconstraint**: TDD/Spec-Driven mit verpflichtender Testabdeckung ueber Unit, Component, UI/E2E und Gherkin.
- **Delivery strategy**: PWA/Service Worker erst nach stabiler Fachlogik und lokaler Web-App, um Debuggingrisiken zu minimieren.
- **Privacy**: Kein Tracking, keine Laufzeit-Analytics, keine externen Requests als funktionale Abhaengigkeit im Zielzustand.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mobile-first Web-App statt nativer App | Schnellerer, einfacher Start mit Fokus auf Android-Browsernutzung | — Pending |
| Lokale Datenhaltung via IndexedDB/Dexie | Datenhoheit, Offlinefaehigkeit, keine Backend-Betriebskosten | — Pending |
| TDD + Gherkin + Playwright als Qualitaetsbasis | Fachlich sensible Berechnungen und mobile Flows brauchen hohe Nachvollziehbarkeit | — Pending |
| Zaehler als Ereignisse, nicht Tageswerte modellieren | Entspricht physischer Realitaet des Iskra MT176 und verhindert Fehlinterpretationen | — Pending |
| PWA spaet in der Reihenfolge integrieren | Verhindert fruehe Service-Worker-Komplexitaet beim Debugging | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-11 after initialization*

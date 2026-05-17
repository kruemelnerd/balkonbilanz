<!-- GSD:project-start source:PROJECT.md -->
## Project

**BalkonBilanz**

BalkonBilanz ist eine mobile-first Web-App fuer Privatnutzer mit Balkonkraftwerk und Iskra MT176 Zaehler, um manuell erfasste Zaehlerstaende und PV-Tagesertraege lokal im Browser auszuwerten. Die App macht Netzbezug, Einspeisung, Eigenverbrauchsnahe und Speicherpotenzial nachvollziehbar, ohne Cloud, ohne Konto und ohne automatische Datenimporte. Sie ist bewusst als einfache, ehrliche Entscheidungsunterstuetzung fuer den Alltag konzipiert, nicht als professionelle Lastprofilanalyse.

**Core Value:** Der Nutzer kann mit wenig Aufwand belastbare, transparent als Naeherung gekennzeichnete Aussagen zu Verbrauch, Einspeisung und Speicherwirtschaftlichkeit aus seinen eigenen lokalen Daten ableiten.

### Constraints

- **Tech stack**: Vue 3 + Vite + TypeScript + Vue Router + Pinia + Dexie + Tailwind + Lucide + Chart.js — passt zu SPA ohne Backend und lokaler DB-Nutzung.
- **Datenhaltung**: Ausschliesslich lokal in IndexedDB (Dexie) — keine Cloud und kein Account-System.
- **Domain constraint**: Zaehlerdaten sind kumuliert, PV-Daten tagesbasiert — kombinierte Auswertungen duerfen keine Scheingenauigkeit erzeugen.
- **UX constraint**: Mobile-first Bedienung mit grossen Eingaben, klarer Validierung und schneller Datenerfassung.
- **Qualitaetsconstraint**: TDD/Spec-Driven mit verpflichtender Testabdeckung ueber Unit, Component, UI/E2E und Gherkin.
- **Delivery strategy**: PWA/Service Worker erst nach stabiler Fachlogik und lokaler Web-App, um Debuggingrisiken zu minimieren.
- **Privacy**: Kein Tracking, keine Laufzeit-Analytics, keine externen Requests als funktionale Abhaengigkeit im Zielzustand.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vue | 3.5.x (aktuell 3.5.34) | UI-Framework für mobile-first SPA | Für formularlastige, zustandsgetriebene Apps mit klarer Component-Struktur ist Vue 3 im 2025/2026-Stack ein stabiler Standard mit sehr guter TS- und Tooling-Integration. |
| Vite | 8.x (aktuell 8.0.12) | Dev-Server + Build | Standard für moderne Vue-Apps: schnell, wenig Boilerplate, direkte PWA- und Test-Ökosystem-Anbindung. |
| TypeScript | 5.x | Typsicherheit für Domänenlogik | In dieser Domäne sind Rechen- und Validierungsfehler teuer; TS reduziert stille Fehler bei Intervall-/Tarif-/Qualitätslogik deutlich. |
| Dexie | 4.4.x (aktuell 4.4.2) | IndexedDB-Abstraktion (lokale Persistenz) | IndexedDB ist Pflicht für lokale, strukturierte Daten im Browser; Dexie ist dafür die etablierte, produktive API-Schicht statt fehleranfälliger nativer IndexedDB-Aufrufe. |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vue-router | 5.0.x (aktuell 5.0.6) | Navigation in der SPA | Immer bei mehreren klaren Screens (Dashboard, Zähler, PV, Analyse, Einstellungen). |
| Pinia | 3.0.x (aktuell 3.0.4) | Globaler UI-/App-State | Für geteilten Zustand (aktive Filter, Einstellungen, UI-Status), **nicht** für alle Rechenfunktionen. |
| Tailwind CSS | 4.3.x (aktuell 4.3.0) | Mobile-first Styling | Wenn schnelles, konsistentes UI mit wenig eigenem CSS gewünscht ist. Für MVP-Geschwindigkeit klar sinnvoll. |
| Lucide Vue Next | 1.0.x (aktuell 1.0.0) | Icon-Set | Für leichte, einheitliche, OSS-Icons ohne proprietäre Abhängigkeiten. |
| Chart.js + vue-chartjs | 4.5.x + 5.3.x | Diagramme für Trends/Intervalle | Für einfache Zeitreihen-/Balkendiagramme ohne schweres Enterprise-Charting. |
| vite-plugin-pwa | 1.3.x (aktuell 1.3.0) | PWA/Service Worker/Manifest | Erst nach stabiler Fachlogik integrieren (Phase 2/3), um SW-Debuggingrisiken früh zu vermeiden. |
| @vitejs/plugin-vue | 6.0.x (aktuell 6.0.6) | Vue-SFC Support in Vite | Pflichtplugin für Vue+Vite-Projektbasis. |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| Vitest (4.1.x) | Unit-Tests für Berechnungen/Validierung | Vite-nativ, schnell, ideal für pure domain functions (Intervall, Datenqualität, Speicher-Szenarien). |
| @testing-library/vue (8.1.x) | Component-Tests aus Nutzersicht | Sinnvoll für Formularregeln/Fehlermeldungen statt Implementierungsdetails. |
| Playwright Test (1.59.x) | E2E + mobile Emulation | Für mobile Hauptflüsse Pflicht (z. B. Pixel/iPhone Device Profiles). |
| playwright-bdd (8.5.x) | Gherkin-Bridge für Akzeptanztests | Passt zur Spec-Driven/TDD-Vorgabe mit lesbaren Fachszenarien. |
## Installation
# Core
# PWA (später aktivieren)
# Dev dependencies
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vue 3 + Vite | React + Vite | Wenn Team fast ausschließlich React-Expertise hat und dadurch signifikant schneller liefert. |
| Dexie | localStorage | Nur für triviale Einstellungen. Für relationale/abfrageintensive Energie-Daten ungeeignet. |
| Chart.js | ECharts | Wenn später deutlich komplexere Interaktionen/Visualisierungen (z. B. sehr viele Serien, Drilldowns) nötig werden. |
| Pinia | Nur Composables ohne Store | Für sehr kleine Apps mit minimalem geteiltem Zustand; bei mehreren Screens kippt Wartbarkeit schnell. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Next.js als Primärstack | Überdimensioniert für local-only SPA ohne Backend/SSR; erhöht Komplexität ohne Mehrwert. | Vue 3 + Vite SPA |
| Native IndexedDB API direkt in UI-Code | Fehleranfällig, schwer testbar, schlechte Wartbarkeit (Transaktions-/Versionierungsdetails). | Dexie + Repository-Schicht |
| Frühe Service-Worker-Aktivierung im MVP | Caching kaschiert Bugs und verlangsamt Debugging der Domänenlogik. | Erst Web-App fachlich stabilisieren, dann vite-plugin-pwa aktivieren |
| UI-Library-Monolithen (z. B. schwergewichtiges Enterprise-Designsystem) | Zu viel Overhead für kleines, mobile-first Produkt; erhöht Bundle und Lernlast. | Tailwind + kleine eigene UI-Wrapper |
## Stack Patterns by Variant
- Use Dexie + reine Service-/Repository-Schichten
- Because Datenhoheit, Offline-Resilienz und testbare Domänenlogik im Vordergrund stehen.
- Use vite-plugin-pwa mit konservativer Cache-Strategie (statische Assets zuerst)
- Because minimiert Risiko von Daten-/UI-Inkonsistenzen bei Updates.
## Version Compatibility
| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| vue@3.5.x | vue-router@5.x, pinia@3.x | Standard-Kombination für aktuelle Vue-3-Projekte. |
| vite@8.x | @vitejs/plugin-vue@6.x, vitest@4.1.x | Vitest 4.1 dokumentiert Support für Vite 8. |
| chart.js@4.x | vue-chartjs@5.x | Vue-Wrapper erwartet moderne Chart.js-Major-Line. |
| vite-plugin-pwa@1.3.x | Vite-Projekte (inkl. Vue) | Integration über Vite-Plugin + `virtual:pwa-register`. |
## Prescriptive Recommendation (Roadmap Input)
## Confidence per Recommendation
| Area | Confidence | Reason |
|------|------------|--------|
| Core SPA stack (Vue/Vite/TS/Router/Pinia) | HIGH | Industriestandard für moderne Vue-SPAs, durch aktuelle Docs + Registry-Versionen bestätigt. |
| Local DB choice (Dexie/IndexedDB) | HIGH | Technisch direkt passend zum local-only Constraint; breite Nutzung und stabile API. |
| Test stack (Vitest + Playwright + BDD) | HIGH | Moderne, aktive Toolchain mit dokumentierter Vite-/Mobile-Integration. |
| UI stack details (Tailwind/Chart.js/Lucide) | MEDIUM-HIGH | Sehr gängige Wahl; je nach Design-/Chart-Komplexität später feinjustierbar. |
| PWA plugin timing | HIGH | Technisch bewährte Praxis: SW spät integrieren, um Debugging-Risiken zu senken. |
## Sources
- Context7 `/vitejs/vite` — Version-/Node-Anforderungen und aktuelle Vite-Doku
- Context7 `/vitest-dev/vitest` — Vitest 4.1 und Vite-8-Kompatibilität
- Context7 `/microsoft/playwright` — Mobile Emulation Patterns
- Context7 `/vite-pwa/vite-plugin-pwa` — Vue-Integration (`virtual:pwa-register`)
- npm Registry (offizielle Package-Metadaten), abgefragt am 2026-05-11:
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

- `tdd-workflow`: Test-Driven Development workflow principles. RED-GREEN-REFACTOR cycle. Jede Entwicklung im Projekt folgt diesem Skill.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using edit, write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Nach Start ueber einen GSD-Einstiegspunkt muss Entwicklungsarbeit immer nach dem Skill `tdd-workflow` erfolgen, ausser der Nutzer fordert explizit eine Ausnahme.

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-OpenCode-profile` -- do not edit manually.
<!-- GSD:profile-end -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

# Stack Research

**Domain:** Mobile-first, local-first Energie-Tracking Web-App (manuelle Zähler- und PV-Tageswerte, ohne Backend)
**Researched:** 2026-05-11
**Confidence:** HIGH

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

```bash
# Core
npm install vue vue-router pinia dexie tailwindcss chart.js vue-chartjs lucide-vue-next

# PWA (später aktivieren)
npm install vite-plugin-pwa

# Dev dependencies
npm install -D vite @vitejs/plugin-vue typescript vitest @testing-library/vue @playwright/test playwright-bdd
```

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

**If strikt lokal ohne externe Requests (Zielzustand):**
- Use Dexie + reine Service-/Repository-Schichten
- Because Datenhoheit, Offline-Resilienz und testbare Domänenlogik im Vordergrund stehen.

**If PWA-Phase startet:**
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

**Baue die Basis so:** Vue 3 + Vite + TS + Vue Router + Pinia + Dexie + Tailwind + Vitest + Playwright.  
**Dann erweitern:** Charting und Speicherberater-UI.  
**Zuletzt:** PWA-Schicht via vite-plugin-pwa.

Diese Reihenfolge ist für BalkonBilanz fachlich korrekt, weil sie zuerst Rechenqualität und Datenkonsistenz absichert und erst danach Service-Worker-Komplexität einführt.

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
  - vue 3.5.34, vite 8.0.12, vue-router 5.0.6, pinia 3.0.4, dexie 4.4.2
  - tailwindcss 4.3.0, @vitejs/plugin-vue 6.0.6
  - chart.js 4.5.1, vue-chartjs 5.3.3, lucide-vue-next 1.0.0
  - vite-plugin-pwa 1.3.0
  - vitest 4.1.5, @playwright/test 1.59.1, @testing-library/vue 8.1.0, playwright-bdd 8.5.0

---
*Stack research for: BalkonBilanz local-first energy tracking app*
*Researched: 2026-05-11*

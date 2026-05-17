# BalkonBilanz

BalkonBilanz ist eine mobile-first Web-App fuer Privatnutzer mit Balkonkraftwerk und Iskra-MT176-Zaehler. Die App wertet manuell erfasste Zaehlerstaende, PV-Tagesertraege und lokale Tarife direkt im Browser aus, ohne Cloud, ohne Konto und ohne automatische Datenimporte.

## Projektzweck

BalkonBilanz soll mit moeglichst wenig Erfassungsaufwand belastbare, aber bewusst als Naeherung gekennzeichnete Aussagen zu Netzbezug, Einspeisung, Verbrauch, Datenqualitaet und Speicherpotenzial liefern.

Die App ist fuer Alltagsentscheidungen gedacht, nicht fuer professionelle Lastprofilanalyse oder Smart-Home-Automation.

## Funktionsumfang

- Erfassung von kumulierten Zaehlerstaenden fuer OBIS `1.8.0` und `2.8.0`
- Erfassung von PV-Tageswerten fuer abgeschlossene Tage
- Dashboard mit aktuellen Kennzahlen und Datenqualitaet
- Analyseansicht fuer Intervalle, PV-Zusammenfassungen und kombinierte KPIs
- Einstellungen fuer Strompreis, Einspeiseverguetung und Tarifhistorie
- Speicherberater auf Basis lokaler Analysewerte
- JSON-Backup und Restore der lokalen Daten
- PWA-Unterstuetzung mit explizitem Reload-Prompt bei Updates

## App-Struktur

Die aktuelle Navigation besteht aus vier Hauptbereichen:

- `Dashboard`
- `Erfassung`
- `Analyse`
- `Einstellungen`

Ein typischer Ablauf ist:

1. Zaehlerstand und PV-Tageswert unter `Erfassung` eintragen.
2. Auf dem `Dashboard` die neuesten Werte und Hinweise zur Datenqualitaet pruefen.
3. Unter `Analyse` Intervalle und kombinierte Kennzahlen auswerten.
4. Unter `Einstellungen` Tarife pflegen, Speicherpotenzial ansehen und Backups exportieren oder importieren.

## Voraussetzungen

- Node.js 22
- npm

Node.js 22 ist der in CI und Release-Workflows verwendete Stand und damit die verifizierte Entwicklungsbasis.

## Setup

```bash
npm ci
npm run dev
```

Danach die von Vite ausgegebene lokale URL im Browser oeffnen.

## Build

```bash
npm run build
```

Der Produktions-Build landet unter `dist/`.

## Entwicklung

Die App ist eine lokale SPA ohne Backend. Persistenz erfolgt ausschliesslich im Browser ueber IndexedDB mit Dexie.

Der aktuelle technische Kern im Repository umfasst:

- Vue 3
- Vite
- TypeScript
- Vue Router
- Dexie
- vite-plugin-pwa
- node:test fuer Unit-, Component- und mehrere Smoke-Tests
- Playwright fuer Browser-Flows

## Tests

Die Test-Skripte sind in `package.json` hinterlegt:

| Skript | Zweck |
|---|---|
| `npm test` | Voller CI-Testlauf |
| `npm run test:unit` | Fachlogik, Validierung und Services |
| `npm run test:component` | Komponenten- und View-Tests |
| `npm run test:smoke` | Schnelle End-to-End-nahe Smoke-Checks |
| `npm run test:node` | Repo- und Automatisierungsregressionen |
| `npm run test:bdd:pwa` | PWA-Offline-Szenario im BDD-Stil |
| `npm run test:playwright` | Browserbasierte Playwright-Tests |
| `npm run build` | Produktions-Build als letzte Integrationspruefung |

Fuer den kompletten lokalen Verifikationslauf:

```bash
npm test
npm run build
```

## Release-Prozess

Das Repository besitzt drei GitHub-Actions-Workflows:

- `CI`: laeuft bei Pushes auf `main` und bei Pull Requests, fuehrt `npm ci`, `npm run test:ci` und `npm run build` aus.
- `Release`: laeuft bei Tags im Format `v*`, baut das Projekt, packt `dist/` als ZIP und veroeffentlicht ein GitHub Release inklusive Build-Provenance-Attestation.
- `Security`: startet bei Pushes auf `main`, bei Pull Requests und woechentlich per Schedule; enthaelt Trivy-Scan und `npm audit`.

Ein Release wird ueber einen Git-Tag gestartet, zum Beispiel:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Der Release-Workflow erstellt daraus ein Artefakt im Format `balkonbilanz-vX.Y.Z-dist.zip`.

## Lokaler Datenschutz

BalkonBilanz ist bewusst lokal und datensparsam ausgelegt:

- Alle Nutzdaten bleiben im Browser und werden in IndexedDB gespeichert.
- Es gibt kein Backend, kein Benutzerkonto und keine Cloud-Synchronisation.
- Es gibt kein Tracking und keine Laufzeit-Analytics.
- Die App hat im Zielzustand keine externen Requests als funktionale Abhaengigkeit.
- Datenexporte erfolgen nur explizit durch den Nutzer als JSON-Backup.
- Ein Restore prueft das Backup-Schema vor dem Ueberschreiben lokaler Daten.

## Wichtige fachliche Grenzen

- Zaehlerdaten sind kumulierte Staende, keine Verbrauchswerte pro Tag.
- PV-Daten sind Tageswerte fuer abgeschlossene Tage.
- Kombinierte KPIs aus Zaehlerintervallen und PV-Tagesdaten sind bewusst Naeherungen und sollen keine Scheingenauigkeit erzeugen.

## Projektstatus

Der Planungsstand in `.planning/STATE.md` markiert alle vier geplanten Phasen als umgesetzt. Offene Folgearbeit liegt aktuell vor allem bei optionalen Produktverbesserungen und weiterer UI- oder Visualisierungsarbeit.

## Repository-Hinweise

- `src/` enthaelt App, Fachlogik, Services, Repositories und PWA-Anbindung.
- `tests/` enthaelt Unit-, Component-, BDD-, Smoke- und Playwright-Tests.
- `.github/workflows/` enthaelt CI-, Release- und Security-Automation.
- `.planning/` enthaelt Projektkontext, Roadmap, Phasenartefakte und Status.

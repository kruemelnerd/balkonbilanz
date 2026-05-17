---
name: readme-maintainer
description: Create or improve a README.md for an open source project with a strong focus on short description, demo or CLI example, installation, quickstart, and CLI command/options documentation.
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  language: de
  purpose: open-source-readme
---

# README Maintainer Skill

## Aufgabe

Erstelle oder überarbeite eine `README.md` für ein Open-Source-Projekt.

Die README muss für neue Nutzerinnen, Nutzer und Beitragende schnell beantworten:

1. Was ist das Projekt?
2. Warum ist es nützlich?
3. Wie installiere ich es?
4. Wie bekomme ich in wenigen Minuten ein erstes Erfolgserlebnis?
5. Welche CLI-Commands und Options gibt es?

Arbeite pragmatisch. Ziel ist eine README, die sofort verwendbar ist, nicht eine überladene Dokumentation.

## Wann dieser Skill verwendet werden soll

Nutze diesen Skill, wenn die Aufgabe ungefähr lautet:

- README erstellen
- README verbessern
- README für Open Source prüfen
- CLI-Dokumentation ergänzen
- Installation oder Quickstart verständlicher machen
- README anhand des Projekts aktualisieren

## Arbeitsweise

### 1. Repository prüfen

Untersuche zuerst die vorhandene Projektstruktur.

Prüfe insbesondere:

- `README.md`, `README.*`
- `package.json`
- `pyproject.toml`
- `requirements.txt`
- `setup.py`
- `Cargo.toml`
- `go.mod`
- `pom.xml`
- `build.gradle`, `build.gradle.kts`
- `Makefile`
- `Dockerfile`
- `docker-compose.yml`, `compose.yml`
- `Taskfile.yml`
- `justfile`
- `bin/`, `cmd/`, `cli/`, `src/`
- vorhandene Docs unter `docs/`
- Tests, Beispiele und Demo-Dateien

Wenn CLI-Commands vorhanden sind, ermittle sie aus Code, Help-Ausgaben, Package-Scripts oder Dokumentation.

Führe nur sichere, lesende oder übliche lokale Befehle aus, zum Beispiel:

```bash
cat package.json
npm run
python -m <module> --help
<binary> --help
cargo run -- --help
go run ./cmd/... --help
```

Installiere keine Abhängigkeiten ungefragt, wenn dafür Netzwerkzugriff oder Systemänderungen nötig wären.

### 2. Bestehende README bewerten

Prüfe, ob die README diese Pflichtteile enthält:

1. Kurzbeschreibung
2. Screenshot oder CLI-Beispiel
3. Installation
4. Quickstart
5. CLI-Commands und Options

Bewerte nicht nur, ob Überschriften existieren, sondern ob der Inhalt nützlich ist.

Eine schlechte Installation ist zum Beispiel:

```md
Install dependencies and run it.
```

Eine gute Installation nennt konkrete Befehle, Voraussetzungen und eine Verifikation.

### 3. Fehlende Inhalte ergänzen

Wenn Informationen im Repository eindeutig vorhanden sind, ergänze sie direkt.

Wenn Informationen fehlen oder nicht sicher ermittelbar sind:

- Erfinde keine Commands, Options, URLs, Screenshots oder Package-Namen.
- Markiere Unsicherheiten sichtbar mit `TODO:` oder `> TODO:`.
- Halte TODOs konkret, damit Maintainer sie leicht ersetzen können.
- Bevorzuge echte, überprüfbare Beispiele gegenüber generischen Platzhaltern.

### 4. Sprache und Stil

Behalte die bestehende Sprache der README bei.

Wenn noch keine README existiert:

- Nutze Englisch, wenn Projektname, Code-Kommentare oder Package-Metadaten überwiegend Englisch sind.
- Nutze Deutsch, wenn das Projekt offensichtlich deutschsprachig ist.
- Schreibe klar, knapp und nutzerorientiert.

Vermeide Marketing-Floskeln. Schreibe lieber konkret:

Schlecht:

```md
A powerful and innovative tool to improve productivity.
```

Besser:

```md
A CLI tool that exports GitHub issues as CSV files.
```

## Pflichtstruktur der README

Die README soll mindestens diese Abschnitte enthalten.

Die Überschriften dürfen zur bestehenden README passen, aber die Inhalte müssen vorhanden sein.

### 1. Kurzbeschreibung

Ganz oben:

- Projektname
- Ein Satz, was das Projekt tut
- Optional 2–4 Kernfunktionen

Beispiel:

```md
# project-name

A CLI tool for validating Markdown files in CI pipelines.

## Features

- Checks broken internal links
- Validates required frontmatter fields
- Prints CI-friendly error messages
```

Die Kurzbeschreibung muss konkret sagen, was das Projekt macht. Nicht nur: „A useful tool“.

### 2. Screenshot oder CLI-Beispiel

Für CLI-Projekte: Verwende ein realistisches Terminal-Beispiel.

```md
## Example

```bash
$ project check README.md

✓ README.md
  0 errors
  2 warnings
```
```

Für UI-Projekte: Verlinke einen Screenshot, falls vorhanden.

```md
## Screenshot

![Screenshot of the dashboard](docs/screenshot.png)
```

Wenn kein Screenshot vorhanden ist, aber das Projekt eine CLI hat, verwende immer ein CLI-Beispiel.

### 3. Installation

Die Installation muss einfach und konkret sein.

Enthalten sein sollen:

- Voraussetzungen, z. B. Node.js, Java, Python, Docker
- Installationsweg für normale Nutzung
- Verifikation der Installation
- Unterschied zwischen Production und Development, wenn relevant

#### Production-Installation

Nutze diesen Abschnitt, wenn das Projekt als Tool, Package, Container oder Binary verwendet wird.

Beispiele:

```md
## Installation

### Production

```bash
npm install -g project-name
```

Verify:

```bash
project-name --version
```
```

Oder:

```md
### Production

```bash
docker run --rm ghcr.io/org/project-name:latest --help
```
```

#### Development-Installation

Nutze diesen Abschnitt, wenn lokale Entwicklung anders funktioniert als normale Nutzung.

Beispiel:

```md
### Development

```bash
git clone https://github.com/org/project-name.git
cd project-name
npm install
npm test
npm run build
```
```

Wenn Production und Development identisch oder nicht unterscheidbar sind, schreibe keinen künstlichen Unterschied. Dann reicht ein normaler Installationsabschnitt.

### 4. Quickstart

Der Quickstart muss direkt nach der Installation zu einem ersten Erfolg führen.

Gute Quickstarts bestehen aus 2–5 Befehlen.

Beispiel:

```md
## Quickstart

```bash
project init
project check README.md
project check docs/
```
```

Der Quickstart darf nicht nur auf spätere Dokumentation verweisen.

### 5. CLI-Commands und Options

Wenn das Projekt eine CLI hat, dokumentiere die Commands und Options.

Mindestens:

- Grundsyntax
- Command-Tabelle
- Options-Tabelle
- realistische Beispiele

Beispiel:

```md
## Usage

```bash
project <command> [options]
```

### Commands

| Command | Description |
|---|---|
| `check <path>` | Checks a file or directory |
| `init` | Creates a default config file |
| `version` | Prints the installed version |

### Options

| Option | Description |
|---|---|
| `--config <file>` | Uses a custom config file |
| `--json` | Prints machine-readable JSON |
| `--verbose` | Prints additional debug output |
| `-h, --help` | Shows help |

### Examples

```bash
project check README.md
project check docs/ --json
project check . --config ./readme-check.yml
```
```

Wenn keine CLI existiert, ersetze diesen Abschnitt durch eine passende Usage-Dokumentation für Library, API, App oder Service. Benenne aber ausdrücklich, dass es keine CLI gibt, falls das wichtig ist.

## Qualitätsregeln

### Installation

Die Installation ist besonders wichtig.

Achte auf:

- Copy-paste-fähige Befehle
- klare Reihenfolge
- keine versteckten Voraussetzungen
- Versionshinweise, wenn relevant
- separater Dev-Abschnitt, falls Entwicklung anders funktioniert
- eine Verifikationszeile wie `--version`, `--help`, `npm test` oder Healthcheck

### CLI-Dokumentation

Für CLI-Projekte muss die README erklären:

- wie das Tool grundsätzlich aufgerufen wird
- welche Commands existieren
- welche Options existieren
- welche Defaults wichtig sind
- wie JSON-/Maschinenoutput funktioniert, falls vorhanden
- welche Exit-Codes gelten, falls im Projekt ersichtlich

Wenn Exit-Codes nicht ersichtlich sind, nicht erfinden. Optional als TODO ergänzen:

```md
> TODO: Document exit codes for CI usage.
```

### Keine falschen Behauptungen

Nie behaupten, dass etwas existiert, wenn es nicht im Repository erkennbar ist.

Beispiele für verbotene Erfindungen:

- nicht vorhandene npm-Package-Namen
- nicht vorhandene Docker-Images
- nicht vorhandene Screenshots
- erfundene CLI-Optionen
- erfundene Lizenz
- erfundene CI-Status-Badges

### README nicht unnötig aufblasen

Die README soll startklar machen. Tiefe Architekturdetails gehören eher in `docs/`.

Bevorzuge kurze Abschnitte, Tabellen und Beispiele.

## Prüf-Checkliste

Am Ende deiner Bearbeitung prüfe:

- [ ] Gibt es eine konkrete Kurzbeschreibung?
- [ ] Gibt es ein Screenshot oder ein realistisches CLI-Beispiel?
- [ ] Ist die Installation copy-paste-fähig?
- [ ] Wird zwischen Production und Development unterschieden, falls das Projekt das erfordert?
- [ ] Gibt es einen Quickstart mit erstem Erfolgserlebnis?
- [ ] Sind CLI-Commands dokumentiert, falls eine CLI existiert?
- [ ] Sind CLI-Options dokumentiert, falls eine CLI existiert?
- [ ] Sind Beispiele realistisch und aus dem Repository ableitbar?
- [ ] Wurden keine nicht belegbaren Features erfunden?
- [ ] Bleibt die Sprache der bestehenden README konsistent?

## Ausgabeformat

Wenn du die README direkt bearbeitest:

1. Ändere `README.md`.
2. Fasse danach kurz zusammen:
   - was ergänzt wurde
   - welche Annahmen du getroffen hast
   - welche TODOs offen bleiben

Wenn du nur einen Vorschlag machen sollst:

1. Gib eine vollständige README-Fassung aus.
2. Markiere unsichere Stellen mit `TODO:`.
3. Nenne kurz, welche Projektdateien du dafür ausgewertet hast.

## Bevorzugte README-Reihenfolge

Nutze diese Reihenfolge, wenn keine bestehende Struktur dagegen spricht:

```md
# Project Name

Short description.

## Features

## Example

## Installation

### Production

### Development

## Quickstart

## Usage

### Commands

### Options

### Examples

## Configuration

## Development

## Troubleshooting

## Contributing

## License
```

Die ersten fünf Abschnitte sind Pflicht. Die späteren Abschnitte sind optional, aber sinnvoll, wenn das Repository die Informationen hergibt.

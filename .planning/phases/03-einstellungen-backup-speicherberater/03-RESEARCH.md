---
phase: 03-einstellungen-backup-speicherberater
date: 2026-05-13
status: complete
discovery_level: 1
---

# Phase 3 Research

## Scope

Phase 3 liefert lokale Einstellungen/Tarifhistorie, Backup/Restore und Speicherberater auf Basis der bereits vorhandenen Vue+Dexie Architektur.

## Findings

1. **Kein neuer externer Stack nötig**: vorhandener Stack (Vue, Dexie, Pinia-ähnliche Store-Pattern, node:test/happy-dom) deckt Anforderungen vollständig ab.
2. **Hauptabhängigkeit für Speicherberater**: `analysisStore` stellt `combined`, `quality`, `intervals`, `pvDays` bereit; Speicherberechnung muss diese Werte als reale Datengrundlage nutzen (nicht nur Zeitraumlänge).
3. **Persistenz-Lücke**: Datenbank enthält aktuell nur `meterReadings` und `pvDailyEntries`; Phase 3 benötigt zusätzliche Tabellen für App-Settings und Tarifperioden.
4. **UI-Vertrag ist bereits festgelegt**: `03-UI-SPEC.md` ist approved und muss strikt umgesetzt werden (Route `/settings`, Kartenreihenfolge, Texte, Warn- und Restore-Flow).

## Implementation Guidance

- DB-Migration in einem Schritt für `appSettings` + `tariffPeriods` ausrollen, danach Settings/Tariff-Repository + Service darauf aufbauen.
- Backup-Service als transaktionalen Voll-Restore implementieren (clear + restore aller relevanten Tabellen), inkl. Preview/Schema-Validierung vor destruktiver Aktion.
- Speicherberater als separater Domain/Service-Baustein mit deterministischen Szenariofaktoren (`Konservativ`, `Realistisch`, `Optimistisch`, `Theoretisches Maximum`) umsetzen; Grundlage aus Analysewerten ableiten.
- UI in dedizierter Settings-Featurestruktur bauen und über Router + Bottom-Nav verdrahten.

## Risks

- **R1**: Advisor bleibt generisch ohne Analysebezug → falsche Aussagekraft (muss über Service-Inputs + Tests verhindert werden).
- **R2**: Restore überschreibt Daten trotz ungültigem Import → muss durch Parse/Schema/Preview-Gates blockiert werden.
- **R3**: Tarifperioden-Überlappung führt zu Mehrdeutigkeit bei Kostenbezug → harte Validierung statt Warnung.

## Decision

Discovery Level 1 ist ausreichend (kein Lib-Entscheid, keine neue externe Integration). Planung kann direkt erfolgen.

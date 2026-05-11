# Phase 1: Datenerfassung & Fachfundament - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 liefert die vollstaendige lokale Erfassung und Pflege von Zaehlerereignissen (OBIS 1.8.0/2.8.0 mit Zeitpunkt) und PV-Tageswerten inklusive fachlich harter Validierung gegen ungueltige oder widerspruechliche Eingaben.

</domain>

<decisions>
## Implementation Decisions

### Zaehlererfassung
- **D-01:** Zaehlerablesungen werden als Ereignisse mit Datum/Uhrzeit und getrennten Feldern fuer OBIS 1.8.0 (Bezug) und 2.8.0 (Einspeisung) erfasst; kein Tagesraster, keine automatische Rundung.
- **D-02:** Neuer Eintrag, Bearbeiten und Loeschen sind gleichwertige Standard-Operationen derselben Datenliste.

### Validierung und Fachregeln
- **D-03:** Speichern wird strikt blockiert bei fehlenden Pflichtwerten, negativem Wert, ungueltigem Zahlenformat oder doppeltem Zeitpunkt.
- **D-04:** Sinkende Zaehlerwerte fuehren nicht zu stiller Korrektur, sondern zu einem dokumentierten Zaehlerwechsel-Flow oder zur Blockierung.
- **D-05:** Auffaellige, aber nicht logisch unmoegliche Werte bleiben in Phase 1 ausserhalb von Soft-Warnungen; Fokus liegt auf harten Konsistenzregeln.

### PV-Tageswerte
- **D-06:** PV-Erzeugung wird strikt als Kalendertagswert ohne Uhrzeitkonzept gespeichert.
- **D-07:** Speichern fuer heute und Zukunft ist blockiert; erlaubt sind nur abgeschlossene vergangene Kalendertage.
- **D-08:** Pro Tag existiert genau ein Datensatz (Upsert-Verhalten beim Bearbeiten desselben Tages statt Duplikat).

### Darstellungs- und Bedienkontext fuer Phase 1
- **D-09:** Listen zeigen Eintraege primaer nach Datum (neueste zuerst) mit schnellem Zugriff auf Bearbeiten/Loeschen, mobile-first.
- **D-10:** Fehlertexte sind klar fachlich formuliert (was ist falsch + wie beheben), ohne technische Begriffe.

### OpenCode's Discretion
- Konkrete Feldanordnung und Mikrocopy der Formulare.
- Detailgrad von Inline-Hinweisen, solange die harten Validierungsregeln unveraendert bleiben.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and success criteria
- `.planning/ROADMAP.md` - Phase 1 Ziel, Abgrenzung und Success Criteria.

### Functional requirements
- `.planning/REQUIREMENTS.md` - METER-01..06 und PV-01..05 als verbindliche Anforderungen.

### Product and architectural constraints
- `.planning/PROJECT.md` - Produktprinzipien (local-first, keine Cloud), Schichtenmodell und Qualitaetsleitplanken.

### Additional specification
- `balkonbilanz_spec_driven_development.md` - fachliche Referenz fuer Spec-Driven/TDD-Arbeitsweise in diesem Projekt.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Noch keine produktive App-Codebasis vorhanden; Phase 1 beinhaltet initiales Scaffold plus Fachlogik-Grundlagen.

### Established Patterns
- Zielmuster aus PROJECT.md: UI -> Stores/Composables -> Services/Use Cases -> Repositories -> Dexie/IndexedDB.
- Fachlogik als pure Functions ausserhalb der Vue-Komponenten.

### Integration Points
- Neue Erfassungs- und Listenfluesse muessen als Basis fuer Phase-2-Analyse und Dashboard dienen.

</code_context>

<specifics>
## Specific Ideas

- Mobile-first Datenerfassung mit grossen Eingaben und schneller Rueckmeldung bei Fehlern.
- Keine Scheingenauigkeit: klare Trennung zwischen Ereignisdaten (Zaehler) und Tagesdaten (PV).

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 01-datenerfassung-fachfundament*
*Context gathered: 2026-05-11*

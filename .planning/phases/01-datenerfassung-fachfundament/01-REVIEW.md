---
phase: 01-datenerfassung-fachfundament
phase_number: "01"
review_type: code-review
depth: standard
status: completed
result: action-required
reviewed_on: 2026-05-11
scope:
  files_reviewed: 18
findings:
  critical: 0
  high: 1
  medium: 2
  low: 1
---

# Code Review - Phase 01

## Gesamturteil

Die Phase liefert ein solides Fundament (Domain, Validation, Services, Capture-Store), aber es gibt eine fachlich relevante High-Severity-Luecke bei Meter-Updates: Rueckwaerts-Validierung gegen spaetere Ablesungen fehlt. Dadurch koennen inkonsistente Zeitreihen entstehen.

## Findings

### HIGH-01: Meter-Update kann spaetere Datensaetze ungueltig machen
- **Datei:** `src/domain/validation/meterValidation.ts:152`
- **Problem:** Die Pruefung `meter_value_decreased` vergleicht nur mit der vorherigen Ablesung (`previous`), nicht mit der naechsten. Bei einem Update eines aelteren Eintrags kann der Wert erhoeht werden, sodass ein spaeterer Eintrag ploetzlich kleiner ist.
- **Risiko:** Persistente Inkonsistenz in kumulierten Zaehlerstaenden; spaetere Auswertungen werden verfälscht.
- **Empfehlung:** Bei validem Timestamp auch den direkten Nachfolger (`next`) bestimmen und sicherstellen, dass `obis180Kwh/obis280Kwh` nicht groesser als dessen Werte sind (mit eigener Issue-Code-Differenzierung oder wiederverwendetem `meter_value_decreased`).

### MEDIUM-01: `datetime-local` und ISO-UTC sind nicht kompatibel im Edit-Flow
- **Datei:** `src/stores/captureStore.ts:83`, `src/features/meter/MeterEntryForm.vue:20`
- **Problem:** Das Draft-Feld bekommt `record.timestamp` (ISO mit `Z`), waehrend `<input type="datetime-local">` ein lokales Format ohne Zeitzonen-Suffix erwartet.
- **Risiko:** Vorbelegung im Bearbeiten kann leer/inkorrekt erscheinen; erneutes Speichern kann unbeabsichtigt andere Zeitpunkte erzeugen.
- **Empfehlung:** Beim Laden ins Draft nach `YYYY-MM-DDTHH:mm` (lokal) transformieren und beim Submit wieder deterministisch nach UTC ISO normalisieren.

### MEDIUM-02: Semantisch falscher Issue-Code bei PV-Duplikat im Update
- **Datei:** `src/services/pvDailyService.ts:87`
- **Problem:** Bei Tageskollision im Update wird `future_or_today_day` zurueckgegeben, obwohl der eigentliche Fehler ein Duplikat ist.
- **Risiko:** UI zeigt fachlich falsche Rueckmeldung; erschwert zielgenaue Fehlerbehandlung in Komponenten/BDD.
- **Empfehlung:** Eigenen Code (z. B. `duplicate_day`) einfuehren oder bestehenden Validierungs-Codepfad so erweitern, dass die Semantik korrekt bleibt.

### LOW-01: Defensiv fragwuerdiges `id ?? 0` in Listenaktionen
- **Datei:** `src/features/meter/MeterReadingsList.vue:25`, `src/features/pv/PvDailyList.vue:25`
- **Problem:** Fehlende IDs werden auf `0` gemappt und trotzdem an Edit/Delete gegeben.
- **Risiko:** Unnoetige Not-Found-Fehlerpfade, schwerer nachvollziehbares UI-Verhalten.
- **Empfehlung:** Action-Buttons bei `id == null` deaktivieren oder frueh return ohne Service-Aufruf.

## Positive Beobachtungen

- Klare Trennung zwischen Domain-Validierung, Service-Orchestrierung und Store/UI.
- Strukturierte Fehlerobjekte mit Codes sind eine gute Basis fuer mobile UX und BDD.
- Repositories und Tests sind fuer die aktuelle Phase sauber und gut erweiterbar.

## Empfohlene naechste Schritte

1. HIGH-01 zuerst beheben (inkl. Unit-Tests fuer „edit middle reading breaks next reading"-Szenario).
2. Danach MEDIUM-01 zur Stabilisierung des Edit-UX in der mobilen Erfassung.
3. MEDIUM-02/LOW-01 in einem kleinen Follow-up-Commit mit Testanpassungen.

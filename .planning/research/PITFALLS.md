# Pitfalls Research

**Domain:** Local-first Energy Tracking (Balkonkraftwerk + manueller Zähler/PV-Input)
**Researched:** 2026-05-11
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Scheingenauigkeit durch falsches Zeitraster (Intervall vs. Kalendertag)

**What goes wrong:**
Verbrauch/Einspeisung aus Zählerintervallen werden wie echte Tageswerte behandelt und direkt mit PV-Tageswerten „scharf“ verrechnet. Das erzeugt scheinbar präzise Kennzahlen (Eigenverbrauch, Autarkie), die fachlich nicht belastbar sind.

**Why it happens:**
Teams modellieren zu früh „Day“-Aggregationen statt Ereignis+Intervall-Logik. UI und Charts verstecken Zeitlücken und variable Ablesezeiten.

**How to avoid:**
- Zählerdaten strikt als `MeterReading`-Ereignisse mit `readAt` + abgeleiteten `MeterInterval`-Objekten führen.
- Kombinierte KPIs immer als **Näherung** labeln, inkl. Qualitätsstufe (`good/limited/poor`) und Begründung.
- Analyse nur für explizit gewählten Zeitraum; fehlende PV-Tage und schlechte Überlappung sichtbar machen.
- Gherkin- und Unit-Tests erzwingen: „Intervall ist kein Tagesverbrauch“.

**Warning signs:**
- UI zeigt „Tagesverbrauch“ ohne Intervallstart/-ende.
- Keine Qualitätswarnung trotz fehlender PV-Tage.
- Support-Feedback: „Wieso stimmt der Tageswert nicht mit meinem Gefühl?“

**Phase to address:**
**Phase 1 (Datenmodell/Grundlogik)** und absichern in **Phase 2 (Analyse + Datenqualität)**.

---

### Pitfall 2: Verlust lokaler Daten (Storage-Eviction, Browser-Clearing, App-Update)

**What goes wrong:**
Nutzer verlieren Monate an Daten nach Browser-Cleanup, Gerätewechsel oder ungültigem Restore. Vertrauen bricht sofort.

**Why it happens:**
„Lokal = sicher“ wird überschätzt. IndexedDB ist standardmäßig best-effort; Browser können Daten unter Speicherstress oder Policies entfernen.

**How to avoid:**
- Backup/Restore früh (nicht erst ganz am Ende) liefern, inkl. Schema-Version, Validierung und klarer Restore-Bestätigung.
- Bei Start auf Backup hinweisen („letztes Backup vor X Tagen“).
- Schreibpfade robust gegen `QuotaExceededError` gestalten, mit verständlicher Fehlermeldung.
- Für PWA-Phase: Update-Regressionstest „Daten bleiben nach Update erhalten“ verpflichtend.

**Warning signs:**
- Keine Exportfunktion im MVP.
- Restore akzeptiert beliebige JSON ohne Schema-Prüfung.
- Fehlertickets „Daten sind plötzlich weg“ nach Browser-/OS-Update.

**Phase to address:**
**Phase 2 (Backup/Restore, Migrationsdisziplin)**; zusätzliche Härtung in **Phase 3 (PWA-Updates)**.

---

### Pitfall 3: Date/Time-Bugs an Tagesgrenzen und Zeitzonen

**What goes wrong:**
PV-Einträge für „heute“ werden fälschlich erlaubt/gesperrt, Intervalldauern sind um Stunden verschoben, Analysen kippen um Mitternacht oder bei Sommerzeitwechsel.

**Why it happens:**
Mix aus lokalen Datumseingaben und UTC-Parsing (`new Date("YYYY-MM-DD")`), unklare Normalisierung zwischen ISO-Date und ISO-DateTime.

**How to avoid:**
- Strikte Trennung: PV als **lokales Kalenderdatum** (`YYYY-MM-DD`), Zähler als **voller Timestamp mit Offset**.
- Zentralisierte Date-Utility-Schicht (kein ad-hoc Parsing in Komponenten).
- Property-/Edgecase-Tests für Mitternacht, DST-Wechsel, unterschiedliche Locale/Zeitzone.
- UI-Regel technisch absichern: „Heute/Future für PV nie speicherbar“ basierend auf lokalem Datum.

**Warning signs:**
- Flaky Tests rund um 00:00 Uhr.
- Unterschiedliches Verhalten zwischen Desktop und Android.
- Nutzer sehen „gestern“ als „heute“ im Formular.

**Phase to address:**
**Phase 1 (Date-Utilities + Validierung)**, erweitert in **Phase 2 (Analysekonsistenz)**.

---

### Pitfall 4: Zählerwechsel/Reset nicht als First-Class-Domainfall

**What goes wrong:**
Sinkende Zählerstände werden als normal gespeichert oder global blockiert. Ergebnis: negative Intervalle, kaputte Historie oder unbenutzbare Eingabemaske.

**Why it happens:**
Teams behandeln „monoton steigend“ als absolute Regel und vergessen reale Wechsel-/Reset-Ereignisse.

**How to avoid:**
- `MeterChangeEvent` früh modellieren; negative Differenzen nur mit dokumentiertem Wechsel erlauben.
- Beim Erkennen sinkender Werte: geführter Flow „Zählerwechsel erfassen“ statt nur Fehlermeldung.
- Abgrenzung je `meterId`: Intervalle niemals über Gerätegrenzen mischen.
- Spezifische Unit-Tests: vor/nach Wechsel, Kosten- und KPI-Konsistenz.

**Warning signs:**
- „Wert kleiner als vorher“ führt zu Sackgasse ohne Recovery.
- Negative kWh tauchen in Analyse auf.
- Historie hat Sprünge ohne Wechsel-Event.

**Phase to address:**
**Phase 2 (Tarifhistorie + Meter-Management + Analytik-Korrektheit)**.

---

### Pitfall 5: PWA/Service-Worker zu früh aktivieren

**What goes wrong:**
Alte App-Version bleibt gecacht, Bugfixes kommen nicht an, Test- und Debug-Zyklen werden unzuverlässig, im schlimmsten Fall DB-/Code-Mismatch.

**Why it happens:**
Offline-Funktion wird als „MVP-Must-have“ missverstanden und vor stabiler Fachlogik integriert.

**How to avoid:**
- PWA strikt nach stabiler Web-App + belastbarer Testbasis einführen.
- Versionierte Cache-Strategie, kontrollierte Aktivierung, sichtbarer Update-Hinweis.
- Kein aggressives `skipWaiting` als Default ohne Datenmigrationskonzept.
- E2E-Tests: first-load online, reopen offline, update flow, Datenpersistenz nach Update.

**Warning signs:**
- „Bei mir geht’s“ aber Nutzer sehen alte UI.
- Häufiges Hard-Reload als Support-Tipp.
- Inkonsistente Bugs nach Deploy ohne reproduzierbaren Stand.

**Phase to address:**
**Phase 3 (PWA/Offline)** ausschließlich nach Abschluss von Phase 1+2.

---

### Pitfall 6: Fachlogik in Vue-Komponenten (statt Services/Pure Functions)

**What goes wrong:**
Berechnungen werden UI-gebunden, schwer testbar und fehleranfällig bei Refactoring. Jede neue Ansicht dupliziert Regeln leicht anders.

**Why it happens:**
Schnelles Prototyping ohne klare Schichtentrennung; „nur kurz im Component-Computed“.

**How to avoid:**
- Architekturregel hart: UI nur Darstellung/Interaktion, Berechnung in Services + Pure Functions.
- Review-Gate: kein KPI-Algorithmus in `.vue`-Dateien.
- Unit-Test-Abdeckung für jede Kernformel vor UI-Integration.

**Warning signs:**
- Lange `computed`-Blöcke mit mehreren fachlichen Branches.
- E2E testet Rechenlogik indirekt, aber kaum Unit-Tests vorhanden.
- Gleiche Formel mehrfach in verschiedenen Views.

**Phase to address:**
**Phase 1 (Architekturgrundsatz + Testpyramide)**.

---

### Pitfall 7: Dezimal-/Währungsfehler durch Float-Arithmetik

**What goes wrong:**
Rundungsfehler bei kWh und Euro summieren sich, Break-even schwankt je nach Rechenpfad, Nutzer verlieren Vertrauen.

**Why it happens:**
Direkte JS-`number`-Berechnungen und mehrfaches Runden im UI statt in zentraler Domänenlogik.

**How to avoid:**
- Persistenz als Decimal-Strings (wie spezifiziert), zentrale Decimal-Utils für Parse/Calc/Round.
- Nur an klaren Grenzpunkten runden (Anzeige), intern konsistent mit höherer Präzision rechnen.
- Golden-master Tests für Kosten- und Szenarioformeln.

**Warning signs:**
- 0.1+0.2-artige Artefakte in UI.
- Unterschiedliche Ergebnisse zwischen Dashboard und Analyse für denselben Zeitraum.
- Snapshot-Tests brechen bei minimalen Rechenänderungen.

**Phase to address:**
**Phase 1 (Numerik-Fundament)**, zusätzliche Szenario-Tests in **Phase 2 (Speicherberater)**.

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Intervallkosten immer mit Endtarif bewerten | Sehr schnelle MVP-Implementierung | Historische Kosten können bei langen Intervallen verzerren | **MVP ja**, aber mit sichtbarer Warnung + Roadmap für anteilige Tarifsplit-Logik |
| Datenqualität nur als Ampel ohne Begründung | Weniger UI-Aufwand | Nutzer verstehen Unsicherheit nicht, Fehlentscheidungen bei Speicherkauf | Nur sehr kurzfristig; Begründungstext in derselben Phase nachziehen |
| Kein automatischer Backup-Reminder | Weniger UX-Komplexität | Hohes Datenverlustrisiko bei seltenen Nutzern | Im ersten MVP evtl. ok, spätestens vor PWA-Release ergänzen |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Dexie/IndexedDB | Schema ändern ohne Versionserhöhung/Migrationstests | Jede Schemaänderung versionieren, Upgradepfad testen, Restore-Version prüfen |
| Service Worker (vite-plugin-pwa) | Caches überschreiben/unkontrolliertes Aktivieren | Versionierte Caches, geplanter Activation-Flow, Update-Hinweis + E2E-Regression |
| Chart.js | Rohdaten im Component voraggregieren und dort Geschäftslogik verstecken | Aggregation im Service, Charts nur rendern |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Jede View berechnet alle Intervalle neu | Scroll/Jank auf mobilen Geräten | Memoisierung pro Zeitraum, Voraggregation in Services | Spürbar ab einigen hundert Ablesungen |
| Zu viele E2E-Tests für reine Rechenregeln | Langsame CI, geringe Iterationsgeschwindigkeit | Rechenlogik primär Unit-testen, E2E nur Hauptflüsse | Bereits bei kleinem Team/Projekt spürbar |
| Große Backup-Dateien ohne Streaming/Feedback | UI friert beim Import | Import validieren + Progress/Statusmeldungen | Bei längerer Nutzung (mehrere Jahre Daten) |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Backup-JSON blind importieren | Datenkorruption, potenziell XSS über ungesäuberte Notizen bei späterer Anzeige | Striktes JSON-Schema, Feldvalidierung, Escaping bei Darstellung |
| Runtime-Abhängigkeit von Dritt-Requests in „offline“-Pfaden | App versagt ohne Netz trotz Offline-Versprechen | Kritische Assets lokal bundlen/cachen, keine externen funktionalen Dependencies |
| Fehlende Trennung von Anzeige- und Speicherformaten | Injection/Parsing-Probleme bei Zahlen/Notizen | Canonical Domain-Format + sichere Formatter/Parser |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Unklare OBIS-Beschriftung (1.8.0/2.8.0) | Falsche Werte im falschen Feld | Hilfetext + Beispiele direkt am Formular |
| Harte Validierung ohne Erklärungen | Frust, App-Abbruch | „Warum“ + „Wie beheben“ in Fehlermeldung |
| Speicherberater ohne Unsicherheitskontext | Fehlkauf-Risiko | Szenariovergleich + Datenqualitätswarnung prominent |

## "Looks Done But Isn't" Checklist

- [ ] **Zählererfassung:** Intervallberechnung mit variablen Uhrzeiten getestet (nicht nur gleiche Uhrzeit).
- [ ] **PV-Erfassung:** „Heute“ und Zukunft sind technisch blockiert (inkl. Zeitzonen-Edgecases).
- [ ] **Analyse:** Kombinierte Kennzahlen sind als Näherung markiert und begründet.
- [ ] **Datenqualität:** Fehlende PV-Tage und lange Intervalle reduzieren Qualität sichtbar.
- [ ] **Backup/Restore:** Ungültige Dateien überschreiben keine Bestandsdaten.
- [ ] **PWA:** Offline-Start und Datenpersistenz nach App-Update E2E-verifiziert.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Zeitraster/Scheingenauigkeit | MEDIUM | KPI-Definition korrigieren, Rechenservice zentralisieren, UI um Datenqualitätsbegründung erweitern, Re-Run von Golden Tests |
| Datenverlust durch fehlendes Backup | HIGH | Notfall-Importpfad bauen, Benutzerkommunikation, sofort Backup-Feature + Reminder priorisieren |
| Früh integrierte fehlerhafte PWA | MEDIUM-HIGH | SW deaktivieren/neu registrieren, Cache-Migration fixen, Update-Hinweis nachrüsten, Offline-Regressionstests ergänzen |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Scheingenauigkeit Intervall vs Tag | Phase 1 + Phase 2 | Gherkin „Intervall ≠ Tageswert“, Qualitätslabel + Begründung im Analyse-UI |
| Lokaler Datenverlust | Phase 2 + Phase 3 | Export/Restore E2E, Schema-Validation, Update-Persistenztest |
| Date/Time-Grenzfehler | Phase 1 | Unit-Tests für DST/Mitternacht, konsistentes Verhalten auf Mobile/Desktop |
| Zählerwechsel/Reset falsch behandelt | Phase 2 | Negativdifferenz nur mit `MeterChangeEvent`, keine negativen Intervalle im Standardpfad |
| PWA zu früh/Cache-Chaos | Phase 3 | Reproduzierbarer Update-Flow, keine „stale app“-Supportfälle |
| Fachlogik in Components | Phase 1 | Review-Regel + hoher Unit-Test-Anteil der Domänenlogik |
| Float-/Rundungsfehler | Phase 1 + Phase 2 | Golden-master Formeln, identische Ergebnisse in Dashboard/Analyse |

## Sources

- Projektkontext und Anforderungen:
  - `.planning/PROJECT.md`
  - `balkonbilanz_spec_driven_development.md`
- MDN Web Docs — Storage quotas and eviction criteria (last modified 2026-01-05): https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- web.dev — The service worker lifecycle: https://web.dev/service-worker-lifecycle/
- Dexie Docs — Understanding the basics (Schema versions/upgrades): https://dexie.org/docs/Tutorial/Understanding-the-basics

---
*Pitfalls research for: BalkonBilanz (local-first energy tracking)*
*Researched: 2026-05-11*

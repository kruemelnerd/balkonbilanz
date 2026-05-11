# Phase 1: Datenerfassung & Fachfundament - Research

**Researched:** 2026-05-11
**Domain:** Local-first data capture with strict domain validation (Vue 3 + Dexie)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01..D-10 from `01-CONTEXT.md` are mandatory, especially strict blocking validation, duplicate timestamp prevention, and documented meter-change handling.

### OpenCode's Discretion
- Form field ordering, microcopy details, and non-critical inline hints.

### Deferred Ideas (OUT OF SCOPE)
- None for this phase.
</user_constraints>

<research_summary>
## Summary

Phase 1 should be implemented as a strict vertical slice from storage schema to mobile-first forms, with validation logic isolated in pure TypeScript domain modules and UI consuming typed validation results. This keeps rules testable and avoids drift between form-level checks and persistence rules.

For meter events, the durable pattern is: normalize input -> run deterministic validators -> enforce uniqueness and monotonic constraints against neighboring records -> persist atomically. For PV day values, use one row per day with upsert semantics and a hard date guard (past days only).

**Primary recommendation:** Build repository + domain validators first, then thin form flows that only orchestrate validator output and persistence.
</research_summary>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
├── domain/              # pure validation, parsing, meter-change rules
├── repositories/        # Dexie-backed CRUD + query helpers
├── services/            # application flows (create/update/delete)
├── stores/              # Pinia UI/application state
└── features/            # form/list screens for meter and PV
```

### Pattern 1: Domain-First Validation
**What:** Keep all business rules in pure functions returning typed error codes/messages.
**When to use:** Every create/update path for meter and PV entries.

### Pattern 2: Repository Guardrails
**What:** Re-check uniqueness and ordering constraints in write services before commit.
**When to use:** To prevent race-like conflicts across multi-screen edits.

### Anti-Patterns to Avoid
- **Validation only in components:** causes duplicated and inconsistent rules.
- **Date/time logic mixed into view code:** creates locale/timezone bugs and weak tests.
- **Implicit correction of invalid meter values:** violates explicit domain behavior.
</architecture_patterns>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Timestamp collisions hidden by formatting
**What goes wrong:** Different input formats map to same instant and create duplicate events.
**How to avoid:** Normalize to a canonical ISO instant before uniqueness checks.

### Pitfall 2: PV day checks using local now incorrectly
**What goes wrong:** Users near midnight can save disallowed dates.
**How to avoid:** Compare against explicit local calendar day boundaries, not raw milliseconds only.

### Pitfall 3: Meter-change flow treated as optional note
**What goes wrong:** Decreasing values get persisted without explicit handling.
**How to avoid:** Block write or route to explicit meter-change path with auditable reason.
</common_pitfalls>

<sources>
## Sources

### Primary
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/phases/01-datenerfassung-fachfundament/01-CONTEXT.md`

### Supporting
- `balkonbilanz_spec_driven_development.md`
</sources>

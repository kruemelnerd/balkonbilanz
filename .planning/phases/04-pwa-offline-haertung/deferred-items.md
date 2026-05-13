# Deferred Items

- `tests/unit/pvDailyService.test.ts::pv service blocks today entries before repository writes` is currently red in the full suite because the fixed date in the test is already a past day in the current environment. This is unrelated to the Phase 4 PWA work and was left untouched per scope rules.

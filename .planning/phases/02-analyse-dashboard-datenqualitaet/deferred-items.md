# Deferred Items

- `npm run test:unit` currently fails in `tests/unit/pvDailyService.test.ts:75` because the test expects a `false` result for `2026-05-11`, but the service returns `true` in the current environment. This appears unrelated to the Phase-2 analysis/domain changes and was left untouched.

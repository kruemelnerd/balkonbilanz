---
status: awaiting_human_verify
trigger: "Behandle die verbleibenden Component-Testfehler aus `npm run test:component`. Aktueller Befund: 3 Tests schlagen fehl, alle mit `Cannot read properties of undefined (reading 'hash')` im CaptureView-Watcher bzw. Router-Location-Kontext.\n\nBetroffene Tests:\n- `tests/component/meterCapture.test.ts`\n- `tests/component/meterErrorDisplay.test.ts`\n- `tests/component/pvCapture.test.ts`\n\nBereits bekannt:\n- Andere Settings-Tests sind gruen.\n- Das Problem scheint im Capture-/Router-Kontext zu liegen (`Symbol(route location)` Warnungen, `location.hash` undefiniert).\n\nAuftrag:\n1. Root Cause sauber eingrenzen.\n2. Minimalen Fix umsetzen.\n3. Sinnvolle Regression-Checks ergaenzen oder bestehende Tests anpassen.\n4. Relevante Tests und Build verifizieren.\n5. Nicht committen, ausser es ist fuer den Workflow zwingend erforderlich.\n\nReturn:\n- Root cause\n- Geaenderte Dateien\n- Welche Tests jetzt gruen sind\n- Ob noch Restprobleme offen sind"
created: 2026-05-13T16:15:35.056Z
updated: 2026-05-13T16:19:55.000Z
---

## Current Focus
hypothesis: Verified fixed; capture component now tolerates missing router context and the full component suite/build are green.
test: Confirm the rerun no longer emits route-location warnings or `hash` crashes.
expecting: `npm run test:component` and `npm run build` both pass cleanly.
next_action: Record the final verification state and summarize the diagnosis.

## Symptoms
expected: Component tests for meter capture, error display, and PV capture should mount and render without router-related runtime errors.
actual: Three component tests fail with `Cannot read properties of undefined (reading 'hash')` and `Symbol(route location)` warnings in the CaptureView watcher/router context.
errors: Cannot read properties of undefined (reading 'hash'); Symbol(route location)
reproduction: Run `npm run test:component` and observe failures in `tests/component/meterCapture.test.ts`, `tests/component/meterErrorDisplay.test.ts`, and `tests/component/pvCapture.test.ts`.
started: Unknown; currently reproducible in component test suite.

## Eliminated

## Evidence
- timestamp: 2026-05-13T16:16:41Z
  checked: Failing component tests and CaptureView/router setup
  found: `CaptureView.vue` calls `useRoute()` and immediately reads `route.hash` in both `focusFromHash(hash = route.hash)` and `watch(() => route.hash, ...)`. The component tests mount `CaptureView` via `mountVueComponent(...)` without any router plugin, while other router-dependent tests explicitly inject `createAppRouter(...)`.
  implication: The failure is caused by `CaptureView` assuming router context in a test harness that does not provide it.
- timestamp: 2026-05-13T16:18:59Z
  checked: Re-run of `npm run test:component` and `npm run build`
  found: All 14 component tests passed; the capture tests no longer emit route-location warnings; production build completed successfully.
  implication: The router fallback/injection guard resolved the crash without breaking adjacent functionality.

## Resolution
root_cause: CaptureView read `route.hash` unconditionally in an immediate watcher and helper, but the component tests mount it without a router plugin, so the route injection was missing and the watcher crashed.
fix: Use a default route-location injection plus a `window.location.hash` fallback so CaptureView works both inside the app router and in isolated tests.
verification: `npm run test:component` passes (14/14). `npm run build` passes.
files_changed: ["src/features/capture/CaptureView.vue"]

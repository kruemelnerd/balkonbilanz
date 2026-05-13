---
phase: 04-pwa-offline-haertung
plan: 01
subsystem: pwa
tags: [pwa, offline, workbox, manifest, vue]
dependency_graph:
  requires: [vite-plugin-pwa, Vue shell bootstrap]
  provides: [service-worker-build, manifest, offline-start, update-prompt]
  affects: [App.vue, main.ts, styles, component tests]
tech-stack:
  added: [vite-plugin-pwa]
  patterns: [prompt registration, injected PWA prompt state, conservative runtime caching]
key-files:
  created:
    - public/favicon.svg
    - public/apple-touch-icon.svg
    - public/pwa-192x192.svg
    - public/pwa-512x512.svg
    - src/features/pwa/ReloadPrompt.vue
    - src/pwa/pwaPrompt.ts
    - src/pwa/registerServiceWorker.ts
    - tests/component/reloadPrompt.test.ts
  modified:
    - package.json
    - package-lock.json
    - vite.config.ts
    - src/App.vue
    - src/main.ts
    - src/styles/main.css
decisions:
  - Use prompt-mode service worker updates so users confirm reloads explicitly.
  - Keep the prompt testable via an injected state object, while app bootstrap provides the real SW-backed state.
metrics:
  duration: "~25m"
  completed_date: "2026-05-13"
---

# Phase 04 Plan 01: PWA Basis & Update Prompt Summary

Builds the first offline/PWA layer for BalkonBilanz: SW registration, manifest generation, conservative static-asset caching, and a global update prompt with clear reload affordance.

## Completed Tasks

| task | name | commit | files |
| --- | --- | --- | --- |
| 1 | Vite PWA Plugin und Manifest konfigurieren | 730d69e | `vite.config.ts`, `package.json`, `package-lock.json`, `public/*.svg` |
| 2 | SW-Registrierung und Update-Prompt UI verdrahten | a47fd35 | `src/App.vue`, `src/main.ts`, `src/styles/main.css`, `src/features/pwa/ReloadPrompt.vue`, `src/pwa/*`, `tests/component/reloadPrompt.test.ts` |

## Verification

- `npm run build`
- `node --test tests/component/*.test.ts`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking issue] Added a local PWA prompt state abstraction**
- **Found during:** task 2
- **Issue:** The test harness cannot import the real `virtual:pwa-register/vue` module directly.
- **Fix:** Added `src/pwa/pwaPrompt.ts` and injected state into the prompt so tests stay deterministic while the app bootstrap still uses the real SW-backed state.
- **Files modified:** `src/pwa/pwaPrompt.ts`, `src/pwa/registerServiceWorker.ts`, `src/features/pwa/ReloadPrompt.vue`, `src/main.ts`, `tests/component/reloadPrompt.test.ts`
- **Commit:** a47fd35

## Self-Check: PASSED

- Summary file exists.
- Task commits `730d69e` and `a47fd35` exist in git history.

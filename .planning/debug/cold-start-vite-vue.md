---
status: diagnosed
trigger: "You are diagnosing a single UAT gap for BalkonBilanz Phase 01. Goal: find_root_cause_only (do NOT implement fixes)."
created: 2026-05-11T17:22:36Z
updated: 2026-05-11T17:23:45Z
---

## Current Focus

hypothesis: Vite is not configured with the Vue plugin, so .vue files are parsed as plain JS.
test: inspect package manifest and Vite config for @vitejs/plugin-vue registration
expecting: plugin-vue dependency exists but no Vite config applies it
next_action: confirm absence of vite config and record evidence

## Symptoms

expected: App startet frisch ohne Build-/Ladefehler; die Hauptansicht ist erreichbar.
actual: [plugin:vite:import-analysis] Failed to parse source for import analysis because the content contains invalid JS syntax. Install @vitejs/plugin-vue to handle .vue files. /home/philipp/Dokumente/code/balkonbilanz_new/src/App.vue:3:9
errors: [plugin:vite:import-analysis] Failed to parse source for import analysis because the content contains invalid JS syntax. Install @vitejs/plugin-vue to handle .vue files.
reproduction: Cold Start Smoke Test
started: 2026-05-11

## Eliminated

## Evidence

- timestamp: 2026-05-11T17:23:00Z
  checked: .planning/phases/01-datenerfassung-fachfundament/01-UAT.md
  found: Cold-start failure is a Vite import-analysis parse error on src/App.vue line 3, with Vite explicitly suggesting @vitejs/plugin-vue.
  implication: The app never reaches the main view because Vue SFCs are not being transformed.

- timestamp: 2026-05-11T17:23:00Z
  checked: package.json
  found: @vitejs/plugin-vue is present in devDependencies, and the app uses Vue SFCs via src/App.vue and src/main.ts.
  implication: The package is installed, so the failure is not a missing dependency; it points to missing Vite plugin wiring.

- timestamp: 2026-05-11T17:23:00Z
  checked: vite.config.* in repository root
  found: No Vite config file exists in the project root, so no plugin-vue registration is applied at startup.
  implication: Vite runs with default config and tries to parse .vue files as plain JS.

## Resolution

root_cause: Vite has no project-level config registering @vitejs/plugin-vue, so .vue single-file components are not transformed and import-analysis fails during cold start.
fix: 
verification: 
files_changed: []

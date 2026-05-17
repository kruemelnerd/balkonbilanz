import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const root = resolve(import.meta.dirname, '../..');

function readRepoFile(relativePath: string) {
  const filePath = resolve(root, relativePath);
  assert.equal(existsSync(filePath), true, `${relativePath} should exist`);
  return readFileSync(filePath, 'utf8');
}

test('GitHub automation provides CI, release and security workflows', () => {
  const ciWorkflow = readRepoFile('.github/workflows/ci.yml');
  const releaseWorkflow = readRepoFile('.github/workflows/release.yml');
  const securityWorkflow = readRepoFile('.github/workflows/security.yml');

  assert.match(ciWorkflow, /pull_request:/);
  assert.match(ciWorkflow, /push:/);
  assert.match(ciWorkflow, /npm ci/);
  assert.match(ciWorkflow, /npm run test:ci/);
  assert.match(ciWorkflow, /npm run build/);

  assert.match(releaseWorkflow, /tags:/);
  assert.match(releaseWorkflow, /npm run build/);
  assert.match(releaseWorkflow, /zip -r/);
  assert.match(releaseWorkflow, /gh release create|softprops\/action-gh-release/);

  assert.match(securityWorkflow, /schedule:/);
  assert.match(securityWorkflow, /aquasecurity\/trivy-action/);
  assert.match(securityWorkflow, /upload-sarif/);
  assert.match(securityWorkflow, /npm audit --audit-level=high/);
});

test('repository defines Renovate with conservative update grouping', () => {
  const renovateConfig = readRepoFile('.github/renovate.json5');

  assert.match(renovateConfig, /extends:/);
  assert.match(renovateConfig, /config:recommended/);
  assert.match(renovateConfig, /:dependencyDashboard/);
  assert.match(renovateConfig, /minimumReleaseAge: '7 days'/);
  assert.match(renovateConfig, /groupName: 'github-actions'/);
  assert.match(renovateConfig, /matchManagers: \['github-actions'\]/);
  assert.match(renovateConfig, /matchUpdateTypes: \['minor', 'patch', 'digest'\]/);
});

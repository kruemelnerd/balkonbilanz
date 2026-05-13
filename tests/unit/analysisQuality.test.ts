import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateDataQuality } from '../../src/domain/analysis/evaluateDataQuality.ts';
import type { DataQualityResult } from '../../src/domain/analysis/intervalTypes.ts';

test('evaluateDataQuality returns good/limited/poor with reasons', () => {
  const result = evaluateDataQuality({
    intervalDays: 8,
    pvCoverage: 0.4,
  }) as DataQualityResult;

  assert.equal(result.level, 'limited');
  assert.ok(result.reasons.length > 0);
});

test('evaluateDataQuality downgrades long intervals past 7 days', () => {
  const result = evaluateDataQuality({
    intervalDays: 10,
    pvCoverage: 1,
  }) as DataQualityResult;

  assert.equal(result.level, 'good');
});

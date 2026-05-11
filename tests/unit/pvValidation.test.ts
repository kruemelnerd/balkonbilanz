import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asPvDay } from '../../src/domain/types.ts';
import { validatePvDailyEntry } from '../../src/domain/validation/pvValidation.ts';

test('pv validation accepts completed past days and normalizes inputs', () => {
  const result = validatePvDailyEntry(
    {
      day: '2026-05-10',
      generationKwh: '3.2',
      source: 'manual',
      note: 'sunny',
    },
    { referenceDate: new Date('2026-05-11T12:00:00.000Z') },
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.day, asPvDay('2026-05-10'));
    assert.equal(result.value.generationKwh, 3.2);
    assert.equal(result.value.writeMode, 'create');
  }
});

test('pv validation blocks today and future days around a timezone boundary', () => {
  const todayResult = validatePvDailyEntry(
    {
      day: '2026-05-11',
      generationKwh: 3.2,
      source: 'manual',
    },
    { referenceDate: new Date('2026-05-11T23:30:00.000Z') },
  );

  assert.equal(todayResult.ok, false);
  if (!todayResult.ok) {
    assert.ok(todayResult.issues.some((issue) => issue.code === 'future_or_today_day'));
  }

  const futureResult = validatePvDailyEntry(
    {
      day: '2026-05-12',
      generationKwh: 3.2,
      source: 'manual',
    },
    { referenceDate: new Date('2026-05-11T23:30:00.000Z') },
  );

  assert.equal(futureResult.ok, false);
  if (!futureResult.ok) {
    assert.ok(futureResult.issues.some((issue) => issue.code === 'future_or_today_day'));
  }
});

test('pv validation supports update intent for existing day rows', () => {
  const result = validatePvDailyEntry(
    {
      day: '2026-05-10',
      generationKwh: 4.2,
      source: 'manual',
    },
    {
      referenceDate: new Date('2026-05-11T12:00:00.000Z'),
      existingRecord: { id: 2, day: asPvDay('2026-05-10') },
      intent: 'update',
    },
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.writeMode, 'update');
  }
});

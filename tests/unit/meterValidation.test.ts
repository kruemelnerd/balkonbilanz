import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asMeterTimestamp, type MeterReadingRecord } from '../../src/domain/types.ts';
import { validateMeterReading } from '../../src/domain/validation/meterValidation.ts';

const existingReadings: Array<Pick<MeterReadingRecord, 'id' | 'timestamp' | 'obis180Kwh' | 'obis280Kwh'>> = [
  {
    id: 1,
    timestamp: asMeterTimestamp('2026-05-10T07:00:00.000Z'),
    obis180Kwh: 1200,
    obis280Kwh: 50,
  },
];

test('meter validation accepts complete, monotonically increasing readings', () => {
  const result = validateMeterReading(
    {
      timestamp: '2026-05-11T08:00:00.000Z',
      obis180Kwh: '1204.5',
      obis280Kwh: '52',
      note: 'Morning read',
    },
    { existingReadings },
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.timestamp, asMeterTimestamp('2026-05-11T08:00:00.000Z'));
    assert.equal(result.value.obis180Kwh, 1204.5);
    assert.equal(result.value.obis280Kwh, 52);
  }
});

test('meter validation blocks missing, invalid, duplicate, and descending readings', () => {
  const result = validateMeterReading(
    {
      timestamp: '2026-05-10T07:00:00.000Z',
      obis180Kwh: '-1',
      obis280Kwh: 'not-a-number',
    },
    { existingReadings },
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.issues.some((issue) => issue.code === 'duplicate_timestamp'));
    assert.ok(result.issues.some((issue) => issue.code === 'negative_value' && issue.field === 'obis180Kwh'));
    assert.ok(result.issues.some((issue) => issue.code === 'invalid_number_format' && issue.field === 'obis280Kwh'));
  }
});

test('meter validation detects descending values against the previous reading', () => {
  const result = validateMeterReading(
    {
      timestamp: '2026-05-11T07:00:00.000Z',
      obis180Kwh: 1199,
      obis280Kwh: 55,
    },
    { existingReadings },
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.issues.some((issue) => issue.code === 'meter_value_decreased' && issue.field === 'obis180Kwh'));
  }
});

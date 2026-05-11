export type Brand<T, Name extends string> = T & {
  readonly __brand: Name;
};

export type MeterTimestamp = Brand<string, 'MeterTimestamp'>;
export type PvDay = Brand<`${number}-${number}-${number}`, 'PvDay'>;

export const asMeterTimestamp = (value: string): MeterTimestamp => value as MeterTimestamp;
export const asPvDay = (value: string): PvDay => value as PvDay;

export interface BaseRecord {
  id?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Kumulierte Zählerablesung als Ereignis mit genauer Zeit.
 */
export interface MeterReadingRecord extends BaseRecord {
  timestamp: MeterTimestamp;
  obis180Kwh: number;
  obis280Kwh: number;
  note?: string;
}

/**
 * PV-Ertrag als Tageswert ohne Uhrzeitkonzept.
 */
export interface PvDailyRecord extends BaseRecord {
  day: PvDay;
  generationKwh: number;
  note?: string;
  source: string;
}

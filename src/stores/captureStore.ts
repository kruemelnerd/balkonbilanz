import type { MeterReadingRecord, PvDailyRecord } from '../domain/types.ts';
import type {
  MeterReadingDraftInput,
  MeterValidationIssue,
} from '../domain/validation/meterValidation.ts';
import type { PvDailyDraftInput, PvValidationIssue } from '../domain/validation/pvValidation.ts';
import type { MeterReadingsRepository } from '../repositories/meterReadingsRepository.ts';
import type { PvDailyRepository } from '../repositories/pvDailyRepository.ts';
import type {
  MeterReadingService,
  MeterReadingServiceFailure,
  MeterReadingServiceResult,
} from '../services/meterReadingService.ts';
import type { PvDailyService, PvDailyServiceFailure, PvDailyServiceResult } from '../services/pvDailyService.ts';

export interface MeterDraftState {
  timestamp: string;
  obis180Kwh: string;
  obis280Kwh: string;
  note: string;
}

export interface MeterCaptureState {
  draft: MeterDraftState;
  editingId: number | null;
  readings: MeterReadingRecord[];
  issues: MeterValidationIssue[];
  banner: string | null;
  busy: boolean;
}

export interface CaptureStoreDependencies {
  meterService: MeterReadingService;
  meterRepository: MeterReadingsRepository;
  pvService: PvDailyService;
  pvRepository: PvDailyRepository;
}

export interface PvDraftState {
  day: string;
  generationKwh: string;
  source: string;
  note: string;
}

export interface PvCaptureState {
  draft: PvDraftState;
  editingId: number | null;
  entries: PvDailyRecord[];
  issues: PvValidationIssue[];
  banner: string | null;
  busy: boolean;
}

export interface CaptureStore {
  meter: MeterCaptureState;
  pv: PvCaptureState;
  loadMeterReadings(): Promise<void>;
  loadPvEntries(): Promise<void>;
  startMeterCreate(): void;
  startMeterEdit(id: number): Promise<boolean>;
  updateMeterDraft(patch: Partial<MeterDraftState>): void;
  cancelMeterEdit(): void;
  submitMeter(): Promise<MeterReadingServiceResult<MeterReadingRecord>>;
  deleteMeter(id: number): Promise<boolean>;
  startPvCreate(): void;
  startPvEdit(id: number): Promise<boolean>;
  updatePvDraft(patch: Partial<PvDraftState>): void;
  cancelPvEdit(): void;
  submitPv(): Promise<PvDailyServiceResult<PvDailyRecord>>;
  deletePv(id: number): Promise<boolean>;
}

export function createEmptyMeterDraft(): MeterDraftState {
  return {
    timestamp: '',
    obis180Kwh: '',
    obis280Kwh: '',
    note: '',
  };
}

function toMeterDraft(record: MeterReadingRecord): MeterDraftState {
  return {
    timestamp: record.timestamp,
    obis180Kwh: String(record.obis180Kwh),
    obis280Kwh: String(record.obis280Kwh),
    note: record.note ?? '',
  };
}

function toDraftInput(draft: MeterDraftState): MeterReadingDraftInput {
  return {
    timestamp: draft.timestamp,
    obis180Kwh: draft.obis180Kwh,
    obis280Kwh: draft.obis280Kwh,
    note: draft.note,
  };
}

function validationIssuesFromFailure(failure: MeterReadingServiceFailure): MeterValidationIssue[] {
  return failure.issues;
}

export function createEmptyPvDraft(): PvDraftState {
  return {
    day: '',
    generationKwh: '',
    source: 'manual',
    note: '',
  };
}

function toPvDraft(record: PvDailyRecord): PvDraftState {
  return {
    day: record.day,
    generationKwh: String(record.generationKwh),
    source: record.source,
    note: record.note ?? '',
  };
}

function toPvDraftInput(draft: PvDraftState): PvDailyDraftInput {
  return {
    day: draft.day,
    generationKwh: draft.generationKwh,
    source: draft.source,
    note: draft.note,
  };
}

function validationIssuesFromPvFailure(failure: PvDailyServiceFailure): PvValidationIssue[] {
  return failure.issues;
}

export function createCaptureStore(dependencies: CaptureStoreDependencies): CaptureStore {
  const meter: MeterCaptureState = {
    draft: createEmptyMeterDraft(),
    editingId: null,
    readings: [],
    issues: [],
    banner: null,
    busy: false,
  };

  const pv: PvCaptureState = {
    draft: createEmptyPvDraft(),
    editingId: null,
    entries: [],
    issues: [],
    banner: null,
    busy: false,
  };

  async function loadMeterReadings(): Promise<void> {
    meter.readings = await dependencies.meterRepository.listNewestFirst();
  }

  async function loadPvEntries(): Promise<void> {
    pv.entries = await dependencies.pvRepository.listNewestFirst();
  }

  function startMeterCreate(): void {
    meter.editingId = null;
    meter.draft = createEmptyMeterDraft();
    meter.issues = [];
    meter.banner = null;
  }

  async function startMeterEdit(id: number): Promise<boolean> {
    const existing = await dependencies.meterRepository.get(id);
    if (!existing) {
      meter.issues = [
        {
          code: 'required_field_missing',
          field: 'timestamp',
          message: 'Der Eintrag konnte nicht geladen werden.',
        },
      ];
      meter.banner = 'Bitte aktualisieren Sie die Liste und versuchen Sie es erneut.';
      return false;
    }

    meter.editingId = id;
    meter.draft = toMeterDraft(existing);
    meter.issues = [];
    meter.banner = null;
    return true;
  }

  function updateMeterDraft(patch: Partial<MeterDraftState>): void {
    meter.draft = {
      ...meter.draft,
      ...patch,
    };
  }

  function cancelMeterEdit(): void {
    startMeterCreate();
  }

  async function submitMeter(): Promise<MeterReadingServiceResult<MeterReadingRecord>> {
    meter.busy = true;
    meter.banner = null;

    try {
      const input = toDraftInput(meter.draft);
      const result = meter.editingId === null
        ? await dependencies.meterService.create(input)
        : await dependencies.meterService.update(meter.editingId, input);

      if (!result.ok) {
        meter.issues = validationIssuesFromFailure(result);
        meter.banner = result.kind === 'meter-change-required'
          ? 'Bitte prüfen Sie, ob ein Zählerwechsel dokumentiert werden muss.'
          : 'Bitte korrigieren Sie die markierten Felder.';
        return result;
      }

      await loadMeterReadings();
      startMeterCreate();
      return result;
    } finally {
      meter.busy = false;
    }
  }

  async function deleteMeter(id: number): Promise<boolean> {
    const result = await dependencies.meterService.delete(id);
    if (!result.ok) {
      meter.issues = validationIssuesFromFailure(result);
      meter.banner = 'Der Eintrag konnte nicht gelöscht werden.';
      return false;
    }

    await loadMeterReadings();
    if (meter.editingId === id) {
      startMeterCreate();
    }

    return true;
  }

  function startPvCreate(): void {
    pv.editingId = null;
    pv.draft = createEmptyPvDraft();
    pv.issues = [];
    pv.banner = null;
  }

  async function startPvEdit(id: number): Promise<boolean> {
    const existing = await dependencies.pvRepository.get(id);
    if (!existing) {
      pv.issues = [
        {
          code: 'required_field_missing',
          field: 'day',
          message: 'Der Eintrag konnte nicht geladen werden.',
        },
      ];
      pv.banner = 'Bitte aktualisieren Sie die Liste und versuchen Sie es erneut.';
      return false;
    }

    pv.editingId = id;
    pv.draft = toPvDraft(existing);
    pv.issues = [];
    pv.banner = null;
    return true;
  }

  function updatePvDraft(patch: Partial<PvDraftState>): void {
    pv.draft = {
      ...pv.draft,
      ...patch,
    };
  }

  function cancelPvEdit(): void {
    startPvCreate();
  }

  async function submitPv(): Promise<PvDailyServiceResult<PvDailyRecord>> {
    pv.busy = true;
    pv.banner = null;

    try {
      const input = toPvDraftInput(pv.draft);
      const result = pv.editingId === null
        ? await dependencies.pvService.create(input)
        : await dependencies.pvService.update(pv.editingId, input);

      if (!result.ok) {
        pv.issues = validationIssuesFromPvFailure(result);
        pv.banner = 'Bitte korrigieren Sie die markierten Felder.';
        return result;
      }

      await loadPvEntries();
      startPvCreate();
      return result;
    } finally {
      pv.busy = false;
    }
  }

  async function deletePv(id: number): Promise<boolean> {
    const result = await dependencies.pvService.delete(id);
    if (!result.ok) {
      pv.issues = validationIssuesFromPvFailure(result);
      pv.banner = 'Der Eintrag konnte nicht gelöscht werden.';
      return false;
    }

    await loadPvEntries();
    if (pv.editingId === id) {
      startPvCreate();
    }

    return true;
  }

  return {
    meter,
    pv,
    loadMeterReadings,
    loadPvEntries,
    startMeterCreate,
    startMeterEdit,
    updateMeterDraft,
    cancelMeterEdit,
    submitMeter,
    deleteMeter,
    startPvCreate,
    startPvEdit,
    updatePvDraft,
    cancelPvEdit,
    submitPv,
    deletePv,
  };
}

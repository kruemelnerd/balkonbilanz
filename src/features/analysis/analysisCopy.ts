export function describeCombinedWarning(code: string): string {
  if (code === 'pv_below_export') {
    return 'Plausibilitaetswarnung: Einspeisung liegt ueber dem erfassten PV-Tagesertrag.';
  }

  return code;
}

export interface QualityReasonContext {
  pvDays?: number;
  rangeDays?: number;
  intervalDays?: number;
}

export function describeQualityReason(code: string, context: QualityReasonContext = {}): string {
  if (code === 'pv_coverage_partial') {
    const pvDays = context.pvDays ?? 0;
    const rangeDays = context.rangeDays ?? 0;
    return `Nur ${pvDays} von ${rangeDays} PV-Tagen vorhanden`;
  }

  if (code === 'interval_over_7_days') {
    const intervalDays = context.intervalDays ?? 0;
    return `Ein Intervall dauert ${intervalDays} Tage und zieht die Qualitaet nach unten.`;
  }

  if (code === 'minimal_basis') {
    return 'Die Analyse basiert nur auf einer sehr kleinen Datenbasis.';
  }

  return code;
}

export function describeIntervalFlag(code: string): string {
  if (code === 'suspicious_jump') {
    return 'Auffaelliger Zaehlersprung';
  }

  if (code === 'pv_export_mismatch') {
    return 'Plausibilitaetswarnung: PV-Ertrag liegt unter der Einspeisung.';
  }

  return code;
}

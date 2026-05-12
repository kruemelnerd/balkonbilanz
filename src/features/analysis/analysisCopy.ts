interface QualityReasonContext {
  pvDayCount?: number;
  periodDays?: number;
}

function hasCoverageContext(context: QualityReasonContext): context is Required<QualityReasonContext> {
  return typeof context.pvDayCount === 'number' && typeof context.periodDays === 'number' && context.periodDays > 0;
}

export function formatCombinedWarning(code: string): string {
  if (code === 'pv_below_export') {
    return 'Plausibilitaetswarnung: Einspeisung liegt ueber dem erfassten PV-Tagesertrag.';
  }

  return code;
}

export function formatQualityReason(code: string, context: QualityReasonContext = {}): string {
  if (code === 'pv_coverage_partial') {
    if (hasCoverageContext(context)) {
      return `Nur ${context.pvDayCount} von ${context.periodDays} PV-Tagen vorhanden.`;
    }

    return 'PV-Tage fehlen fuer den gewaehlten Zeitraum.';
  }

  if (code === 'pv_coverage_low') {
    if (hasCoverageContext(context)) {
      return `Nur ${context.pvDayCount} von ${context.periodDays} PV-Tagen vorhanden.`;
    }

    return 'Es fehlen viele PV-Tage im gewaehlten Zeitraum.';
  }

  if (code === 'interval_over_7_days') {
    return 'Zaehlerintervall laenger als 7 Tage.';
  }

  if (code === 'minimal_basis') {
    return 'Die kombinierte Auswertung basiert noch auf einer schmalen Datengrundlage.';
  }

  return code;
}

export function formatIntervalFlag(code: string): string {
  if (code === 'suspicious_jump') {
    return 'Plausibilitaetswarnung: Dieser Zaehlersprung wirkt ungewoehnlich, bleibt aber gespeichert.';
  }

  if (code === 'pv_export_mismatch') {
    return 'Plausibilitaetswarnung: Die Einspeisung in diesem Intervall liegt ueber dem erfassten PV-Tagesertrag.';
  }

  return code;
}

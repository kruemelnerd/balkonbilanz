export interface BatteryAdvisorScenarioDefinition {
  key: 'konservativ' | 'realistisch' | 'optimistisch' | 'theoretisch';
  label: string;
  usableShare: number;
}

export const BATTERY_ADVISOR_SCENARIOS: BatteryAdvisorScenarioDefinition[] = [
  { key: 'konservativ', label: 'konservativ', usableShare: 0.25 },
  { key: 'realistisch', label: 'realistisch', usableShare: 0.4 },
  { key: 'optimistisch', label: 'optimistisch', usableShare: 0.6 },
  { key: 'theoretisch', label: 'theoretisch', usableShare: 0.8 },
];

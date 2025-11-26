import { createClient } from '@/lib/supabase/server';

export interface WorkloadAlert {
  id: string;
  priestId: string;
  priestName: string;
  currentLoad: number;
  optimalCapacity: number;
  utilizationPercentage: number;
  alertLevel: 'warning' | 'critical';
  suggestedActions: string[];
  createdAt: Date;
}

export interface WorkloadRedistributionSuggestion {
  fromPriestId: string;
  fromPriestName: string;
  toPriestId: string;
  toPriestName: string;
  ritualIds: string[];
  reason: string;
}

const WORKLOAD_WARNING_THRESHOLD = 75; // 75% capacity
const WORKLOAD_CRITICAL_THRESHOLD = 85; // 85% capacity

/**
 * Check all priests for workload exceeding thresholds
 * and generate alerts for administrators
 */
export async function checkPriestWorkloads(): Promise<WorkloadAlert[]> {
  const supabase = await createClient();
  const alerts: WorkloadAlert[] = [];

  // Fetch all priests with their current assignments
  const { data: priests, error } = await supabase
    .from('priests')
    .select(`
      id,
      name,
      optimal_capacity,
      current_load,
      specializations
    `);

  if (error || !priests) {
    console.error('Error fetching priests:', error);
    return [];
  }

  for (const priest of priests) {
    const utilizationPercentage = Math.round(
      (priest.current_load / priest.optimal_capacity) * 100
    );

    // Check if workload exceeds thresholds
    if (utilizationPercentage >= WORKLOAD_WARNING_THRESHOLD) {
      const alertLevel =
        utilizationPercentage >= WORKLOAD_CRITICAL_THRESHOLD ? 'critical' : 'warning';

      const suggestedActions = generateSuggestedActions(
        priest,
        utilizationPercentage,
        alertLevel
      );

      alerts.push({
        id: `alert-${priest.id}-${Date.now()}`,
        priestId: priest.id,
        priestName: priest.name,
        currentLoad: priest.current_load,
        optimalCapacity: priest.optimal_capacity,
        utilizationPercentage,
        alertLevel,
        suggestedActions,
        createdAt: new Date(),
      });
    }
  }

  // Store alerts in database
  if (alerts.length > 0) {
    await storeWorkloadAlerts(alerts);
  }

  return alerts;
}

/**
 * Generate suggested actions based on workload level
 */
function generateSuggestedActions(
  priest: any,
  utilizationPercentage: number,
  alertLevel: 'warning' | 'critical'
): string[] {
  const actions: string[] = [];

  if (alertLevel === 'critical') {
    actions.push('URGENT: Redistribute rituals immediately to prevent burnout');
    actions.push('Block new assignments until workload decreases below 75%');
    actions.push('Contact priest to confirm availability and wellbeing');
  } else {
    actions.push('Monitor workload closely - approaching capacity limit');
    actions.push('Consider redistributing 2-3 rituals to other priests');
    actions.push('Review upcoming assignments for potential conflicts');
  }

  actions.push(`Current utilization: ${utilizationPercentage}% of optimal capacity`);
  actions.push(
    `Specializations: ${priest.specializations?.join(', ') || 'None specified'}`
  );

  return actions;
}

/**
 * Store workload alerts in the database
 */
async function storeWorkloadAlerts(alerts: WorkloadAlert[]): Promise<void> {
  const supabase = await createClient();

  const alertRecords = alerts.map(alert => ({
    priest_id: alert.priestId,
    alert_level: alert.alertLevel,
    current_load: alert.currentLoad,
    optimal_capacity: alert.optimalCapacity,
    utilization_percentage: alert.utilizationPercentage,
    suggested_actions: alert.suggestedActions,
    status: 'active',
    created_at: alert.createdAt.toISOString(),
  }));

  const { error } = await supabase.from('workload_alerts').insert(alertRecords);

  if (error) {
    console.error('Error storing workload alerts:', error);
  }
}

/**
 * Get active workload alerts for display
 */
export async function getActiveWorkloadAlerts(): Promise<WorkloadAlert[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workload_alerts')
    .select(
      `
      id,
      priest_id,
      alert_level,
      current_load,
      optimal_capacity,
      utilization_percentage,
      suggested_actions,
      created_at,
      priests (
        name
      )
    `
    )
    .eq('status', 'active')
    .order('utilization_percentage', { ascending: false });

  if (error || !data) {
    console.error('Error fetching workload alerts:', error);
    return [];
  }

  return data.map(alert => ({
    id: alert.id,
    priestId: alert.priest_id,
    priestName: alert.priests?.name || 'Unknown',
    currentLoad: alert.current_load,
    optimalCapacity: alert.optimal_capacity,
    utilizationPercentage: alert.utilization_percentage,
    alertLevel: alert.alert_level as 'warning' | 'critical',
    suggestedActions: alert.suggested_actions,
    createdAt: new Date(alert.created_at),
  }));
}

/**
 * Generate workload redistribution suggestions
 */
export async function generateRedistributionSuggestions(
  overloadedPriestId: string
): Promise<WorkloadRedistributionSuggestion[]> {
  const supabase = await createClient();
  const suggestions: WorkloadRedistributionSuggestion[] = [];

  // Get overloaded priest details
  const { data: overloadedPriest } = await supabase
    .from('priests')
    .select('id, name, specializations, current_load, optimal_capacity')
    .eq('id', overloadedPriestId)
    .single();

  if (!overloadedPriest) return [];

  // Get their assigned rituals
  const { data: assignedRituals } = await supabase
    .from('ritual_assignments')
    .select(
      `
      id,
      ritual_id,
      rituals (
        name,
        required_specializations
      )
    `
    )
    .eq('priest_id', overloadedPriestId)
    .eq('status', 'pending');

  if (!assignedRituals || assignedRituals.length === 0) return [];

  // Find priests with available capacity and matching specializations
  const { data: availablePriests } = await supabase
    .from('priests')
    .select('id, name, specializations, current_load, optimal_capacity')
    .neq('id', overloadedPriestId);

  if (!availablePriests) return [];

  // Match rituals to available priests
  for (const ritual of assignedRituals) {
    const requiredSpecs = ritual.rituals?.required_specializations || [];

    for (const priest of availablePriests) {
      const utilizationPercentage =
        (priest.current_load / priest.optimal_capacity) * 100;

      // Only suggest priests below 70% capacity
      if (utilizationPercentage < 70) {
        const hasMatchingSpecs = requiredSpecs.every((spec: string) =>
          priest.specializations?.includes(spec)
        );

        if (hasMatchingSpecs || requiredSpecs.length === 0) {
          suggestions.push({
            fromPriestId: overloadedPriest.id,
            fromPriestName: overloadedPriest.name,
            toPriestId: priest.id,
            toPriestName: priest.name,
            ritualIds: [ritual.ritual_id],
            reason: `${priest.name} has ${Math.round(utilizationPercentage)}% capacity utilization and matching specializations`,
          });

          // Limit suggestions per ritual
          break;
        }
      }
    }
  }

  return suggestions;
}

/**
 * Dismiss a workload alert
 */
export async function dismissWorkloadAlert(alertId: string): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from('workload_alerts')
    .update({ status: 'dismissed', dismissed_at: new Date().toISOString() })
    .eq('id', alertId);
}

/**
 * Check if a priest can accept new assignments
 */
export async function canAcceptAssignment(priestId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: priest } = await supabase
    .from('priests')
    .select('current_load, optimal_capacity')
    .eq('id', priestId)
    .single();

  if (!priest) return false;

  const utilizationPercentage = (priest.current_load / priest.optimal_capacity) * 100;

  // Prevent assignments if workload exceeds 85%
  return utilizationPercentage < WORKLOAD_CRITICAL_THRESHOLD;
}

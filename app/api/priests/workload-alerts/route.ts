import { NextResponse } from 'next/server';
import {
  checkPriestWorkloads,
  getActiveWorkloadAlerts,
} from '@/lib/services/workload-alert.service';

export async function GET() {
  try {
    const alerts = await getActiveWorkloadAlerts();

    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error('Error fetching workload alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workload alerts' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Trigger workload check
    const alerts = await checkPriestWorkloads();

    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length,
      message: 'Workload check completed',
    });
  } catch (error) {
    console.error('Error checking priest workloads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check workloads' },
      { status: 500 }
    );
  }
}

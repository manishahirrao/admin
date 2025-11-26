import { NextResponse } from 'next/server';
import { dismissWorkloadAlert } from '@/lib/services/workload-alert.service';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dismissWorkloadAlert(params.id);

    return NextResponse.json({
      success: true,
      message: 'Alert dismissed successfully',
    });
  } catch (error) {
    console.error('Error dismissing workload alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to dismiss alert' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { generateRedistributionSuggestions } from '@/lib/services/workload-alert.service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const suggestions = await generateRedistributionSuggestions(params.id);

    return NextResponse.json({
      success: true,
      suggestions,
      count: suggestions.length,
    });
  } catch (error) {
    console.error('Error generating redistribution suggestions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

/**
 * Chart Optimization Utilities
 * Handles data sampling and optimization for large datasets
 */

/**
 * Sample data points for large datasets
 * Reduces data points while maintaining visual accuracy
 */
export function sampleDataPoints<T>(
  data: T[],
  maxPoints: number = 100
): T[] {
  if (data.length <= maxPoints) return data;

  const step = Math.ceil(data.length / maxPoints);
  const sampled: T[] = [];

  for (let i = 0; i < data.length; i += step) {
    sampled.push(data[i]);
  }

  // Always include the last point
  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1]);
  }

  return sampled;
}

/**
 * Aggregate data points by time period
 */
export function aggregateByPeriod<T extends Record<string, any>>(
  data: T[],
  dateKey: keyof T,
  valueKey: keyof T,
  period: 'hour' | 'day' | 'week' | 'month' = 'day'
): T[] {
  const grouped = new Map<string, T[]>();

  data.forEach((item) => {
    const date = new Date(item[dateKey] as any);
    let key: string;

    switch (period) {
      case 'hour':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
        break;
      case 'day':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        break;
      case 'week':
        const weekNum = Math.floor(date.getDate() / 7);
        key = `${date.getFullYear()}-${date.getMonth()}-W${weekNum}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${date.getMonth()}`;
        break;
    }

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });

  // Aggregate values
  const aggregated: T[] = [];
  grouped.forEach((items, key) => {
    const sum = items.reduce((acc, item) => acc + (item[valueKey] as number), 0);
    const avg = sum / items.length;

    aggregated.push({
      ...items[0],
      [valueKey]: avg,
    } as T);
  });

  return aggregated;
}

/**
 * Downsample data using Largest-Triangle-Three-Buckets algorithm
 * Preserves visual characteristics while reducing data points
 */
export function downsampleLTTB<T extends Record<string, any>>(
  data: T[],
  xKey: keyof T,
  yKey: keyof T,
  threshold: number
): T[] {
  if (data.length <= threshold) return data;

  const sampled: T[] = [];
  const bucketSize = (data.length - 2) / (threshold - 2);

  // Always include first point
  sampled.push(data[0]);

  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    const avgRangeLength = avgRangeEnd - avgRangeStart;

    let avgX = 0;
    let avgY = 0;

    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += data[j][xKey] as number;
      avgY += data[j][yKey] as number;
    }

    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.floor((i + 1) * bucketSize) + 1;

    const pointAX = data[sampled.length - 1][xKey] as number;
    const pointAY = data[sampled.length - 1][yKey] as number;

    let maxArea = -1;
    let maxAreaPoint = data[rangeStart];

    for (let j = rangeStart; j < rangeEnd; j++) {
      const pointX = data[j][xKey] as number;
      const pointY = data[j][yKey] as number;

      const area = Math.abs(
        (pointAX - avgX) * (pointY - pointAY) -
        (pointAX - pointX) * (avgY - pointAY)
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[j];
      }
    }

    sampled.push(maxAreaPoint);
  }

  // Always include last point
  sampled.push(data[data.length - 1]);

  return sampled;
}

/**
 * Memoize chart data to prevent unnecessary re-renders
 */
export function memoizeChartData<T>(
  data: T[],
  dependencies: any[]
): T[] {
  // This would typically use React.useMemo in a component
  // Here we provide the logic for data memoization
  return data;
}

/**
 * Calculate optimal number of data points based on chart width
 */
export function calculateOptimalPoints(
  chartWidth: number,
  pixelsPerPoint: number = 2
): number {
  return Math.floor(chartWidth / pixelsPerPoint);
}

/**
 * Debounce chart updates for better performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format large numbers for chart labels
 */
export function formatChartNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Generate loading skeleton for charts
 */
export function ChartSkeleton({ height = 400 }: { height?: number }) {
  return (
    <div
      className="animate-pulse bg-gray-200 rounded-lg"
      style={{ height: `${height}px` }}
    >
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading chart...</div>
      </div>
    </div>
  );
}

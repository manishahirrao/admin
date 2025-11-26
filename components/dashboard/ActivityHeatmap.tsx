'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface HeatmapDataPoint {
  hour: number;
  day: string;
  value: number;
}

interface ActivityHeatmapProps {
  data: HeatmapDataPoint[];
  loading?: boolean;
}

export function ActivityHeatmap({ data, loading = false }: ActivityHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 50, right: 30, bottom: 30, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique days and hours
    const days = Array.from(new Set(data.map(d => d.day)));
    const hours = Array.from(new Set(data.map(d => d.hour))).sort((a, b) => a - b);

    // Create scales
    const xScale = d3.scaleBand().domain(hours.map(String)).range([0, width]).padding(0.05);

    const yScale = d3.scaleBand().domain(days).range([0, height]).padding(0.05);

    const colorScale = d3
      .scaleSequential()
      .domain([0, d3.max(data, d => d.value) || 100])
      .interpolator(d3.interpolateOranges);

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'middle');

    // Add Y axis
    svg.append('g').call(d3.axisLeft(yScale));

    // Add cells
    svg
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(String(d.hour)) || 0)
      .attr('y', d => yScale(d.day) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .style('fill', d => colorScale(d.value))
      .style('stroke', 'white')
      .style('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).style('opacity', 0.8);
        
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'heatmap-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .html(`${d.day} ${d.hour}:00<br/>Activity: ${d.value}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 1);
        d3.selectAll('.heatmap-tooltip').remove();
      });

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('User Activity Heatmap');

  }, [data]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
        <div className="h-96 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="overflow-x-auto">
        {data.length > 0 ? (
          <svg ref={svgRef} className="mx-auto"></svg>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            No activity data available
          </div>
        )}
      </div>
    </div>
  );
}

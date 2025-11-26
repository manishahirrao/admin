'use client';

import React, { useRef, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: number;
  render?: (value: any, row: T) => React.ReactNode;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

export function VirtualTable<T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 60,
  onRowClick,
  loading = false,
}: VirtualTableProps<T>) {
  const listRef = useRef<List>(null);

  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const row = data[index];

      return (
        <div
          style={style}
          className={`
            flex items-center border-b border-gray-200 hover:bg-gray-50 transition-colors
            ${onRowClick ? 'cursor-pointer' : ''}
          `}
          onClick={() => onRowClick?.(row)}
        >
          {columns.map((column, colIndex) => {
            const value = row[column.key as keyof T];
            const content = column.render ? column.render(value, row) : value;

            return (
              <div
                key={colIndex}
                className="px-4 py-3 text-sm text-gray-900 overflow-hidden text-ellipsis"
                style={{
                  width: column.width || `${100 / columns.length}%`,
                  minWidth: column.width || 'auto',
                }}
              >
                {content}
              </div>
            );
          })}
        </div>
      );
    },
    [data, columns, onRowClick]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center bg-gray-50 border-b border-gray-200">
        {columns.map((column, index) => (
          <div
            key={index}
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            style={{
              width: column.width || `${100 / columns.length}%`,
              minWidth: column.width || 'auto',
            }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Virtual List */}
      <div style={{ height: 'calc(100vh - 300px)', minHeight: '400px' }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={listRef}
              height={height}
              itemCount={data.length}
              itemSize={rowHeight}
              width={width}
              overscanCount={5}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-700">
        Showing {data.length.toLocaleString()} rows
      </div>
    </div>
  );
}

/**
 * Virtual table with search and filter
 */
interface VirtualTableWithSearchProps<T> extends VirtualTableProps<T> {
  searchKeys?: (keyof T)[];
  onSearch?: (query: string) => void;
}

export function VirtualTableWithSearch<T extends Record<string, any>>({
  searchKeys = [],
  onSearch,
  ...props
}: VirtualTableWithSearchProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!searchQuery || searchKeys.length === 0) return props.data;

    return props.data.filter((row) =>
      searchKeys.some((key) => {
        const value = row[key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  }, [props.data, searchQuery, searchKeys]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Virtual Table */}
      <VirtualTable {...props} data={filteredData} />
    </div>
  );
}

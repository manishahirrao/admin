/**
 * Data Export Service
 * Handles exporting data to CSV and Excel formats
 */

interface ExportOptions {
  data: any[];
  columns: string[];
  filename: string;
  format: 'csv' | 'excel';
  filters?: Record<string, any>;
}

class ExportService {
  /**
   * Export data to CSV or Excel
   */
  async exportData(options: ExportOptions): Promise<void> {
    const { data, columns, filename, format, filters } = options;

    if (format === 'csv') {
      this.exportToCSV(data, columns, filename);
    } else if (format === 'excel') {
      await this.exportToExcel(data, columns, filename);
    }
  }

  /**
   * Export data to CSV format
   */
  private exportToCSV(data: any[], columns: string[], filename: string): void {
    // Create CSV header
    const header = columns.join(',');

    // Create CSV rows
    const rows = data.map(row => {
      return columns.map(col => {
        const value = this.getNestedValue(row, col);
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',');
    });

    // Combine header and rows
    const csv = [header, ...rows].join('\n');

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  /**
   * Export data to Excel format (using CSV with .xlsx extension for simplicity)
   * In production, use a library like xlsx or exceljs for proper Excel format
   */
  private async exportToExcel(data: any[], columns: string[], filename: string): Promise<void> {
    // For now, we'll use CSV format with .xlsx extension
    // In production, integrate a proper Excel library
    this.exportToCSV(data, columns, filename);
    
    // TODO: Implement proper Excel export using xlsx library
    // const workbook = XLSX.utils.book_new();
    // const worksheet = XLSX.utils.json_to_sheet(data);
    // XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    // const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    // const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    // this.downloadBlob(blob, `${filename}.xlsx`);
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Download blob as file
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export with progress tracking
   */
  async exportWithProgress(
    options: ExportOptions,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const { data, columns, filename, format } = options;
    const chunkSize = 1000;
    const totalChunks = Math.ceil(data.length / chunkSize);

    let processedData: any[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);
      const chunk = data.slice(start, end);
      
      processedData = [...processedData, ...chunk];

      if (onProgress) {
        const progress = ((i + 1) / totalChunks) * 100;
        onProgress(progress);
      }

      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    await this.exportData({
      data: processedData,
      columns,
      filename,
      format,
    });
  }

  /**
   * Generate filename with timestamp
   */
  generateFilename(prefix: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${prefix}_${timestamp}`;
  }

  /**
   * Validate export data
   */
  validateExportData(data: any[], columns: string[]): { valid: boolean; error?: string } {
    if (!data || data.length === 0) {
      return { valid: false, error: 'No data to export' };
    }

    if (!columns || columns.length === 0) {
      return { valid: false, error: 'No columns specified' };
    }

    if (data.length > 100000) {
      return { valid: false, error: 'Dataset too large. Please apply filters to reduce size.' };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const exportService = new ExportService();

/**
 * Export utilities for CSV and Excel files
 */

export interface ExportData {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: ExportData[], headers?: string[]): string {
  if (data.length === 0) return '';

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = csvHeaders.join(',');

  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];

      // Handle different value types
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma or newline
        const escaped = value.replace(/"/g, '""');
        return /[,\n"]/.test(value) ? `"${escaped}"` : escaped;
      }
      return String(value);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(data: ExportData[], filename: string, headers?: string[]): void {
  const csv = convertToCSV(data, headers);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for UTF-8
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Convert data to Excel format using HTML table
 * This creates a simple Excel-compatible file without needing external libraries
 */
export function downloadExcel(data: ExportData[], filename: string, headers?: string[]): void {
  if (data.length === 0) return;

  const excelHeaders = headers || Object.keys(data[0]);

  // Create HTML table
  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">';
  html += '<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
  html += '<x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>';
  html += '</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>';
  html += '<table border="1">';

  // Header row
  html += '<tr>';
  excelHeaders.forEach(header => {
    html += `<th>${escapeHTML(String(header))}</th>`;
  });
  html += '</tr>';

  // Data rows
  data.forEach(row => {
    html += '<tr>';
    excelHeaders.forEach(header => {
      const value = row[header];
      const displayValue = value === null || value === undefined ? '' : String(value);
      html += `<td>${escapeHTML(displayValue)}</td>`;
    });
    html += '</tr>';
  });

  html += '</table></body></html>';

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, filename.endsWith('.xls') ? filename : `${filename}.xls`);
}

/**
 * Helper function to download a blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Escape HTML special characters
 */
function escapeHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Format date for export
 */
export function formatDateForExport(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(amount: number): string {
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

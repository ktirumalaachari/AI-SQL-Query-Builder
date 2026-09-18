import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export function exportToCsv(filename: string, columns: string[], rows: any[][]) {
  const csvContent = [
    columns.join(','),
    ...rows.map(row =>
      row
        .map(val => {
          if (val === null || val === undefined) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(filename: string, columns: string[], rows: any[][]) {
  const data = rows.map(row => {
    const obj: Record<string, any> = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Query Results');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToPdf(filename: string, title: string, columns: string[], rows: any[][], explanation: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Document Title
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(title || 'SQL Query Result Report', 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Generated on ${new Date().toLocaleString()} | Total Records: ${rows.length}`, 14, 22);

  if (explanation) {
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const splitExplanation = doc.splitTextToSize(`AI Explanation: ${explanation}`, 270);
    doc.text(splitExplanation, 14, 28);
  }

  let startY = explanation ? 42 : 30;

  // Simple clean table rendering in PDF
  const colWidth = Math.max(25, Math.floor(270 / Math.max(1, columns.length)));

  // Table Headers
  doc.setFillColor(241, 245, 249);
  doc.rect(14, startY, 268, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  columns.forEach((col, idx) => {
    const x = 16 + idx * colWidth;
    if (x < 270) {
      doc.text(String(col).substring(0, 18), x, startY + 5.5);
    }
  });

  startY += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  // Render first 40 rows maximum for clean PDF export
  const displayRows = rows.slice(0, 45);
  displayRows.forEach((row, rowIdx) => {
    if (startY > 190) {
      doc.addPage();
      startY = 15;
    }

    if (rowIdx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, startY - 3.5, 268, 6, 'F');
    }

    columns.forEach((col, colIdx) => {
      const x = 16 + colIdx * colWidth;
      if (x < 270) {
        const val = row[colIdx] === null || row[colIdx] === undefined ? '-' : String(row[colIdx]);
        doc.text(val.substring(0, 20), x, startY);
      }
    });

    startY += 6;
  });

  if (rows.length > 45) {
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`... showing first 45 of ${rows.length} total rows`, 14, startY + 4);
  }

  doc.save(`${filename}.pdf`);
}

export type ExportRow = (string | number | null | undefined)[];

const sanitizeCell = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Escape double quotes and wrap cell in quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}`.concat('"');
};

export const exportToCsv = (
  filename: string,
  headers: string[],
  rows: ExportRow[],
) => {
  try {
    const headerLine = headers.map(sanitizeCell).join(',');
    const bodyLines = rows.map((r) => r.map(sanitizeCell).join(',')).join('\n');
    const csvContent = [headerLine, bodyLines].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (e) {
    // Silently fail; caller can also choose to show a toast
    // eslint-disable-next-line no-console
    console.error('Failed to export CSV', e);
  }
};

export const exportTableToPrintPdf = (
  title: string,
  headers: string[],
  rows: ExportRow[],
) => {
  try {
    const htmlRows = rows
      .map(
        (row) =>
          `<tr>${row
            .map((cell) => `<td style="padding: 4px 8px; border: 1px solid #e5e7eb; font-size: 12px;">${
              cell ?? ''
            }</td>`)
            .join('')}</tr>`,
      )
      .join('');

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; color: #111827; margin: 24px; }
      h1 { font-size: 18px; margin-bottom: 12px; }
      table { border-collapse: collapse; width: 100%; }
      th { text-align: left; padding: 6px 8px; border: 1px solid #e5e7eb; background: #f9fafb; font-size: 12px; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <table>
      <thead>
        <tr>${headers
          .map(
            (h) =>
              `<th>${h}</th>`,
          )
          .join('')}</tr>
      </thead>
      <tbody>
        ${htmlRows}
      </tbody>
    </table>
    <script>
      window.onload = function() { window.print(); };
    </script>
  </body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to export PDF', e);
  }
};

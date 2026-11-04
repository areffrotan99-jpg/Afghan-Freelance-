/* ------------------------------------------------------------------ */
/*  چاپ / PDF و خروجی اکسل                                            */
/* ------------------------------------------------------------------ */
export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function money(value: unknown): string {
  return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export interface PrintOptions {
  title: string;
  subtitle?: string;
  pharmacy?: string;
  address?: string;
  phone?: string;
  body: string;
  footer?: string;
  landscape?: boolean;
}

export function printDocument(opts: PrintOptions) {
  const html = `<!doctype html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8" />
<title>${esc(opts.title)}</title>
<style>
  @page { size: A4 ${opts.landscape ? 'landscape' : 'portrait'}; margin: 10mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Vazirmatn', Tahoma, 'Segoe UI', sans-serif; color: #0f172a; margin: 0; font-size: 12px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #047857; padding-bottom: 8px; margin-bottom: 12px; }
  .brand { font-size: 19px; font-weight: 800; color: #047857; }
  .sub { color: #475569; font-size: 11px; margin-top: 3px; }
  .title { text-align: center; font-size: 15px; font-weight: 700; margin: 10px 0 14px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  th, td { border: 1px solid #cbd5e1; padding: 5px 7px; text-align: right; font-size: 11px; }
  th { background: #f1f5f9; font-weight: 700; }
  tfoot td { font-weight: 700; background: #f8fafc; }
  .num { font-variant-numeric: tabular-nums; direction: ltr; text-align: left; unicode-bidi: embed; }
  .grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
  .box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; flex: 1 1 140px; }
  .box .k { color: #64748b; font-size: 10px; }
  .box .v { font-weight: 700; font-size: 13px; margin-top: 2px; }
  .muted { color: #64748b; }
  h3 { font-size: 13px; margin: 14px 0 6px; }
  .foot { margin-top: 16px; border-top: 1px dashed #cbd5e1; padding-top: 8px; color: #64748b; font-size: 10px; display: flex; justify-content: space-between; }
  .sign { margin-top: 26px; display: flex; justify-content: space-between; font-size: 11px; color: #334155; }
</style></head><body>
  <div class="head">
    <div>
      <div class="brand">${esc(opts.pharmacy || 'فروتن درملتون')}</div>
      <div class="sub">سیستم حسابداری داروخانه</div>
      ${opts.address ? `<div class="sub">${esc(opts.address)}</div>` : ''}
      ${opts.phone ? `<div class="sub">تلفون: ${esc(opts.phone)}</div>` : ''}
    </div>
    <div style="text-align:left">
      <div class="sub">تاریخ چاپ: ${new Date().toLocaleDateString('fa-AF')}</div>
      ${opts.subtitle ? `<div class="sub">${esc(opts.subtitle)}</div>` : ''}
    </div>
  </div>
  <div class="title">${esc(opts.title)}</div>
  ${opts.body}
  ${opts.footer ? `<div class="foot"><span>${esc(opts.footer)}</span><span>مهر و امضا: ....................</span></div>` : ''}
</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.left = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  const win = iframe.contentWindow;
  if (!win) {
    iframe.remove();
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  window.setTimeout(() => {
    try {
      win.focus();
      win.print();
    } finally {
      window.setTimeout(() => iframe.remove(), 1500);
    }
  }, 350);
}

/* ------------------------------ اکسل ------------------------------ */
function xml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function exportExcel(
  filename: string,
  sheetName: string,
  columns: string[],
  rows: (string | number | null | undefined)[][],
  title?: string,
) {
  const header = columns.map((c) => `<Cell ss:StyleID="h"><Data ss:Type="String">${xml(c)}</Data></Cell>`).join('');
  const body = rows
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => {
            if (typeof cell === 'number' && Number.isFinite(cell)) {
              return `<Cell><Data ss:Type="Number">${cell}</Data></Cell>`;
            }
            return `<Cell><Data ss:Type="String">${xml(cell ?? '')}</Data></Cell>`;
          })
          .join('')}</Row>`,
    )
    .join('');

  const titleRow = title
    ? `<Row><Cell ss:MergeAcross="${Math.max(0, columns.length - 1)}" ss:StyleID="t"><Data ss:Type="String">${xml(title)}</Data></Cell></Row>`
    : '';

  const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="h"><Font ss:Bold="1"/><Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/></Style>
  <Style ss:ID="t"><Font ss:Bold="1" ss:Size="14"/></Style>
 </Styles>
 <Worksheet ss:Name="${xml(sheetName).slice(0, 28)}">
  <Table ss:DefaultRowHeight="18">
   ${titleRow}
   <Row>${header}</Row>
   ${body}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><DisplayRightToLeft/></WorksheetOptions>
 </Worksheet>
</Workbook>`;

  downloadFile(filename.endsWith('.xls') ? filename : `${filename}.xls`, workbook, 'application/vnd.ms-excel;charset=utf-8');
}

export function downloadFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadJson(filename: string, data: unknown) {
  downloadFile(filename, JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
}

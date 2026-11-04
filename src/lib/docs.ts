import { esc, money, printDocument } from './print';
import { formatDateLong, formatDate } from './format';
import type { JournalEntry, Sale, Purchase, Statement, Settings } from '../types';

const head = (settings: Settings) => ({
  pharmacy: settings.pharmacyName,
  address: settings.address,
  phone: settings.phone,
  footer: settings.footerNote,
});

function itemsTable(items: { name: string; qty: number; unitPrice: number }[]) {
  const rows = items
    .map(
      (item, index) =>
        `<tr><td>${index + 1}</td><td>${esc(item.name)}</td><td class="num">${money(item.qty)}</td><td class="num">${money(
          item.unitPrice,
        )}</td><td class="num">${money(item.qty * item.unitPrice)}</td></tr>`,
    )
    .join('');
  return `<table>
    <thead><tr><th style="width:34px">#</th><th>نام کالا</th><th style="width:70px">تعداد</th><th style="width:100px">قیمت واحد</th><th style="width:110px">مجموع</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function printSaleInvoice(sale: Sale, settings: Settings) {
  const body = `
  <div class="grid">
    <div class="box"><div class="k">شماره فاکتور</div><div class="v">${esc(sale.no)}</div></div>
    <div class="box"><div class="k">تاریخ</div><div class="v">${esc(formatDateLong(sale.date))}</div></div>
    <div class="box"><div class="k">مشتری</div><div class="v">${esc(sale.customerName)}</div></div>
    <div class="box"><div class="k">نوع فروش</div><div class="v">${sale.credit > 0 ? 'نسیه' : 'نقدی'}</div></div>
  </div>
  ${itemsTable(sale.items)}
  <table>
    <tbody>
      <tr><td>مجموع اقلام</td><td class="num">${money(sale.itemsTotal)}</td></tr>
      <tr><td>تخفیف</td><td class="num">${money(sale.discount)}</td></tr>
      <tr><td><b>مبلغ قابل پرداخت</b></td><td class="num"><b>${money(sale.netTotal)}</b></td></tr>
      <tr><td>پرداخت شده</td><td class="num">${money(sale.paid)}</td></tr>
      <tr><td>باقی (نسیه)</td><td class="num">${money(sale.credit)}</td></tr>
    </tbody>
  </table>
  ${sale.note ? `<p class="muted">یادداشت: ${esc(sale.note)}</p>` : ''}
  <div class="sign"><span>امضای فروشنده: ....................</span><span>امضای مشتری: ....................</span></div>`;

  printDocument({ ...head(settings), title: 'فاکتور فروش', subtitle: `فاکتور ${sale.no}`, body });
}

export function printPurchaseInvoice(purchase: Purchase, settings: Settings) {
  const body = `
  <div class="grid">
    <div class="box"><div class="k">شماره فاکتور</div><div class="v">${esc(purchase.no)}</div></div>
    <div class="box"><div class="k">تاریخ</div><div class="v">${esc(formatDateLong(purchase.date))}</div></div>
    <div class="box"><div class="k">شرکت</div><div class="v">${esc(purchase.companyName)}</div></div>
    <div class="box"><div class="k">نوع خرید</div><div class="v">${purchase.credit > 0 ? 'نسیه' : 'نقدی'}</div></div>
  </div>
  ${itemsTable(purchase.items)}
  <table>
    <tbody>
      <tr><td>مجموع اقلام</td><td class="num">${money(purchase.itemsTotal)}</td></tr>
      <tr><td>تخفیف</td><td class="num">${money(purchase.discount)}</td></tr>
      <tr><td><b>مبلغ کل خرید</b></td><td class="num"><b>${money(purchase.netTotal)}</b></td></tr>
      <tr><td>پرداخت شده</td><td class="num">${money(purchase.paid)}</td></tr>
      <tr><td>باقی (بدهی به شرکت)</td><td class="num">${money(purchase.credit)}</td></tr>
    </tbody>
  </table>
  ${purchase.note ? `<p class="muted">یادداشت: ${esc(purchase.note)}</p>` : ''}`;

  printDocument({ ...head(settings), title: 'فاکتور خرید', subtitle: `فاکتور ${purchase.no}`, body });
}

export function printPartyStatement(statement: Statement, settings: Settings) {
  const isCustomer = statement.party.type === 'customer';
  const rows = statement.rows
    .map(
      (row) =>
        `<tr><td class="num">${esc(row.no)}</td><td class="num">${esc(formatDate(row.date))}</td><td>${esc(
          row.description,
        )}</td><td class="num">${money(row.charge)}</td><td class="num">${money(row.payment)}</td><td class="num">${money(
          row.balance,
        )}</td></tr>`,
    )
    .join('');
  const body = `
  <div class="grid">
    <div class="box"><div class="k">${isCustomer ? 'مشتری' : 'شرکت'}</div><div class="v">${esc(statement.party.name)}</div></div>
    <div class="box"><div class="k">باقی قبلی</div><div class="v num">${money(statement.opening)}</div></div>
    <div class="box"><div class="k">باقی فعلی</div><div class="v num">${money(statement.closing)}</div></div>
  </div>
  <table>
    <thead><tr><th style="width:60px">شماره</th><th style="width:80px">تاریخ</th><th>شرح</th><th style="width:90px">${isCustomer ? 'قرض' : 'خرید'}</th><th style="width:90px">${isCustomer ? 'پرداخت' : 'پرداخت'}</th><th style="width:95px">باقی</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6" class="muted">حرکتی ثبت نشده است</td></tr>'}</tbody>
  </table>`;

  printDocument({ ...head(settings), title: 'صورت‌حساب', subtitle: statement.party.name, body });
}

export function printVoucher(entry: JournalEntry, settings: Settings) {
  const rows = entry.lines
    .map(
      (line) =>
        `<tr><td>${esc(line.account)}</td><td>${esc(line.note || '')}</td><td class="num">${money(line.debit)}</td><td class="num">${money(
          line.credit,
        )}</td></tr>`,
    )
    .join('');
  const body = `
  <div class="grid">
    <div class="box"><div class="k">شماره سند</div><div class="v">${entry.no}</div></div>
    <div class="box"><div class="k">تاریخ</div><div class="v">${esc(formatDateLong(entry.date))}</div></div>
    <div class="box"><div class="k">مبلغ</div><div class="v num">${money(entry.amount)}</div></div>
  </div>
  <p><b>شرح:</b> ${esc(entry.description)}</p>
  <table>
    <thead><tr><th style="width:90px">کد حساب</th><th>تفصیل</th><th style="width:110px">بدهکار</th><th style="width:110px">بستانکار</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="2">مجموع</td><td class="num">${money(entry.debitTotal ?? entry.amount)}</td><td class="num">${money(
      entry.creditTotal ?? entry.amount,
    )}</td></tr></tfoot>
  </table>
  <div class="sign"><span>تهیه‌کننده: ${esc(entry.createdBy)}</span><span>امضا: ....................</span></div>`;

  printDocument({ ...head(settings), title: 'سند حسابداری', subtitle: `سند شماره ${entry.no}`, body });
}

export function printGenericReport(
  settings: Settings,
  title: string,
  subtitle: string,
  sections: { heading?: string; columns: string[]; rows: (string | number)[][]; footer?: (string | number)[] }[],
) {
  const body = sections
    .map((section) => {
      const header = section.columns.map((c) => `<th>${esc(c)}</th>`).join('');
      const rows = section.rows
        .map(
          (row) =>
            `<tr>${row
              .map((cell) => `<td class="${typeof cell === 'number' ? 'num' : ''}">${typeof cell === 'number' ? money(cell) : esc(cell)}</td>`)
              .join('')}</tr>`,
        )
        .join('');
      const footer = section.footer
        ? `<tfoot><tr>${section.footer
            .map((cell) => `<td class="${typeof cell === 'number' ? 'num' : ''}">${typeof cell === 'number' ? money(cell) : esc(cell)}</td>`)
            .join('')}</tr></tfoot>`
        : '';
      return `${section.heading ? `<h3>${esc(section.heading)}</h3>` : ''}<table><thead><tr>${header}</tr></thead><tbody>${
        rows || `<tr><td colspan="${section.columns.length}" class="muted">داده‌ای موجود نیست</td></tr>`
      }</tbody>${footer}</table>`;
    })
    .join('');
  printDocument({ ...head(settings), title, subtitle, body });
}

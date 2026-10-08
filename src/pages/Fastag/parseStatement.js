// Reads a FASTag statement (Excel/CSV) into rows for the bulk upload API.

// Header aliases seen in bank FASTag statements (matched after stripping
// everything except letters/digits, so "Txn. Date & Time" → "txndatetime").
const COL_ALIASES = {
  vehicle_no: ['vehicleno', 'vehiclenumber', 'vehicle', 'truckno', 'trucknumber', 'vrn', 'vehicleregno', 'vehicleregistrationnumber', 'vehicleregistrationno', 'registrationnumber', 'registrationno', 'regno', 'plateno', 'platenumber', 'licenseplate'],
  tag_id: ['tagid', 'fastagid', 'fastag', 'fastagno', 'fastagnumber', 'tagno', 'tagnumber', 'tag', 'tagserialno'],
  date: ['date', 'transactiondate', 'txndate', 'transactiondatetime', 'transactiondateandtime', 'txndatetime', 'datetime', 'readerreadtime', 'readerdatetime', 'tolldate', 'traveldate', 'processingdate', 'processeddate', 'transactiontime'],
  amount: ['amount', 'debit', 'debitamount', 'dramount', 'tollamount', 'transactionamount', 'txnamount', 'amountrs', 'amountinr', 'amountinrs', 'debitrs', 'withdrawal', 'withdrawalamount'],
  credit: ['credit', 'creditamount', 'cramount', 'creditrs', 'deposit', 'rechargeamount'],
  type: ['transactiontype', 'txntype', 'type', 'drcr', 'crdr', 'debitcredit'],
  toll_plaza: ['tollplaza', 'tollplazaname', 'plazaname', 'plaza', 'tollname', 'tollbooth', 'location'],
  transaction_id: ['transactionid', 'txnid', 'transactionno', 'transactionnumber', 'txnno', 'referenceno', 'referencenumber', 'refno', 'rrn', 'transactionreference', 'transactionrefno', 'uniquetransactionid', 'txnrefno', 'seqno'],
  description: ['description', 'narration', 'remarks', 'remark', 'particulars', 'details', 'notes'],
};
const HEADER_LOOKUP = Object.fromEntries(
  Object.entries(COL_ALIASES).flatMap(([key, aliases]) => aliases.map(alias => [alias, key]))
);
const headerKey = (h) => String(h ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
const pad = (n) => String(n).padStart(2, '0');
const isoDate = (y, m, d) => {
  const year = y < 100 ? 2000 + y : y;
  const dt = new Date(year, m - 1, d);
  if (dt.getFullYear() !== year || dt.getMonth() !== m - 1 || dt.getDate() !== d) return '';
  return `${year}-${pad(m)}-${pad(d)}`;
};

// Excel serial dates and the text formats Indian bank statements use
// (DD-MM-YYYY, DD/MM/YYYY, DD-Mon-YYYY, YYYY-MM-DD, each optionally with a time).
function parseDate(XLSX, value) {
  if (value === '' || value === null || value === undefined) return '';
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    return parsed ? isoDate(parsed.y, parsed.m, parsed.d) : '';
  }
  const text = String(value).trim();
  let m = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return isoDate(+m[1], +m[2], +m[3]);
  m = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (m) return isoDate(+m[3], +m[2], +m[1]);
  m = text.match(/^(\d{1,2})[-/. ]([A-Za-z]{3,4})[A-Za-z]*[-/., ]+(\d{2,4})/);
  if (m && MONTHS[m[2].toLowerCase()]) return isoDate(+m[3], MONTHS[m[2].toLowerCase()], +m[1]);
  return '';
}

const parseAmount = (value) => {
  if (value === '' || value === null || value === undefined) return NaN;
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  return cleaned ? Number(cleaned) : NaN;
};

export function parseWorkbook(XLSX, workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });
  // Displayed text, so long numeric ids (transaction / tag ids) keep every digit.
  const text = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });

  // Statements often have a few title/summary rows before the real header.
  let headerIndex = -1;
  let columnMap = {};
  for (let i = 0; i < Math.min(raw.length, 25); i += 1) {
    const map = {};
    raw[i].forEach((cell, col) => {
      const key = HEADER_LOOKUP[headerKey(cell)];
      if (key && map[key] === undefined) map[key] = col;
    });
    const keys = Object.keys(map);
    if ((keys.includes('vehicle_no') || keys.includes('tag_id')) && keys.includes('amount')) {
      headerIndex = i;
      columnMap = map;
      break;
    }
  }
  if (headerIndex === -1) {
    throw new Error('Could not find the header row. The file needs a "Vehicle Number" or "Tag ID" column and an "Amount" column.');
  }
  if (columnMap.date === undefined) {
    throw new Error('Could not find a "Transaction Date" column.');
  }

  const get = (row, key) => (columnMap[key] === undefined ? '' : row[columnMap[key]]);
  const getText = (rowIndex, key) => (columnMap[key] === undefined ? '' : String(text[rowIndex]?.[columnMap[key]] ?? '').trim());
  const rows = [];
  let skippedCredits = 0;

  raw.slice(headerIndex + 1).forEach((row, index) => {
    const rowIndex = headerIndex + 1 + index;
    if (!row.some(cell => String(cell).trim() !== '')) return;

    const type = String(get(row, 'type')).trim().toLowerCase();
    let amount = parseAmount(get(row, 'amount'));
    const credit = parseAmount(get(row, 'credit'));
    const isCreditType = /^(cr|credit)$|recharge|top ?up|refund|reversal/.test(type);

    // Recharges / refunds are not truck expenses — only deductions are recorded.
    if (isCreditType || (!(Math.abs(amount) > 0) && credit > 0)) {
      skippedCredits += 1;
      return;
    }
    if (Number.isFinite(amount)) amount = Math.abs(amount);

    rows.push({
      row_no: headerIndex + index + 2,
      vehicle_no: getText(rowIndex, 'vehicle_no'),
      tag_id: getText(rowIndex, 'tag_id'),
      date: parseDate(XLSX, get(row, 'date')) || String(get(row, 'date')).trim(),
      amount: Number.isFinite(amount) ? amount : '',
      toll_plaza: getText(rowIndex, 'toll_plaza'),
      transaction_id: getText(rowIndex, 'transaction_id'),
      description: getText(rowIndex, 'description'),
    });
  });

  return { rows, skippedCredits, detectedColumns: Object.keys(columnMap) };
}

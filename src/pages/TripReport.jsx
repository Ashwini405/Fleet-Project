import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const TRIP = {
  id: 'TRIP-1001',
  status: 'In Transit',
  route: {
    truckNo: 'AP-21-TA-1234', driver: 'Ramesh Kumar', driverPhone: '+91 98765 43210',
    source: 'Nandyala Cement Works', destination: 'Mumbai',
    distance: '850 KM', startOdometer: '85,420',
  },
  supervisor: { name: 'P. Sharma', balance: 60000 },
  time: { startTime: '2025-11-28T06:30', eta: '2025-11-30T14:00', actualEnd: null },
  load: {
    materialType: 'Cement (OPC 53)', loadWeight: '22 Tons',
    customerName: 'Shree Constructions Pvt. Ltd.', invoiceNo: 'INV-2025-4821',
  },
  financials: { totalAdvance: 15000, dieselCost: 28950, otherExpenses: 4200 },
  expenses: [
    { id: 1, type: 'Toll',        amount: 1800, note: 'NH-44 Toll Plaza' },
    { id: 2, type: 'Maintenance', amount: 1200, note: 'Tyre puncture repair' },
    { id: 3, type: 'Misc',        amount: 1200, note: 'Driver food & lodging' },
  ],
  documents: [
    { name: 'Invoice',        file: 'invoice_4821.pdf', uploaded: true },
    { name: 'E-Way Bill',     file: 'eway_4821.pdf',   uploaded: true },
    { name: 'Delivery Proof', file: null,               uploaded: false },
  ],
  alerts: [
    'Trip is running 2 hrs behind schedule.',
    'Supervisor balance below ₹10,000 threshold.',
  ],
  tracking: { progressPct: 62 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (dt) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};
const INR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const calcDelay = (eta, actual) => {
  const end = actual ? new Date(actual) : new Date();
  const diff = Math.round((end - new Date(eta)) / 60000);
  if (diff <= 0) return { label: 'On Time', delayed: false };
  const h = Math.floor(diff / 60), m = diff % 60;
  return { label: `+${h}h ${m}m delay`, delayed: true };
};

// ─── Print Styles ─────────────────────────────────────────────────────────────
const CSS = `
  .rpt * { box-sizing: border-box; }
  .rpt {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 13px;
    color: #111;
    background: #fff;
    max-width: 800px;
    margin: 0 auto;
    padding: 32px 28px;
    line-height: 1.5;
  }

  /* ── Header ── */
  .rpt-hd {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 14px;
    margin-bottom: 6px;
    border-bottom: 3px solid #1e3a5f;
  }
  .rpt-hd-brand { display: flex; align-items: center; gap: 10px; }
  .rpt-hd-brand .logo {
    width: 40px; height: 40px; background: #1e3a5f; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; color: #fff;
  }
  .rpt-hd-brand h1 { font-size: 18px; font-weight: 800; color: #1e3a5f; margin: 0; }
  .rpt-hd-brand p  { font-size: 11px; color: #666; margin: 2px 0 0; }
  .rpt-hd-meta { text-align: right; font-size: 12px; color: #444; line-height: 1.8; }
  .rpt-hd-meta strong { color: #1e3a5f; }

  /* ── Meta strip ── */
  .rpt-strip {
    display: flex;
    gap: 0;
    background: #f0f5ff;
    border: 1px solid #c8d8ea;
    border-radius: 6px;
    margin-bottom: 20px;
    overflow: hidden;
  }
  .rpt-strip-item {
    flex: 1;
    padding: 8px 14px;
    border-right: 1px solid #c8d8ea;
    font-size: 12px;
  }
  .rpt-strip-item:last-child { border-right: none; }
  .rpt-strip-item .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; color: #666; }
  .rpt-strip-item .val { font-weight: 700; color: #1e3a5f; margin-top: 1px; }

  /* ── Section ── */
  .rpt-sec { margin-bottom: 18px; page-break-inside: avoid; }
  .rpt-sec-title {
    font-size: 10.5px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.9px; color: #1e3a5f;
    border-bottom: 1.5px solid #c8d8ea;
    padding-bottom: 5px; margin-bottom: 10px;
  }

  /* ── 2-col grid ── */
  .rpt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

  /* ── Info table ── */
  .rpt-tbl { width: 100%; border-collapse: collapse; }
  .rpt-tbl td { padding: 5px 8px; font-size: 13px; vertical-align: top; }
  .rpt-tbl td:first-child { color: #555; font-weight: 500; width: 46%; }
  .rpt-tbl td:last-child  { font-weight: 600; color: #111; }
  .rpt-tbl tr:nth-child(even) td { background: #f7f9fc; }

  /* ── Progress bar ── */
  .rpt-prog-wrap { background: #e2e8f0; border-radius: 3px; height: 7px; margin: 8px 0 3px; }
  .rpt-prog-bar  { background: #1e3a5f; height: 7px; border-radius: 3px; }
  .rpt-prog-labels { display: flex; justify-content: space-between; font-size: 10px; color: #888; }

  /* ── Alerts ── */
  .rpt-alert {
    background: #fffbeb; border-left: 3px solid #f59e0b;
    padding: 5px 10px; font-size: 12px; color: #78350f; margin-top: 6px;
  }

  /* ── Financial box ── */
  .rpt-fin {
    background: #f0f5ff; border: 1px solid #c0d0f0;
    border-radius: 5px; padding: 12px 16px;
  }
  .fin-row {
    display: flex; justify-content: space-between;
    padding: 5px 0; font-size: 13px;
    border-bottom: 1px solid #dde8f8;
  }
  .fin-row:last-of-type { border-bottom: none; }
  .fin-row span:first-child { color: #444; }
  .fin-row span:last-child  { font-weight: 600; }
  .fin-total {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 10px; padding-top: 10px; border-top: 2px solid #1e3a5f;
  }
  .fin-total span:first-child { font-size: 13px; font-weight: 700; color: #1e3a5f; }
  .fin-total span:last-child  { font-size: 17px; font-weight: 800; color: #1e3a5f; }
  .fin-note { font-size: 12px; color: #555; margin-top: 7px; }

  /* ── Expenses table ── */
  .rpt-exp { width: 100%; border-collapse: collapse; font-size: 13px; }
  .rpt-exp th {
    background: #1e3a5f; color: #fff; padding: 7px 10px;
    text-align: left; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .rpt-exp td { padding: 6px 10px; border-bottom: 1px solid #e8eef5; }
  .rpt-exp tr:last-child td { border-bottom: none; }
  .rpt-exp tr:nth-child(even) td { background: #f7f9fc; }
  .rpt-exp .amt { text-align: right; font-weight: 600; }
  .rpt-exp tfoot td {
    font-weight: 700; background: #eef3fb;
    border-top: 2px solid #1e3a5f; padding: 7px 10px;
  }

  /* ── Documents ── */
  .rpt-doc-list { list-style: none; padding: 0; margin: 0; }
  .rpt-doc-list li {
    display: flex; align-items: center; gap: 10px;
    padding: 6px 0; border-bottom: 1px solid #eee; font-size: 13px;
  }
  .rpt-doc-list li:last-child { border-bottom: none; }
  .doc-badge {
    font-size: 10px; font-weight: 700; padding: 2px 7px;
    border-radius: 3px; white-space: nowrap;
  }
  .doc-badge.up  { background: #d4edda; color: #155724; }
  .doc-badge.pnd { background: #fff3cd; color: #856404; }
  .doc-name { font-weight: 600; }
  .doc-file { color: #666; font-size: 12px; }

  /* ── Delay ── */
  .delayed { color: #c0392b; font-weight: 700; }
  .on-time  { color: #1a7a4a; font-weight: 700; }

  /* ── Status badge ── */
  .sbadge {
    display: inline-block; padding: 2px 8px; border-radius: 3px;
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .s-transit   { background: #dbeafe; color: #1d4ed8; }
  .s-completed { background: #dcfce7; color: #166534; }
  .s-planned   { background: #f1f5f9; color: #475569; }

  /* ── Signature ── */
  .rpt-sign { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 28px; margin-top: 40px; }
  .rpt-sign-box {
    border-top: 1px solid #333; padding-top: 6px;
    font-size: 11px; color: #555; text-align: center;
  }

  /* ── Footer ── */
  .rpt-footer {
    margin-top: 28px; padding-top: 10px; border-top: 1px solid #ddd;
    display: flex; justify-content: space-between; font-size: 11px; color: #999;
  }

  /* ── Toolbar (screen only) ── */
  .rpt-toolbar {
    position: sticky; top: 0; z-index: 50;
    background: #1e3a5f; padding: 10px 24px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .rpt-toolbar .tb-left  { display: flex; align-items: center; gap: 12px; }
  .rpt-toolbar .tb-right { display: flex; align-items: center; gap: 16px; }
  .tb-btn {
    border: none; border-radius: 6px; cursor: pointer;
    padding: 7px 16px; font-size: 13px; font-weight: 600;
  }
  .tb-btn-back  { background: rgba(255,255,255,0.15); color: #fff; }
  .tb-btn-print { background: #2563eb; color: #fff; }
  .tb-label { display: flex; align-items: center; gap: 6px; color: #cbd5e1; font-size: 13px; cursor: pointer; }
  .tb-label input { accent-color: #60a5fa; width: 15px; height: 15px; }
  .tb-trip-id { color: #93c5fd; font-size: 13px; }
  .tb-trip-id strong { color: #fff; }

  @media print {
    .no-print { display: none !important; }
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .rpt { padding: 0; max-width: 100%; }
    @page { margin: 16mm 14mm; size: A4; }
  }
`;

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Sec({ title, children }) {
  return (
    <div className="rpt-sec">
      <div className="rpt-sec-title">{title}</div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TripReport() {
  const navigate = useNavigate();
  const trip = TRIP;
  const [includeDocs, setIncludeDocs] = useState(true);

  const delay      = calcDelay(trip.time.eta, trip.time.actualEnd);
  const grandTotal = trip.financials.totalAdvance + trip.financials.dieselCost + trip.financials.otherExpenses;
  const expTotal   = trip.expenses.reduce((s, e) => s + e.amount, 0);
  const printedAt  = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const statusClass = { 'In Transit': 's-transit', 'Completed': 's-completed', 'Planned': 's-planned' }[trip.status] || 's-planned';
  const hasDocs = trip.documents.length > 0;

  return (
    <>
      <style>{CSS}</style>

      {/* ── Screen Toolbar ── */}
      <div className="rpt-toolbar no-print">
        <div className="tb-left">
          <button className="tb-btn tb-btn-back" onClick={() => navigate(-1)}>← Back</button>
          <span className="tb-trip-id">
            Trip Report — <strong>{trip.id}</strong>
          </span>
        </div>
        <div className="tb-right">
          <label className="tb-label">
            <input
              type="checkbox"
              checked={includeDocs}
              onChange={e => setIncludeDocs(e.target.checked)}
            />
            Include Documents in PDF
          </label>
          <button className="tb-btn tb-btn-print" onClick={() => window.print()}>
            🖨 Print / Save PDF
          </button>
        </div>
      </div>

      {/* ── Report Body ── */}
      <div className="rpt">

        {/* 1. HEADER */}
        <div className="rpt-hd">
          <div className="rpt-hd-brand">
            <div className="logo">🚛</div>
            <div>
              <h1>Fleet Management System</h1>
              <p>Official Trip Report &nbsp;·&nbsp; Confidential</p>
            </div>
          </div>
          <div className="rpt-hd-meta">
            <div><strong>Trip ID:</strong> {trip.id}</div>
            <div><strong>Status:</strong> <span className={`sbadge ${statusClass}`}>{trip.status}</span></div>
            <div><strong>Printed:</strong> {printedAt}</div>
          </div>
        </div>

        {/* Meta strip */}
        <div className="rpt-strip">
          {[
            { lbl: 'Truck No',   val: trip.route.truckNo },
            { lbl: 'Driver',     val: trip.route.driver },
            { lbl: 'Route',      val: `${trip.route.source} → ${trip.route.destination}` },
            { lbl: 'Supervisor', val: trip.supervisor.name },
          ].map(({ lbl, val }) => (
            <div key={lbl} className="rpt-strip-item">
              <div className="lbl">{lbl}</div>
              <div className="val">{val}</div>
            </div>
          ))}
        </div>

        {/* 2 & 3. ROUTE + TIME — side by side */}
        <div className="rpt-grid">
          <Sec title="Route & Overview">
            <table className="rpt-tbl">
              <tbody>
                <tr><td>Truck No</td>       <td>{trip.route.truckNo}</td></tr>
                <tr><td>Driver</td>         <td>{trip.route.driver}</td></tr>
                <tr><td>Contact</td>        <td>{trip.route.driverPhone}</td></tr>
                <tr><td>Source</td>         <td>{trip.route.source}</td></tr>
                <tr><td>Destination</td>    <td>{trip.route.destination}</td></tr>
                <tr><td>Distance</td>       <td>{trip.route.distance}</td></tr>
                <tr><td>Start Odometer</td> <td>{trip.route.startOdometer} km</td></tr>
                <tr><td>Supervisor</td>     <td>{trip.supervisor.name}</td></tr>
              </tbody>
            </table>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555' }}>
                <span>Trip Progress</span>
                <span style={{ fontWeight: 700 }}>{trip.tracking.progressPct}%</span>
              </div>
              <div className="rpt-prog-wrap">
                <div className="rpt-prog-bar" style={{ width: `${trip.tracking.progressPct}%` }} />
              </div>
              <div className="rpt-prog-labels">
                <span>{trip.route.source}</span>
                <span>{trip.route.destination}</span>
              </div>
            </div>
          </Sec>

          <Sec title="Time Tracking">
            <table className="rpt-tbl">
              <tbody>
                <tr><td>Start Time</td>            <td>{fmt(trip.time.startTime)}</td></tr>
                <tr><td>Expected Arrival (ETA)</td> <td>{fmt(trip.time.eta)}</td></tr>
                <tr><td>Actual End Time</td>        <td>{fmt(trip.time.actualEnd)}</td></tr>
                <tr>
                  <td>Delay Status</td>
                  <td className={delay.delayed ? 'delayed' : 'on-time'}>{delay.label}</td>
                </tr>
              </tbody>
            </table>
            {trip.alerts.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  Active Alerts
                </div>
                {trip.alerts.map((a, i) => (
                  <div key={i} className="rpt-alert">⚠ {a}</div>
                ))}
              </div>
            )}
          </Sec>
        </div>

        {/* 4. LOAD DETAILS */}
        <Sec title="Load Details">
          <div className="rpt-grid">
            <table className="rpt-tbl">
              <tbody>
                <tr><td>Material Type</td> <td>{trip.load.materialType}</td></tr>
                <tr><td>Load Weight</td>   <td>{trip.load.loadWeight}</td></tr>
              </tbody>
            </table>
            <table className="rpt-tbl">
              <tbody>
                <tr><td>Customer Name</td>   <td>{trip.load.customerName}</td></tr>
                <tr><td>Invoice Number</td>  <td>{trip.load.invoiceNo}</td></tr>
              </tbody>
            </table>
          </div>
        </Sec>

        {/* 5. FINANCIAL SUMMARY */}
        <Sec title="Financial Summary">
          <div className="rpt-fin">
            {[
              { label: 'Total Advance',  val: trip.financials.totalAdvance },
              { label: 'Diesel Cost',    val: trip.financials.dieselCost },
              { label: 'Other Expenses', val: trip.financials.otherExpenses },
            ].map(r => (
              <div key={r.label} className="fin-row">
                <span>{r.label}</span>
                <span>{INR(r.val)}</span>
              </div>
            ))}
            <div className="fin-total">
              <span>Grand Total Cost</span>
              <span>{INR(grandTotal)}</span>
            </div>
          </div>
          <div className="fin-note">
            Supervisor: <strong>{trip.supervisor.name}</strong> &nbsp;·&nbsp;
            Available Balance: <strong>{INR(trip.supervisor.balance)}</strong>
          </div>
        </Sec>

        {/* 6. EXPENSES */}
        <Sec title="Expense Breakdown">
          <table className="rpt-exp">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Type</th>
                <th>Description</th>
                <th style={{ textAlign: 'right', width: '18%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {trip.expenses.map(e => (
                <tr key={e.id}>
                  <td>{e.type}</td>
                  <td>{e.note}</td>
                  <td className="amt">{INR(e.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>Total Expenses</td>
                <td className="amt">{INR(expTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </Sec>

        {/* 7. DOCUMENTS */}
        {includeDocs && hasDocs && (
          <Sec title="Documents">
            <ul className="rpt-doc-list">
              {trip.documents.map((doc, i) => (
                <li key={i}>
                  <span className={`doc-badge ${doc.uploaded ? 'up' : 'pnd'}`}>
                    {doc.uploaded ? 'Uploaded' : 'Pending'}
                  </span>
                  <span className="doc-name">{doc.name}</span>
                  {doc.file && <span className="doc-file">— {doc.file}</span>}
                </li>
              ))}
            </ul>
          </Sec>
        )}

        {/* Signature Row */}
        <div className="rpt-sign">
          <div className="rpt-sign-box">Driver Signature</div>
          <div className="rpt-sign-box">Supervisor Signature</div>
          <div className="rpt-sign-box">Authorized By</div>
        </div>

        {/* Footer */}
        <div className="rpt-footer">
          <span>Fleet Management System — Confidential Document</span>
          <span>Generated: {printedAt}</span>
        </div>

      </div>
    </>
  );
}

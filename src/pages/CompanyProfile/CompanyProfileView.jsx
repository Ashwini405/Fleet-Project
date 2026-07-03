import React from 'react';
import {
  Shield, Phone, Mail, Globe, MapPin, IndianRupee,
  FileText, CheckCircle2, Palette, Truck, X, Check,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — InfoCard / InfoRow / PreviewSection / PreviewRow
// ─────────────────────────────────────────────────────────────────────────────

const ICON_COLORS = {
  blue:   'bg-blue-50 text-blue-600',
  green:  'bg-green-50 text-green-600',
  red:    'bg-red-50 text-red-600',
  amber:  'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
  slate:  'bg-slate-100 text-slate-500',
};

function InfoCard({ title, icon: Icon, color, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${ICON_COLORS[color]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{title}</span>
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono, badge, badgeColor }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between px-4 py-2.5 gap-3">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">{label}</span>
      {badge ? (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor || 'bg-green-50 text-green-700 border-green-200'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          {value}
        </span>
      ) : (
        <span className={`text-xs font-bold text-slate-800 text-right leading-snug ${mono ? 'font-mono' : ''}`}>{value}</span>
      )}
    </div>
  );
}

export function PreviewSection({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

export function PreviewRow({ label, children }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 gap-3">
      <span className="text-[11px] font-bold text-slate-400 shrink-0">{label}</span>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL PROFILE VIEW TAB (Tab 7)
// ─────────────────────────────────────────────────────────────────────────────

export function ProfileViewTab({ data, docs }) {
  const baseUrl = 'http://localhost:5001/uploads/';

  return (
    <div className="space-y-5 -m-6">

      {/* Company Card Header */}
      <div className="overflow-hidden">
        <div className="px-8 py-7 flex items-center justify-between" style={{ backgroundColor: data.primary_color || '#4F46E5' }}>
          <div>
            <h2 className="text-2xl font-black text-white leading-tight tracking-tight">{data.company_name || 'Company Name'}</h2>
            {data.legal_name && <p className="text-sm text-white/70 font-medium mt-1">{data.legal_name}</p>}
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                {data.company_status}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-white/80">
                FY {data.financial_year}
              </span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            {data.company_logo ? (
              <img 
                src={`${baseUrl}${data.company_logo}`} 
                alt="Company Logo" 
                className="w-12 h-12 object-contain rounded-lg"
              />
            ) : (
              <Truck className="w-8 h-8 text-white" />
            )}
          </div>
        </div>

        {/* Sub header bar */}
        <div className="px-8 py-3 bg-slate-800 flex flex-wrap items-center gap-x-6 gap-y-1.5">
          {[
            { icon: MapPin, v: [data.city, data.state].filter(Boolean).join(', ') },
            { icon: Mail,   v: data.primary_email },
            { icon: Phone,  v: data.office_phone  },
            { icon: Globe,  v: data.website       },
          ].filter(r => r.v).map((r, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <r.icon className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <span className="text-xs text-white/60 font-medium">{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info grid */}
      <div className="px-6 pb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <InfoCard title="Registration" icon={Shield} color="blue">
            <InfoRow label="GST Number"  value={data.gst_number}    mono />
            <InfoRow label="PAN Number"  value={data.pan_number}    mono />
            <InfoRow label="CIN Number"  value={data.cin_number}    mono />
            <InfoRow label="Industry"    value={data.industry_type}      />
            <InfoRow label="Established" value={data.established_date}   />
            <InfoRow
              label="Status" value={data.company_status} badge
              badgeColor={data.company_status === 'Active'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'}
            />
          </InfoCard>

          <InfoCard title="Contact Details" icon={Phone} color="green">
            <InfoRow label="Office Phone"  value={data.office_phone}     />
            <InfoRow label="Mobile"        value={data.mobile_number}    />
            <InfoRow label="Primary Email" value={data.primary_email}    />
            <InfoRow label="Support Email" value={data.support_email}    />
            <InfoRow label="Website"       value={data.website}         />
            <InfoRow label="Emergency"     value={data.emergency_contact}/>
          </InfoCard>

          <InfoCard title="Registered Address" icon={MapPin} color="red">
            <div className="px-4 py-4">
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                {[data.address_line1, data.address_line2].filter(Boolean).join(', ')}
              </p>
              <p className="text-sm font-medium text-slate-700 mt-1">
                {[data.city, data.state].filter(Boolean).join(', ')}{data.pincode ? ` – ${data.pincode}` : ''}
              </p>
              <p className="text-sm font-bold text-slate-800 mt-1">{data.country}</p>
            </div>
          </InfoCard>

          <InfoCard title="Financial Settings" icon={IndianRupee} color="amber">
            <InfoRow label="Financial Year" value={data.financial_year}       />
            <InfoRow label="Currency"       value={data.currency}            />
            <InfoRow label="Timezone"       value={data.timezone}            />
            <InfoRow label="Date Format"    value={data.date_format}          />
            <InfoRow label="Default Tax"    value={`${data.default_tax}%`}   />
          </InfoCard>

          <InfoCard title="Document Prefixes" icon={FileText} color="purple">
            <InfoRow label="Invoice"        value={`${data.invoice_prefix}-0001`}   mono />
            <InfoRow label="Trip"           value={`${data.trip_prefix}-0001`}      mono />
            <InfoRow label="Vehicle"        value={`${data.vehicle_prefix}-001`}    mono />
            <InfoRow label="Purchase Order" value={`${data.po_prefix}-0001`}        mono />
            <InfoRow label="Settlement"     value={`${data.settlement_prefix}-001`} mono />
          </InfoCard>

          <InfoCard title="Company Documents" icon={CheckCircle2} color="green">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${doc.uploaded ? 'bg-green-100' : 'bg-red-50'}`}>
                  {doc.uploaded
                    ? <Check className="w-3 h-3 text-green-600" />
                    : <X     className="w-3 h-3 text-red-400"  />
                  }
                </div>
                <span className="text-xs font-medium text-slate-700 flex-1 min-w-0 truncate">{doc.label}</span>
                <span className={`text-[10px] font-bold shrink-0 ${doc.uploaded ? 'text-green-600' : 'text-red-400'}`}>
                  {doc.uploaded ? 'Uploaded' : 'Missing'}
                </span>
              </div>
            ))}
          </InfoCard>

        </div>

        {/* Branding / Report Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Branding & Report Template</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-6 flex-wrap">
              {[
                { label: 'Primary Color',   val: data.primary_color   },
                { label: 'Secondary Color', val: data.secondary_color },
              ].map(c => (
                <div key={c.label}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{c.label}</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl border border-slate-200 shadow-sm shrink-0" style={{ backgroundColor: c.val || '#4F46E5' }} />
                    <span className="text-sm font-mono font-bold text-slate-700">{c.val || '#4F46E5'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Report preview mini */}
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: (data.primary_color || '#4F46E5') + '40' }}>
              <div
                className="px-5 py-3.5 flex items-center justify-between border-b-2"
                style={{ 
                  backgroundColor: (data.primary_color || '#4F46E5') + '12', 
                  borderBottomColor: data.primary_color || '#4F46E5' 
                }}
              >
                <div>
                  <p className="text-sm font-black text-slate-800">{data.company_name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{data.report_header}</p>
                </div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: data.primary_color || '#4F46E5' }}>
                  <Truck className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="px-5 py-2.5 bg-slate-50">
                <p className="text-[10px] text-slate-400 font-medium text-center">{data.report_footer}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRINT HTML GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

export function generatePrintHTML(data, docs) {
  const rows = (arr) =>
    arr
      .filter(r => r.value)
      .map(r =>
        r.badge
          ? `<div class="row"><span class="rl">${r.label}</span><span class="badge">${r.value}</span></div>`
          : `<div class="row"><span class="rl">${r.label}</span><span class="rv${r.mono ? ' mono' : ''}">${r.value}</span></div>`
      )
      .join('');

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const primaryColor = data.primary_color || '#4F46E5';
  const baseUrl = 'http://localhost:5001/uploads/';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${data.company_name || 'Company'} – Company Profile</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
body{color:#1e293b;background:#fff;font-size:12px}
@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}@page{size:A4;margin:10mm}}
.page{max-width:820px;margin:0 auto;padding:20px}
.hdr{border-radius:12px;overflow:hidden;margin-bottom:20px}
.hdr-top{background:${primaryColor};padding:24px 32px;display:flex;justify-content:space-between;align-items:center}
.hdr-top h1{font-size:22px;font-weight:900;color:#fff;line-height:1.2}
.hdr-top p{font-size:12px;color:rgba(255,255,255,.7);margin-top:4px}
.hdr-top .badges{display:flex;gap:8px;margin-top:10px}
.hdr-top .b{background:rgba(255,255,255,.2);color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:999px}
.logo{width:56px;height:56px;background:rgba(255,255,255,.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0}
.logo img{width:40px;height:40px;object-fit:contain;border-radius:8px}
.hdr-sub{background:#1e293b;padding:10px 32px;display:flex;flex-wrap:wrap;gap:16px}
.hdr-sub span{font-size:11px;color:rgba(255,255,255,.55)}
.grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px}
.card{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}
.ch{background:#f8fafc;padding:8px 14px;border-bottom:1px solid #e2e8f0;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:#64748b}
.row{display:flex;justify-content:space-between;align-items:center;padding:7px 14px;border-bottom:1px solid #f1f5f9}
.row:last-child{border:none}
.rl{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em}
.rv{font-size:11px;font-weight:700;color:#1e293b;text-align:right}
.mono{font-family:monospace}
.badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}
.addr{padding:12px 14px;font-size:12px;color:#334155;line-height:1.7}
.dr{display:flex;align-items:center;gap:8px;padding:7px 14px;border-bottom:1px solid #f1f5f9}
.dr:last-child{border:none}
.dot-g{width:8px;height:8px;border-radius:50%;background:#22c55e;flex-shrink:0}
.dot-r{width:8px;height:8px;border-radius:50%;background:#f87171;flex-shrink:0}
.dn{font-size:11px;font-weight:600;color:#334155;flex:1}
.dok{font-size:10px;font-weight:700;color:#16a34a}
.derr{font-size:10px;font-weight:700;color:#ef4444}
.branding{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-top:14px}
.rh{padding:14px 20px;display:flex;justify-content:space-between;align-items:center;background:${primaryColor}12;border-bottom:2px solid ${primaryColor}}
.rhn{font-size:14px;font-weight:900;color:#1e293b}
.rhs{font-size:11px;color:#64748b;margin-top:2px}
.rlogo{background:${primaryColor};width:38px;height:38px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px}
.rlogo img{width:28px;height:28px;object-fit:contain;border-radius:6px}
.rf{padding:7px 20px;background:#f8fafc;text-align:center;font-size:10px;color:#94a3b8}
.footer{margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0;text-align:center;font-size:10px;color:#94a3b8}
</style></head>
<body><div class="page">
<div class="hdr">
  <div class="hdr-top">
    <div>
      <h1>${data.company_name || 'Company Name'}</h1>
      ${data.legal_name ? `<p>${data.legal_name}</p>` : ''}
      <div class="badges">
        <span class="b">● ${data.company_status || 'Active'}</span>
        <span class="b">FY ${data.financial_year || '2025-26'}</span>
        <span class="b">${data.industry_type || 'Transport'}</span>
      </div>
    </div>
    <div class="logo">
      ${data.company_logo 
        ? `<img src="${baseUrl}${data.company_logo}" alt="Logo" />` 
        : '🚛'}
    </div>
  </div>
  <div class="hdr-sub">
    ${[
      data.city && data.state ? `<span>📍 ${data.city}, ${data.state}</span>` : '',
      data.primary_email       ? `<span>📧 ${data.primary_email}</span>`         : '',
      data.office_phone        ? `<span>📞 ${data.office_phone}</span>`           : '',
      data.website            ? `<span>🌐 ${data.website}</span>`               : '',
    ].filter(Boolean).join('')}
  </div>
</div>

<div class="grid">
  <div class="card">
    <div class="ch">Registration</div>
    ${rows([
      { label: 'GST Number',  value: data.gst_number,     mono: true  },
      { label: 'PAN Number',  value: data.pan_number,     mono: true  },
      { label: 'CIN Number',  value: data.cin_number,     mono: true  },
      { label: 'Industry',    value: data.industry_type               },
      { label: 'Established', value: data.established_date            },
      { label: 'Status',      value: data.company_status, badge: true },
    ])}
  </div>
  <div class="card">
    <div class="ch">Contact Details</div>
    ${rows([
      { label: 'Office Phone',  value: data.office_phone      },
      { label: 'Mobile',        value: data.mobile_number     },
      { label: 'Primary Email', value: data.primary_email     },
      { label: 'Support Email', value: data.support_email     },
      { label: 'Emergency',     value: data.emergency_contact },
    ])}
  </div>
  <div class="card">
    <div class="ch">Registered Address</div>
    <div class="addr">
      ${[data.address_line1, data.address_line2].filter(Boolean).join(', ')}<br>
      ${[data.city, data.state].filter(Boolean).join(', ')}${data.pincode ? ` – ${data.pincode}` : ''}<br>
      <strong>${data.country || ''}</strong>
    </div>
  </div>
  <div class="card">
    <div class="ch">Financial Settings</div>
    ${rows([
      { label: 'Financial Year', value: data.financial_year        },
      { label: 'Currency',       value: data.currency             },
      { label: 'Timezone',       value: data.timezone             },
      { label: 'Date Format',    value: data.date_format           },
      { label: 'Default Tax',    value: data.default_tax + '%'     },
    ])}
  </div>
  <div class="card">
    <div class="ch">Document Prefixes</div>
    ${rows([
      { label: 'Invoice',        value: data.invoice_prefix    + '-0001', mono: true },
      { label: 'Trip',           value: data.trip_prefix       + '-0001', mono: true },
      { label: 'Vehicle',        value: data.vehicle_prefix    + '-001',  mono: true },
      { label: 'Purchase Order', value: data.po_prefix         + '-0001', mono: true },
      { label: 'Settlement',     value: data.settlement_prefix + '-001',  mono: true },
    ])}
  </div>
  <div class="card">
    <div class="ch">Company Documents</div>
    ${docs.map(d => `
      <div class="dr">
        <div class="${d.uploaded ? 'dot-g' : 'dot-r'}"></div>
        <span class="dn">${d.label}</span>
        <span class="${d.uploaded ? 'dok' : 'derr'}">${d.uploaded ? 'Uploaded' : 'Missing'}</span>
      </div>`).join('')}
  </div>
</div>

<div class="branding">
  <div class="rh">
    <div>
      <div class="rhn">${data.company_name || 'Company Name'}</div>
      <div class="rhs">${data.report_header || ''}</div>
    </div>
    <div class="rlogo">
      ${data.company_logo 
        ? `<img src="${baseUrl}${data.company_logo}" alt="Logo" />` 
        : '🚛'}
    </div>
  </div>
  <div class="rf">${data.report_footer || ''}</div>
</div>

<div class="footer">Generated on ${today} · Fleet ERP · Company Profile</div>
</div></body></html>`;
}
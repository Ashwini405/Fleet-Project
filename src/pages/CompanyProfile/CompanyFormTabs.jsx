import React from 'react';
import {
  Camera, FileText, Image, Upload, Download, Eye,
  RefreshCw, ExternalLink, Truck,
} from 'lucide-react';
import { INDIAN_STATES, PREFIX_FIELDS } from './companyData';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

export function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1 font-medium">{hint}</p>}
    </div>
  );
}

export function Inp({ error, className = '', ...props }) {
  return (
    <>
      <input
        className={`input ${error ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-red-500 mt-1 font-bold">{error}</p>}
    </>
  );
}

export function Sel({ error, children, value, ...props }) {
  // Ensure controlled select never receives `null` which React warns about.
  const safeValue = value === null ? '' : value === undefined ? '' : value;
  return (
    <>
      <select
        className={`input bg-white cursor-pointer ${error ? 'border-red-300' : ''}`}
        value={safeValue}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-[11px] text-red-500 mt-1 font-bold">{error}</p>}
    </>
  );
}

export function SectionDivider({ title }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{title}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — GENERAL INFORMATION
// ─────────────────────────────────────────────────────────────────────────────

export function GeneralTab({ data, onChange, handleFileChange, errors }) {
  return (
    <div className="space-y-5">

      {/* Logo + Name row */}
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Logo upload */}
        <div className="shrink-0">
          <label className="label">Company Logo</label>
          <label className="w-[88px] h-[88px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group">
            {data.company_logo_preview || data.company_logo ? (
              <img
                src={data.company_logo_preview || (`http://localhost:5001/uploads/${data.company_logo}`)}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5">
                <Camera className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                <span className="text-[9px] font-black text-slate-400 group-hover:text-indigo-500 uppercase tracking-wide text-center leading-tight">Upload<br/>Logo</span>
              </div>
            )}
            <input
              type="file"
              name="company_logo"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </label>
          <p className="text-[10px] text-slate-400 mt-1 font-medium text-center">PNG/JPG · Max 2MB</p>
          {errors?.company_logo && <p className="text-[11px] text-red-500 mt-2 font-bold text-center">{errors.company_logo}</p>}
        </div>

        {/* Name fields */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="sm:col-span-2">
            <Field label="Company Name" required>
              <Inp
                name="company_name"
                value={data.company_name}
                onChange={onChange}
                placeholder="Fleet Logistics Pvt Ltd"
                error={errors.company_name}
              />
            </Field>
          </div>
          <Field label="Legal Company Name">
            <Inp name="legal_name" value={data.legal_name} onChange={onChange} placeholder="Full legal name as per MCA" />
          </Field>
          <Field label="CIN Number">
            <Inp name="cin_number" value={data.cin_number} onChange={onChange} placeholder="U60231KA2020PTC000000" />
          </Field>
        </div>
      </div>

      <SectionDivider title="Registration Details" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="GST Number" required>
          <Inp name="gst_number" value={data.gst_number} onChange={onChange} placeholder="29AABCF1234D1Z5" error={errors.gst_number} />
        </Field>
        <Field label="PAN Number">
          <Inp name="pan_number" value={data.pan_number} onChange={onChange} placeholder="AABCF1234D" />
        </Field>
        <Field label="Industry Type">
          <Sel name="industry_type" value={data.industry_type} onChange={onChange}>
            {[
              'Freight Transport', 'Passenger Transport', 'Logistics & Warehousing',
              'Courier Services', 'Mining & Heavy Haulage', 'Construction Equipment',
            ].map(v => <option key={v}>{v}</option>)}
          </Sel>
        </Field>
        <Field label="Company Status">
          <Sel name="company_status" value={data.company_status} onChange={onChange}>
            <option>Active</option>
            <option>Inactive</option>
            <option>Suspended</option>
          </Sel>
        </Field>
        <Field label="Company Website">
          <Inp name="website" value={data.website} onChange={onChange} placeholder="www.yourcompany.com" />
        </Field>
        <Field label="Established Date">
          <Inp type="date" name="established_date" value={data.established_date} onChange={onChange} />
        </Field>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — CONTACT INFORMATION
// ─────────────────────────────────────────────────────────────────────────────

export function ContactTab({ data, onChange, errors }) {
  return (
    <div className="space-y-5">
      <SectionDivider title="Primary Contact" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Office Phone" required>
          <Inp name="office_phone" value={data.office_phone} onChange={onChange} placeholder="+91-80-12345678" error={errors.office_phone} />
        </Field>
        <Field label="Mobile Number">
          <Inp name="mobile_number" value={data.mobile_number} onChange={onChange} placeholder="+91-98765-43210" />
        </Field>
        <Field label="Primary Email" required>
          <Inp type="email" name="primary_email" value={data.primary_email} onChange={onChange} placeholder="admin@company.com" error={errors.primary_email} />
        </Field>
        <Field label="Support Email">
          <Inp type="email" name="support_email" value={data.support_email} onChange={onChange} placeholder="support@company.com" />
        </Field>
      </div>

      <SectionDivider title="Emergency" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Emergency Contact" hint="Shown on vehicle documents and trip reports">
          <Inp name="emergency_contact" value={data.emergency_contact} onChange={onChange} placeholder="+91-99999-00000" />
        </Field>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3 — ADDRESS
// ─────────────────────────────────────────────────────────────────────────────

export function AddressTab({ data, onChange, errors }) {
  // ── FIX 2: Safe Google Maps link ──
  const handleMapClick = (e) => {
    if (!data.maps_location) {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-5">
      <SectionDivider title="Registered Office Address" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field label="Address Line 1" required>
            <Inp name="address_line1" value={data.address_line1} onChange={onChange} placeholder="Building number, Street name" error={errors.address_line1} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Address Line 2">
            <Inp name="address_line2" value={data.address_line2} onChange={onChange} placeholder="Area, Landmark" />
          </Field>
        </div>
        <Field label="City">
          <Inp name="city" value={data.city} onChange={onChange} placeholder="City" />
        </Field>
        <Field label="State">
          <Sel name="state" value={data.state} onChange={onChange}>
            {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
          </Sel>
        </Field>
        <Field label="Country">
          <Inp name="country" value={data.country} onChange={onChange} placeholder="India" />
        </Field>
        <Field label="Pincode">
          <Inp name="pincode" value={data.pincode} onChange={onChange} placeholder="560001" />
        </Field>
      </div>

      <SectionDivider title="Location" />
      <Field label="Google Maps Location" hint="Appears on invoices and delivery reports. Managed from backend.">
        <div className="relative">
          <input
            className="input pr-8 bg-indigo-50 border-indigo-100 text-indigo-700 font-bold cursor-not-allowed"
            value={data.maps_location}
            readOnly
          />
          <a
            href={data.maps_location || "#"}
            onClick={handleMapClick}
            target="_blank"
            rel="noopener noreferrer"
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${
              data.maps_location 
                ? 'text-indigo-500 hover:text-indigo-700' 
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </Field>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 4 — FINANCIAL SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

export function FinancialTab({ data, onChange }) {
  return (
    <div className="space-y-5">
      <SectionDivider title="Year & Locale" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Financial Year" required>
          <Sel name="financial_year" value={data.financial_year} onChange={onChange}>
            {['2024-25', '2025-26', '2026-27', '2027-28'].map(y => <option key={y}>{y}</option>)}
          </Sel>
        </Field>
        <Field label="Currency">
          <Sel name="currency" value={data.currency} onChange={onChange}>
            <option value="INR">INR – Indian Rupee (₹)</option>
            <option value="USD">USD – US Dollar ($)</option>
            <option value="EUR">EUR – Euro (€)</option>
          </Sel>
        </Field>
        <Field label="Timezone">
          <Sel name="timezone" value={data.timezone} onChange={onChange}>
            <option value="Asia/Kolkata">Asia/Kolkata (IST · UTC+5:30)</option>
            <option value="UTC">UTC</option>
          </Sel>
        </Field>
        <Field label="Date Format">
          <Sel name="date_format" value={data.date_format} onChange={onChange}>
            <option>DD-MMM-YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>MM/DD/YYYY</option>
            <option>YYYY-MM-DD</option>
          </Sel>
        </Field>
        <Field label="Default Tax Percentage (%)" hint="Applied to invoices when no specific tax is set">
          <Inp name="default_tax" value={data.default_tax} onChange={onChange} placeholder="18" />
        </Field>
      </div>

      <SectionDivider title="Document Numbering Prefixes" />
      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
        {PREFIX_FIELDS.map((f, i) => (
          <div
            key={f.name}
            className={`flex items-center gap-4 px-4 py-3.5 ${i < PREFIX_FIELDS.length - 1 ? 'border-b border-slate-200' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-700">{f.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{f.desc}</p>
            </div>
            <input
              name={f.name}
              value={data[f.name] || ''}
              onChange={onChange}
              className="input w-28 text-center font-black text-slate-800"
              placeholder="INV"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 5 — BRANDING
// ─────────────────────────────────────────────────────────────────────────────

export function BrandingTab({ data, onChange, handleFileChange, errors }) {
  return (
    <div className="space-y-5">
      <SectionDivider title="Logos & Assets" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div>
          <label className="label">Company Logo</label>
          <label className="flex items-center justify-center gap-2 w-full h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group overflow-hidden">
            {data.company_logo_preview || data.company_logo ? (
              <img
                src={data.company_logo_preview || (`http://localhost:5001/uploads/${data.company_logo}`)}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5">
                <Image className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
                <span className="text-[9px] font-black text-slate-400 group-hover:text-indigo-500 uppercase tracking-wide text-center leading-tight">Click to upload logo</span>
                <p className="text-[10px] text-slate-400 mt-0.5">PNG, SVG · Transparent · Max 2MB</p>
              </div>
            )}
            <input
              type="file"
              name="company_logo"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            {errors?.company_logo && <p className="text-[11px] text-red-500 mt-2 font-bold">{errors.company_logo}</p>}
          </label>
        </div>

        <div>
          <label className="label">Favicon</label>
          <label className="flex items-center justify-center gap-2 w-full h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group overflow-hidden">
            {data.favicon_logo_preview || data.favicon_logo ? (
              <img
                src={data.favicon_logo_preview || (`http://localhost:5001/uploads/${data.favicon_logo}`)}
                alt="Favicon"
                className="w-12 h-12 object-contain"
              />
            ) : (
              <div className="text-center">
                <Image className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
                <div>
                  <p className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">Click to upload favicon</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">ICO, PNG · 32×32 or 64×64 · Max 512KB</p>
                </div>
              </div>
            )}
            <input
              type="file"
              name="favicon_logo"
              onChange={handleFileChange}
              className="hidden"
              accept=".ico,.png"
            />
            {errors?.favicon_logo && <p className="text-[11px] text-red-500 mt-2 font-bold">{errors.favicon_logo}</p>}
          </label>
        </div>

        {/* Digital Signature */}
        <div className="sm:col-span-2">
          <label className="label">Digital Signature / Company Stamp</label>
          <label className="flex items-center gap-4 px-4 py-3.5 w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group overflow-hidden">
            {data.company_signature_preview || data.company_signature ? (
              <img
                src={data.company_signature_preview || (`http://localhost:5001/uploads/${data.company_signature}`)}
                alt="Signature"
                className="w-24 h-12 object-contain"
              />
            ) : (
              <>
                <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">Upload signature or stamp image</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PNG with transparent background · Max 1MB · Printed on invoices and reports</p>
                </div>
              </>
            )}
            <input
              type="file"
              name="company_signature"
              onChange={handleFileChange}
              className="hidden"
              accept=".png,.jpg"
            />
            {errors?.company_signature && <p className="text-[11px] text-red-500 mt-2 font-bold">{errors.company_signature}</p>}
          </label>
        </div>
      </div>

      <SectionDivider title="Theme Colors" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary Color */}
        <div>
          <label className="label">Primary Theme Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="primary_color"
              value={data.primary_color}
              onChange={onChange}
              className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 shrink-0"
            />
            <input
              name="primary_color"
              value={data.primary_color}
              onChange={onChange}
              className="input flex-1 font-mono"
              placeholder="#4F46E5"
            />
          </div>
        </div>
        {/* Secondary Color */}
        <div>
          <label className="label">Secondary Theme Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="secondary_color"
              value={data.secondary_color}
              onChange={onChange}
              className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 shrink-0"
            />
            <input
              name="secondary_color"
              value={data.secondary_color}
              onChange={onChange}
              className="input flex-1 font-mono"
              placeholder="#0EA5E9"
            />
          </div>
        </div>
      </div>

      <SectionDivider title="Report Templates" />
      <div className="grid grid-cols-1 gap-4">
        <Field label="Report Header Text" hint="Appears at the top of all printed reports, invoices and trip documents">
          <Inp name="report_header" value={data.report_header} onChange={onChange} placeholder="Company Name | GST: XXXXXXXXX | City, State" />
        </Field>
        <div>
          <label className="label">Report Footer Text</label>
          <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Appears at the bottom of all printed reports and invoices</p>
          <textarea
            name="report_footer"
            value={data.report_footer}
            onChange={onChange}
            rows={2}
            className="input resize-none"
            placeholder="Thank you for your business. Contact: support@company.com"
          />
        </div>
      </div>

      {/* Live preview */}
      <SectionDivider title="Report Preview" />
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div
          className="px-5 py-3.5 flex items-center justify-between border-b-2"
          style={{ backgroundColor: data.primary_color + '12', borderBottomColor: data.primary_color }}
        >
          <div>
            <p className="text-sm font-black text-slate-800">{data.company_name || 'Company Name'}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{data.report_header}</p>
          </div>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: data.primary_color }}
          >
            <Truck className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="px-5 py-2.5 bg-slate-50">
          <p className="text-[10px] text-slate-400 font-medium text-center">{data.report_footer || 'Report footer will appear here'}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 6 — COMPANY DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────

export function DocumentsTab({ docs, handleFileChange, errors }) {
  const baseUrl = 'http://localhost:5001/uploads/';

  return (
    <div className="space-y-5">
      <SectionDivider title="Certificates & Licenses" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {docs.map(doc => {
          // Map document ID to backend field name
          const fieldMap = {
            'gst': 'gst_certificate',
            'pan': 'pan_card',
            'registration': 'registration_certificate',
            'trade': 'trade_license',
            'insurance': 'insurance_certificate',
          };
          const fieldName = fieldMap[doc.id] || doc.id;

          return (
            <div
              key={doc.id}
              className={`rounded-xl border p-4 ${doc.uploaded ? 'border-green-200 bg-green-50/40' : 'border-slate-200 bg-white'}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${doc.uploaded ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-tight">{doc.label}</p>
                    {doc.uploaded
                      ? <p className="text-[10px] text-slate-400 font-medium mt-0.5">{doc.file} · {doc.size} · {doc.date}</p>
                      : <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide mt-0.5">Not Uploaded</p>
                    }
                  </div>
                </div>
                {doc.uploaded && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 shrink-0">
                      ✓ Uploaded
                    </span>
                  )}
              </div>

              {/* Actions */}
              {doc.uploaded ? (
                <div className="flex items-center gap-2">
                  {(() => {
                    const previewHref = doc.localUrl || (doc.file ? baseUrl + doc.file : null);
                    const downloadHref = doc.localUrl || (doc.file ? baseUrl + doc.file : null);
                    const noHref = !previewHref;
                    return (
                      <>
                        <a
                          href={previewHref || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors ${noHref ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </a>
                        <a
                          href={downloadHref || '#'}
                          download={doc.file || undefined}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors ${noHref ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </>
                    );
                  })()}
                  <label className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
                    <RefreshCw className="w-3.5 h-3.5" /> Replace
                    <input
                      type="file"
                      name={fieldName}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>
                ) : (
                <label className="flex items-center justify-center gap-2 w-full px-3 py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload {doc.label}
                  <input
                    type="file"
                    name={fieldName}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {errors?.[fieldName] && <p className="text-[11px] text-red-500 mt-2 font-bold">{errors[fieldName]}</p>}
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
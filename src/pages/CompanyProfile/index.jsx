import React, { useState } from 'react';
import {
  Building2, Save, X, Eye, Users, MapPin, CheckCircle2,
  FileText, Upload, Download, Image, RefreshCw, Shield,
  Clock, Key, CalendarDays, Code2, Server, Camera,
  ExternalLink, Phone, Mail, Globe, Truck, Palette,
  IndianRupee, Receipt, Info, Printer, Copy, Check,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_DATA = {
  companyName:       'Fleet Logistics Pvt Ltd',
  legalName:         'Fleet Logistics Private Limited',
  gstNumber:         '29AABCF1234D1Z5',
  panNumber:         'AABCF1234D',
  cinNumber:         'U60231KA2020PTC123456',
  industryType:      'Freight Transport',
  website:           'www.fleetlogistics.in',
  establishedDate:   '2020-01-01',
  companyStatus:     'Active',
  officePhone:       '+91-80-12345678',
  mobileNumber:      '+91-98765-43210',
  primaryEmail:      'admin@fleetlogistics.in',
  supportEmail:      'support@fleetlogistics.in',
  emergencyContact:  '+91-99999-00000',
  addressLine1:      '12, Transport Nagar',
  addressLine2:      'Near NH-44 Highway',
  city:              'Bengaluru',
  state:             'Karnataka',
  country:           'India',
  pincode:           '560001',
  mapsLocation:      'https://maps.google.com/?q=Transport+Nagar+Bengaluru',
  financialYear:     '2026-27',
  currency:          'INR',
  timezone:          'Asia/Kolkata',
  dateFormat:        'DD-MMM-YYYY',
  defaultTax:        '18',
  invoicePrefix:     'INV',
  tripPrefix:        'TRP',
  vehiclePrefix:     'VEH',
  poPrefix:          'PO',
  settlementPrefix:  'STL',
  primaryColor:      '#4F46E5',
  secondaryColor:    '#0EA5E9',
  reportHeader:      'Fleet Logistics Pvt Ltd  |  GST: 29AABCF1234D1Z5  |  Bengaluru, Karnataka',
  reportFooter:      'Thank you for your business. For queries: support@fleetlogistics.in  |  +91-80-12345678',
};

const INITIAL_DOCS = [
  { id: 'gst',       label: 'GST Certificate',               uploaded: true,  size: '1.2 MB', date: '01-Jan-2026', file: 'gst_certificate.pdf' },
  { id: 'pan',       label: 'PAN Card',                      uploaded: true,  size: '0.8 MB', date: '01-Jan-2026', file: 'pan_card.pdf' },
  { id: 'reg',       label: 'Company Registration Certificate', uploaded: true,size: '2.4 MB', date: '15-Jan-2026', file: 'registration_cert.pdf' },
  { id: 'trade',     label: 'Trade License',                  uploaded: false, size: null,     date: null,          file: null },
  { id: 'insurance', label: 'Insurance Certificate',          uploaded: false, size: null,     date: null,          file: null },
];

const AUDIT = {
  createdBy:  'Admin',
  createdOn:  '01-Jan-2026',
  updatedBy:  'Ashwini',
  updatedOn:  '30-Jun-2026',
  version:    '1.0',
};

const TABS = [
  { id: 'general',   label: 'General Information' },
  { id: 'contact',   label: 'Contact Information' },
  { id: 'address',   label: 'Address' },
  { id: 'financial', label: 'Financial Settings' },
  { id: 'branding',  label: 'Branding' },
  { id: 'documents', label: 'Company Documents' },
  { id: 'view',      label: '📄 Full Profile View' },
];

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
];

// ─── Shared form primitives ───────────────────────────────────────────────────

function Field({ label, required, hint, children }) {
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

function Inp({ error, className = '', ...props }) {
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

function Sel({ error, children, ...props }) {
  return (
    <>
      <select className={`input bg-white cursor-pointer ${error ? 'border-red-300' : ''}`} {...props}>
        {children}
      </select>
      {error && <p className="text-[11px] text-red-500 mt-1 font-bold">{error}</p>}
    </>
  );
}

function SectionDivider({ title }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{title}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

// ─── Tab 1: General Information ───────────────────────────────────────────────

function GeneralTab({ data, onChange, errors }) {
  return (
    <div className="space-y-5">
      {/* Logo + Name row */}
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <div className="shrink-0">
          <label className="label">Company Logo</label>
          <div className="w-[88px] h-[88px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-1.5 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group">
            <Camera className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
            <span className="text-[9px] font-black text-slate-400 group-hover:text-indigo-500 uppercase tracking-wide text-center leading-tight">Upload<br/>Logo</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium text-center">PNG · Max 2MB</p>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="sm:col-span-2">
            <Field label="Company Name" required>
              <Inp name="companyName" value={data.companyName} onChange={onChange} placeholder="Fleet Logistics Pvt Ltd" error={errors.companyName} />
            </Field>
          </div>
          <Field label="Legal Company Name">
            <Inp name="legalName" value={data.legalName} onChange={onChange} placeholder="Full legal name as per MCA" />
          </Field>
          <Field label="CIN Number">
            <Inp name="cinNumber" value={data.cinNumber} onChange={onChange} placeholder="U60231KA2020PTC000000" />
          </Field>
        </div>
      </div>

      <SectionDivider title="Registration Details" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="GST Number" required>
          <Inp name="gstNumber" value={data.gstNumber} onChange={onChange} placeholder="29AABCF1234D1Z5" error={errors.gstNumber} />
        </Field>
        <Field label="PAN Number">
          <Inp name="panNumber" value={data.panNumber} onChange={onChange} placeholder="AABCF1234D" />
        </Field>
        <Field label="Industry Type">
          <Sel name="industryType" value={data.industryType} onChange={onChange}>
            {['Freight Transport','Passenger Transport','Logistics & Warehousing','Courier Services','Mining & Heavy Haulage','Construction Equipment'].map(v => (
              <option key={v}>{v}</option>
            ))}
          </Sel>
        </Field>
        <Field label="Company Status">
          <Sel name="companyStatus" value={data.companyStatus} onChange={onChange}>
            <option>Active</option>
            <option>Inactive</option>
            <option>Suspended</option>
          </Sel>
        </Field>
        <Field label="Company Website">
          <Inp name="website" value={data.website} onChange={onChange} placeholder="www.yourcompany.com" />
        </Field>
        <Field label="Established Date">
          <Inp type="date" name="establishedDate" value={data.establishedDate} onChange={onChange} />
        </Field>
      </div>
    </div>
  );
}

// ─── Tab 2: Contact Information ───────────────────────────────────────────────

function ContactTab({ data, onChange, errors }) {
  return (
    <div className="space-y-5">
      <SectionDivider title="Primary Contact" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Office Phone" required>
          <Inp name="officePhone" value={data.officePhone} onChange={onChange} placeholder="+91-80-12345678" error={errors.officePhone} />
        </Field>
        <Field label="Mobile Number">
          <Inp name="mobileNumber" value={data.mobileNumber} onChange={onChange} placeholder="+91-98765-43210" />
        </Field>
        <Field label="Primary Email" required>
          <Inp type="email" name="primaryEmail" value={data.primaryEmail} onChange={onChange} placeholder="admin@company.com" error={errors.primaryEmail} />
        </Field>
        <Field label="Support Email">
          <Inp type="email" name="supportEmail" value={data.supportEmail} onChange={onChange} placeholder="support@company.com" />
        </Field>
      </div>

      <SectionDivider title="Emergency" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Emergency Contact" hint="Shown on vehicle documents and trip reports">
          <Inp name="emergencyContact" value={data.emergencyContact} onChange={onChange} placeholder="+91-99999-00000" />
        </Field>
      </div>
    </div>
  );
}

// ─── Tab 3: Address ───────────────────────────────────────────────────────────

function AddressTab({ data, onChange, errors }) {
  return (
    <div className="space-y-5">
      <SectionDivider title="Registered Office Address" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field label="Address Line 1" required>
            <Inp name="addressLine1" value={data.addressLine1} onChange={onChange} placeholder="Building number, Street name" error={errors.addressLine1} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Address Line 2">
            <Inp name="addressLine2" value={data.addressLine2} onChange={onChange} placeholder="Area, Landmark" />
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
          <input className="input pr-8 bg-indigo-50 border-indigo-100 text-indigo-700 font-bold cursor-not-allowed" value={data.mapsLocation} readOnly />
          <a href={data.mapsLocation} target="_blank" rel="noopener noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2">
            <ExternalLink className="w-3.5 h-3.5 text-indigo-500 hover:text-indigo-700" />
          </a>
        </div>
      </Field>
    </div>
  );
}

// ─── Tab 4: Financial Settings ────────────────────────────────────────────────

const PREFIX_FIELDS = [
  { name: 'invoicePrefix',   label: 'Invoice Prefix',        desc: 'All customer invoices · e.g. INV-0001' },
  { name: 'tripPrefix',      label: 'Trip Prefix',           desc: 'Auto-generated trip numbers · e.g. TRP-0001' },
  { name: 'vehiclePrefix',   label: 'Vehicle Prefix',        desc: 'Vehicle IDs in Vehicle Master · e.g. VEH-001' },
  { name: 'poPrefix',        label: 'Purchase Order Prefix', desc: 'Parts and fuel purchase orders · e.g. PO-0001' },
  { name: 'settlementPrefix',label: 'Settlement Prefix',     desc: 'Driver settlement records · e.g. STL-001' },
];

function FinancialTab({ data, onChange }) {
  return (
    <div className="space-y-5">
      <SectionDivider title="Year & Locale" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Financial Year" required>
          <Sel name="financialYear" value={data.financialYear} onChange={onChange}>
            {['2024-25','2025-26','2026-27','2027-28'].map(y => <option key={y}>{y}</option>)}
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
          <Sel name="dateFormat" value={data.dateFormat} onChange={onChange}>
            <option>DD-MMM-YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>MM/DD/YYYY</option>
            <option>YYYY-MM-DD</option>
          </Sel>
        </Field>
        <Field label="Default Tax Percentage (%)" hint="Applied to invoices when no specific tax is set">
          <Inp name="defaultTax" value={data.defaultTax} onChange={onChange} placeholder="18" />
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
              value={data[f.name]}
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

// ─── Tab 5: Branding ──────────────────────────────────────────────────────────

function BrandingTab({ data, onChange }) {
  return (
    <div className="space-y-5">
      <SectionDivider title="Logos & Assets" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Company Logo */}
        <div>
          <label className="label">Company Logo</label>
          <label className="flex flex-col items-center justify-center gap-2 w-full h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group">
            <Image className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
            <div className="text-center">
              <p className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">Click to upload logo</p>
              <p className="text-[10px] text-slate-400 mt-0.5">PNG, SVG · Transparent · Max 2MB</p>
            </div>
            <input type="file" className="hidden" accept=".png,.svg,.jpg" />
          </label>
        </div>

        {/* Favicon */}
        <div>
          <label className="label">Favicon</label>
          <label className="flex flex-col items-center justify-center gap-2 w-full h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group">
            <Image className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
            <div className="text-center">
              <p className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">Click to upload favicon</p>
              <p className="text-[10px] text-slate-400 mt-0.5">ICO, PNG · 32×32 or 64×64 · Max 512KB</p>
            </div>
            <input type="file" className="hidden" accept=".ico,.png" />
          </label>
        </div>

        {/* Digital Signature */}
        <div className="sm:col-span-2">
          <label className="label">Digital Signature / Company Stamp</label>
          <label className="flex items-center gap-4 px-4 py-3.5 w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">Upload signature or stamp image</p>
              <p className="text-[10px] text-slate-400 mt-0.5">PNG with transparent background · Max 1MB · Printed on invoices and reports</p>
            </div>
            <input type="file" className="hidden" accept=".png,.jpg" />
          </label>
        </div>
      </div>

      <SectionDivider title="Theme Colors" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Primary Theme Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="primaryColor"
              value={data.primaryColor}
              onChange={onChange}
              className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 shrink-0"
            />
            <input
              name="primaryColor"
              value={data.primaryColor}
              onChange={onChange}
              className="input flex-1 font-mono"
              placeholder="#4F46E5"
            />
          </div>
        </div>
        <div>
          <label className="label">Secondary Theme Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="secondaryColor"
              value={data.secondaryColor}
              onChange={onChange}
              className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 shrink-0"
            />
            <input
              name="secondaryColor"
              value={data.secondaryColor}
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
          <Inp name="reportHeader" value={data.reportHeader} onChange={onChange} placeholder="Company Name | GST: XXXXXXXXX | City, State" />
        </Field>
        <div>
          <label className="label">Report Footer Text</label>
          <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Appears at the bottom of all printed reports and invoices</p>
          <textarea
            name="reportFooter"
            value={data.reportFooter}
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
          style={{ backgroundColor: data.primaryColor + '12', borderBottomColor: data.primaryColor }}
        >
          <div>
            <p className="text-sm font-black text-slate-800">{data.companyName || 'Company Name'}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{data.reportHeader}</p>
          </div>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: data.primaryColor }}>
            <Truck className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="px-5 py-2.5 bg-slate-50">
          <p className="text-[10px] text-slate-400 font-medium text-center">{data.reportFooter || 'Report footer will appear here'}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 6: Company Documents ─────────────────────────────────────────────────

function DocumentsTab({ docs, onDocUpload }) {
  return (
    <div className="space-y-5">
      <SectionDivider title="Certificates & Licenses" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {docs.map(doc => (
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
                  <CheckCircle2 className="w-3 h-3" /> Uploaded
                </span>
              )}
            </div>

            {/* Actions */}
            {doc.uploaded ? (
              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <label className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
                  <RefreshCw className="w-3.5 h-3.5" /> Replace
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                </label>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full px-3 py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload {doc.label}
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 7: Full Profile View ─────────────────────────────────────────────────

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

function ProfileViewTab({ data, docs }) {
  const fullAddress = [data.addressLine1, data.addressLine2, data.city, data.state, data.pincode, data.country]
    .filter(Boolean).join(', ');

  return (
    <div className="space-y-5 -m-6">
      {/* Company Card Header */}
      <div className="overflow-hidden">
        <div className="px-8 py-7 flex items-center justify-between" style={{ backgroundColor: data.primaryColor }}>
          <div>
            <h2 className="text-2xl font-black text-white leading-tight tracking-tight">{data.companyName || 'Company Name'}</h2>
            {data.legalName && <p className="text-sm text-white/70 font-medium mt-1">{data.legalName}</p>}
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                {data.companyStatus}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-white/80">
                FY {data.financialYear}
              </span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Truck className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="px-8 py-3 bg-slate-800 flex flex-wrap items-center gap-x-6 gap-y-1.5">
          {[
            { icon: MapPin, v: [data.city, data.state].filter(Boolean).join(', ') },
            { icon: Mail,   v: data.primaryEmail },
            { icon: Phone,  v: data.officePhone  },
            { icon: Globe,  v: data.website       },
          ].filter(r => r.v).map((r, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <r.icon className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <span className="text-xs text-white/60 font-medium">{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard title="Registration" icon={Shield} color="blue">
            <InfoRow label="GST Number"  value={data.gstNumber}       mono />
            <InfoRow label="PAN Number"  value={data.panNumber}       mono />
            <InfoRow label="CIN Number"  value={data.cinNumber}       mono />
            <InfoRow label="Industry"    value={data.industryType}         />
            <InfoRow label="Established" value={data.establishedDate}      />
            <InfoRow
              label="Status" value={data.companyStatus} badge
              badgeColor={data.companyStatus === 'Active'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'}
            />
          </InfoCard>

          <InfoCard title="Contact Details" icon={Phone} color="green">
            <InfoRow label="Office Phone"  value={data.officePhone}     />
            <InfoRow label="Mobile"        value={data.mobileNumber}    />
            <InfoRow label="Primary Email" value={data.primaryEmail}    />
            <InfoRow label="Support Email" value={data.supportEmail}    />
            <InfoRow label="Website"       value={data.website}         />
            <InfoRow label="Emergency"     value={data.emergencyContact}/>
          </InfoCard>

          <InfoCard title="Registered Address" icon={MapPin} color="red">
            <div className="px-4 py-4">
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                {[data.addressLine1, data.addressLine2].filter(Boolean).join(', ')}
              </p>
              <p className="text-sm font-medium text-slate-700 mt-1">
                {[data.city, data.state].filter(Boolean).join(', ')}{data.pincode ? ` – ${data.pincode}` : ''}
              </p>
              <p className="text-sm font-bold text-slate-800 mt-1">{data.country}</p>
            </div>
          </InfoCard>

          <InfoCard title="Financial Settings" icon={IndianRupee} color="amber">
            <InfoRow label="Financial Year" value={data.financialYear} />
            <InfoRow label="Currency"       value={data.currency}      />
            <InfoRow label="Timezone"       value={data.timezone}      />
            <InfoRow label="Date Format"    value={data.dateFormat}    />
            <InfoRow label="Default Tax"    value={`${data.defaultTax}%`} />
          </InfoCard>

          <InfoCard title="Document Prefixes" icon={FileText} color="purple">
            <InfoRow label="Invoice"        value={`${data.invoicePrefix}-0001`}    mono />
            <InfoRow label="Trip"           value={`${data.tripPrefix}-0001`}       mono />
            <InfoRow label="Vehicle"        value={`${data.vehiclePrefix}-001`}     mono />
            <InfoRow label="Purchase Order" value={`${data.poPrefix}-0001`}         mono />
            <InfoRow label="Settlement"     value={`${data.settlementPrefix}-001`}  mono />
          </InfoCard>

          <InfoCard title="Company Documents" icon={CheckCircle2} color="green">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${doc.uploaded ? 'bg-green-100' : 'bg-red-50'}`}>
                  {doc.uploaded
                    ? <Check className="w-3 h-3 text-green-600" />
                    : <X    className="w-3 h-3 text-red-400"  />
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
                { label: 'Primary Color',   val: data.primaryColor   },
                { label: 'Secondary Color', val: data.secondaryColor },
              ].map(c => (
                <div key={c.label}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{c.label}</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl border border-slate-200 shadow-sm shrink-0" style={{ backgroundColor: c.val }} />
                    <span className="text-sm font-mono font-bold text-slate-700">{c.val}</span>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: data.primaryColor + '40' }}
            >
              <div
                className="px-5 py-3.5 flex items-center justify-between border-b-2"
                style={{ backgroundColor: data.primaryColor + '12', borderBottomColor: data.primaryColor }}
              >
                <div>
                  <p className="text-sm font-black text-slate-800">{data.companyName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{data.reportHeader}</p>
                </div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: data.primaryColor }}>
                  <Truck className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="px-5 py-2.5 bg-slate-50">
                <p className="text-[10px] text-slate-400 font-medium text-center">{data.reportFooter}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Print HTML generator ─────────────────────────────────────────────────────

function generatePrintHTML(data, docs) {
  const rows = (arr) => arr
    .filter(r => r.value)
    .map(r => r.badge
      ? `<div class="row"><span class="rl">${r.label}</span><span class="badge">${r.value}</span></div>`
      : `<div class="row"><span class="rl">${r.label}</span><span class="rv${r.mono ? ' mono' : ''}">${r.value}</span></div>`
    ).join('');

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${data.companyName} – Company Profile</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
body{color:#1e293b;background:#fff;font-size:12px}
@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}@page{size:A4;margin:10mm}}
.page{max-width:820px;margin:0 auto;padding:20px}
.hdr{border-radius:12px;overflow:hidden;margin-bottom:20px}
.hdr-top{background:${data.primaryColor};padding:24px 32px;display:flex;justify-content:space-between;align-items:center}
.hdr-top h1{font-size:22px;font-weight:900;color:#fff;line-height:1.2}
.hdr-top p{font-size:12px;color:rgba(255,255,255,.7);margin-top:4px}
.hdr-top .badges{display:flex;gap:8px;margin-top:10px}
.hdr-top .b{background:rgba(255,255,255,.2);color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:999px}
.logo{width:56px;height:56px;background:rgba(255,255,255,.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0}
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
.rh{padding:14px 20px;display:flex;justify-content:space-between;align-items:center;background:${data.primaryColor}12;border-bottom:2px solid ${data.primaryColor}}
.rhn{font-size:14px;font-weight:900;color:#1e293b}
.rhs{font-size:11px;color:#64748b;margin-top:2px}
.rlogo{background:${data.primaryColor};width:38px;height:38px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px}
.rf{padding:7px 20px;background:#f8fafc;text-align:center;font-size:10px;color:#94a3b8}
.footer{margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0;text-align:center;font-size:10px;color:#94a3b8}
</style></head>
<body><div class="page">
<div class="hdr">
  <div class="hdr-top">
    <div>
      <h1>${data.companyName}</h1>
      ${data.legalName ? `<p>${data.legalName}</p>` : ''}
      <div class="badges">
        <span class="b">● ${data.companyStatus}</span>
        <span class="b">FY ${data.financialYear}</span>
        <span class="b">${data.industryType}</span>
      </div>
    </div>
    <div class="logo">🚛</div>
  </div>
  <div class="hdr-sub">
    ${[data.city && data.state ? `<span>📍 ${data.city}, ${data.state}</span>` : '']
      .concat([data.primaryEmail ? `<span>📧 ${data.primaryEmail}</span>` : ''])
      .concat([data.officePhone ? `<span>📞 ${data.officePhone}</span>` : ''])
      .concat([data.website ? `<span>🌐 ${data.website}</span>` : ''])
      .filter(Boolean).join('')}
  </div>
</div>

<div class="grid">
  <div class="card">
    <div class="ch">Registration</div>
    ${rows([
      { label: 'GST Number',  value: data.gstNumber,    mono: true },
      { label: 'PAN Number',  value: data.panNumber,    mono: true },
      { label: 'CIN Number',  value: data.cinNumber,    mono: true },
      { label: 'Industry',    value: data.industryType              },
      { label: 'Established', value: data.establishedDate           },
      { label: 'Status',      value: data.companyStatus, badge: true},
    ])}
  </div>
  <div class="card">
    <div class="ch">Contact Details</div>
    ${rows([
      { label: 'Office Phone',  value: data.officePhone      },
      { label: 'Mobile',        value: data.mobileNumber     },
      { label: 'Primary Email', value: data.primaryEmail     },
      { label: 'Support Email', value: data.supportEmail     },
      { label: 'Emergency',     value: data.emergencyContact },
    ])}
  </div>
  <div class="card">
    <div class="ch">Registered Address</div>
    <div class="addr">
      ${[data.addressLine1, data.addressLine2].filter(Boolean).join(', ')}<br>
      ${[data.city, data.state].filter(Boolean).join(', ')}${data.pincode ? ` – ${data.pincode}` : ''}<br>
      <strong>${data.country || ''}</strong>
    </div>
  </div>
  <div class="card">
    <div class="ch">Financial Settings</div>
    ${rows([
      { label: 'Financial Year', value: data.financialYear },
      { label: 'Currency',       value: data.currency      },
      { label: 'Timezone',       value: data.timezone      },
      { label: 'Date Format',    value: data.dateFormat    },
      { label: 'Default Tax',    value: data.defaultTax + '%' },
    ])}
  </div>
  <div class="card">
    <div class="ch">Document Prefixes</div>
    ${rows([
      { label: 'Invoice',        value: data.invoicePrefix    + '-0001', mono: true },
      { label: 'Trip',           value: data.tripPrefix       + '-0001', mono: true },
      { label: 'Vehicle',        value: data.vehiclePrefix    + '-001',  mono: true },
      { label: 'Purchase Order', value: data.poPrefix         + '-0001', mono: true },
      { label: 'Settlement',     value: data.settlementPrefix + '-001',  mono: true },
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
      <div class="rhn">${data.companyName}</div>
      <div class="rhs">${data.reportHeader}</div>
    </div>
    <div class="rlogo">🚛</div>
  </div>
  <div class="rf">${data.reportFooter}</div>
</div>

<div class="footer">Generated on ${today} · Fleet ERP · Company Profile</div>
</div></body></html>`;
}

// ─── Preview helpers ──────────────────────────────────────────────────────────

function PreviewSection({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function PreviewRow({ label, children }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 gap-3">
      <span className="text-[11px] font-bold text-slate-400 shrink-0">{label}</span>
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CompanyProfile() {
  const [activeTab, setActiveTab] = useState('general');
  const [data, setData]           = useState(INITIAL_DATA);
  const [docs]                    = useState(INITIAL_DOCS);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [preview, setPreview]     = useState(false);
  const [copied, setCopied]       = useState(false);

  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handleChange = e => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!data.companyName.trim())  errs.companyName  = 'Company name is required';
    if (!data.gstNumber.trim())    errs.gstNumber    = 'GST number is required';
    if (!data.primaryEmail.trim()) errs.primaryEmail = 'Primary email is required';
    if (!data.officePhone.trim())  errs.officePhone  = 'Office phone is required';
    if (!data.addressLine1.trim()) errs.addressLine1 = 'Address is required';
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      if (errs.companyName || errs.gstNumber)           setActiveTab('general');
      else if (errs.primaryEmail || errs.officePhone)   setActiveTab('contact');
      else if (errs.addressLine1)                        setActiveTab('address');
      return;
    }
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 1000);
  };

  const handleCancel = () => { setData(INITIAL_DATA); setErrors({}); };

  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(generatePrintHTML(data, docs));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  };

  const handleCopy = () => {
    const text = [
      `Company: ${data.companyName}`,
      `GST: ${data.gstNumber}  PAN: ${data.panNumber}`,
      `Address: ${[data.addressLine1, data.addressLine2, data.city, data.state, data.pincode].filter(Boolean).join(', ')}`,
      `Phone: ${data.officePhone}  Email: ${data.primaryEmail}`,
      `Website: ${data.website || '—'}`,
      `Financial Year: ${data.financialYear}  Currency: ${data.currency}`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const kpiCards = [
    { label: 'Company Status', value: data.companyStatus, icon: Building2, badge: data.companyStatus === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200', dot: data.companyStatus === 'Active' ? 'bg-green-500' : 'bg-red-500' },
    { label: 'GST Status',     value: 'Verified',         icon: Shield,    badge: 'bg-blue-50 text-blue-700 border-blue-200',   dot: 'bg-blue-500' },
    { label: 'Financial Year', value: data.financialYear, icon: CalendarDays, plain: true },
    { label: 'Running Plants', value: '8',                icon: MapPin,    plain: true },
    { label: 'Total Users',    value: '48',               icon: Users,     plain: true },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'general':   return <GeneralTab     data={data} onChange={handleChange} errors={errors} />;
      case 'contact':   return <ContactTab     data={data} onChange={handleChange} errors={errors} />;
      case 'address':   return <AddressTab     data={data} onChange={handleChange} errors={errors} />;
      case 'financial': return <FinancialTab   data={data} onChange={handleChange} />;
      case 'branding':  return <BrandingTab    data={data} onChange={handleChange} />;
      case 'documents': return <DocumentsTab   docs={docs} />;
      case 'view':      return <ProfileViewTab data={data} docs={docs} />;
      default:          return null;
    }
  };

  const noSaveBar = activeTab === 'documents' || activeTab === 'view';

  const uploadedCount = docs.filter(d => d.uploaded).length;
  const tabErrors = {
    general: !!(errors.companyName || errors.gstNumber),
    contact: !!(errors.primaryEmail || errors.officePhone),
    address: !!errors.addressLine1,
  };

  return (
    <div className="w-full max-w-400 mx-auto pb-12 space-y-6">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Company Profile</h1>
            <p className="text-xs text-slate-400 font-medium">Manage organisation information, branding and financial settings.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleCancel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button onClick={() => setPreview(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            {copied ? <><Check className="w-3.5 h-3.5 text-green-600" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Printer className="w-3.5 h-3.5" /> Print / PDF
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
          >
            {saving
              ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              : <><Save className="w-3.5 h-3.5" /> Save Changes</>
            }
          </button>
        </div>
      </div>

      {/* ── Overview KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <card.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-tight">{card.label}</p>
              {card.badge ? (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${card.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${card.dot}`} />
                  {card.value}
                </span>
              ) : (
                <p className="text-xl font-black text-slate-800 leading-tight">{card.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main layout: form + sidebar ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">

        {/* Left: Tabs + content */}
        <div className="xl:col-span-3 space-y-4">

          {/* Tab bar */}
          <div className="overflow-x-auto pb-0.5">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit min-w-full">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : tabErrors[tab.id]
                        ? 'text-red-500 hover:text-red-700'
                        : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                  {tabErrors[tab.id] && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {renderTab()}

            {/* Save bar inside card */}
            {!noSaveBar && (
              <div className="flex justify-end gap-2 mt-6 pt-5 border-t border-slate-100">
                <button onClick={handleCancel} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <X className="w-3.5 h-3.5" /> Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
                >
                  {saving
                    ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    : <><Save className="w-3.5 h-3.5" /> Save Changes</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="xl:col-span-1 space-y-4">

          {/* Company Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Company Info</span>
            </div>
            <div className="p-4 divide-y divide-slate-100">
              {[
                { label: 'Company Name', value: data.companyName },
                { label: 'Company ID',   value: 'COMP-001' },
                { label: 'Status',       value: data.companyStatus, isStatus: true },
                { label: 'Financial Year', value: data.financialYear },
                { label: 'Running Plants', value: '8' },
                { label: 'Employees',    value: '48' },
                { label: 'Created On',   value: '01-Jan-2026' },
                { label: 'Last Updated', value: 'Today' },
                { label: 'Updated By',   value: 'Administrator' },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between py-2.5 gap-2 first:pt-0 last:pb-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mt-0.5 leading-tight">{row.label}</span>
                  {row.isStatus ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      {row.value}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-800 text-right leading-snug">{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documents status */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Documents</span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500">{uploadedCount} of {docs.length} uploaded</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  uploadedCount === docs.length
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {uploadedCount === docs.length ? 'Complete' : 'Incomplete'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${(uploadedCount / docs.length) * 100}%` }}
                />
              </div>
              <div className="space-y-2">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${doc.uploaded ? 'bg-green-100' : 'bg-slate-100'}`}>
                      <div className={`w-2 h-2 rounded-full ${doc.uploaded ? 'bg-green-500' : 'bg-slate-300'}`} />
                    </div>
                    <span className={`text-[11px] font-medium leading-tight ${doc.uploaded ? 'text-slate-700' : 'text-slate-400'}`}>{doc.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Audit Information</span>
            </div>
            <div className="p-4 divide-y divide-slate-100">
              {[
                { label: 'Created By',   value: AUDIT.createdBy  },
                { label: 'Created On',   value: AUDIT.createdOn  },
                { label: 'Updated By',   value: AUDIT.updatedBy  },
                { label: 'Updated On',   value: AUDIT.updatedOn  },
                { label: 'Version',      value: `v${AUDIT.version}` },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">{row.label}</span>
                  <span className="text-xs font-bold text-slate-700">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Save Toast ─────────────────────────────────────────────────────── */}
      <div
        className={`fixed top-6 right-6 z-60 flex items-center gap-3 bg-white border border-green-200 shadow-xl rounded-2xl px-4 py-3.5 transition-all duration-300 ${
          saved ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-800 leading-tight">Company Profile Saved</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">All changes have been saved successfully.</p>
        </div>
      </div>

      {/* ── Preview Profile Panel ───────────────────────────────────────────── */}
      {preview && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setPreview(false)} />

          {/* Slide-in panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden">

            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">Profile Preview</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Read-only · Based on current form values</p>
                </div>
              </div>
              <button
                onClick={() => setPreview(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* Report header mock */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div
                  className="px-5 py-4 flex items-center justify-between border-b-2"
                  style={{ backgroundColor: data.primaryColor + '12', borderBottomColor: data.primaryColor }}
                >
                  <div>
                    <p className="text-base font-black text-slate-800 leading-tight">{data.companyName}</p>
                    {data.legalName && (
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{data.legalName}</p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: data.primaryColor }}>
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">{data.reportHeader}</p>
                </div>
                <div className="px-5 py-2.5 bg-white">
                  <p className="text-[10px] text-slate-400 font-medium text-center">{data.reportFooter}</p>
                </div>
              </div>

              {/* Registration */}
              <PreviewSection title="Registration">
                {[
                  { label: 'GST Number',  value: data.gstNumber,    },
                  { label: 'PAN Number',  value: data.panNumber,    },
                  { label: 'CIN Number',  value: data.cinNumber,    },
                  { label: 'Industry',    value: data.industryType, },
                  { label: 'Established', value: data.establishedDate },
                  { label: 'Status',      value: data.companyStatus, badge: true },
                ].filter(r => r.value).map(row => (
                  <PreviewRow key={row.label} label={row.label}>
                    {row.badge ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        data.companyStatus === 'Active'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${data.companyStatus === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {row.value}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-800 text-right">{row.value}</span>
                    )}
                  </PreviewRow>
                ))}
              </PreviewSection>

              {/* Contact */}
              <PreviewSection title="Contact">
                {[
                  { icon: Phone, value: data.officePhone  },
                  { icon: Phone, value: data.mobileNumber },
                  { icon: Mail,  value: data.primaryEmail },
                  { icon: Mail,  value: data.supportEmail },
                  { icon: Globe, value: data.website      },
                ].filter(r => r.value).map((row, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <row.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-700">{row.value}</span>
                  </div>
                ))}
              </PreviewSection>

              {/* Address */}
              <PreviewSection title="Registered Address">
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">
                    {[data.addressLine1, data.addressLine2, data.city, data.state, data.country, data.pincode]
                      .filter(Boolean).join(', ')}
                  </p>
                </div>
              </PreviewSection>

              {/* Financial */}
              <PreviewSection title="Financial Configuration">
                {[
                  { label: 'Financial Year', value: data.financialYear },
                  { label: 'Currency',       value: data.currency      },
                  { label: 'Timezone',       value: data.timezone      },
                  { label: 'Date Format',    value: data.dateFormat    },
                  { label: 'Default Tax',    value: `${data.defaultTax}%` },
                ].map(row => (
                  <PreviewRow key={row.label} label={row.label}>
                    <span className="text-xs font-bold text-slate-800">{row.value}</span>
                  </PreviewRow>
                ))}
              </PreviewSection>

              {/* Documents checklist */}
              <PreviewSection title="Documents">
                <div className="px-4 py-3 space-y-2">
                  {docs.map(doc => (
                    <div key={doc.id} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${doc.uploaded ? 'bg-green-100' : 'bg-slate-100'}`}>
                        <div className={`w-2 h-2 rounded-full ${doc.uploaded ? 'bg-green-500' : 'bg-slate-300'}`} />
                      </div>
                      <span className={`text-[11px] font-medium ${doc.uploaded ? 'text-slate-700' : 'text-slate-400'}`}>{doc.label}</span>
                      {!doc.uploaded && <span className="ml-auto text-[10px] font-bold text-red-400 uppercase tracking-wide">Missing</span>}
                    </div>
                  ))}
                </div>
              </PreviewSection>

            </div>

            {/* Panel footer */}
            <div className="px-5 py-4 border-t border-slate-200 shrink-0 flex items-center justify-between bg-slate-50">
              <p className="text-[11px] text-slate-400 font-medium">Preview only · Save to apply changes</p>
              <button
                onClick={() => setPreview(false)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Close Preview
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

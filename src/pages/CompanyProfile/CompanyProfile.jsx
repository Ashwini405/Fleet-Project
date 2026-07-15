import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Can from '../../components/Can';
import {
  Building2, Save, X, Eye, Users, MapPin, CheckCircle2,
  FileText, Clock, CalendarDays, Phone, Mail, Globe,
  Truck, IndianRupee, Printer, Copy, Check, Shield,
} from 'lucide-react';

import { TABS } from './companyData';

import {
  GeneralTab,
  ContactTab,
  AddressTab,
  FinancialTab,
  BrandingTab,
  DocumentsTab,
} from './CompanyFormTabs';

import {
  ProfileViewTab,
  PreviewSection,
  PreviewRow,
  generatePrintHTML,
} from './CompanyProfileView';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function CompanyProfile() {
  const [activeTab, setActiveTab] = useState('general');

  const DEFAULT_PROFILE = {
    company_name: '',
    legal_name: '',
    cin_number: '',
    gst_number: '',
    pan_number: '',
    industry_type: '',
    company_status: 'Active',
    website: '',
    established_date: '',
    office_phone: '',
    mobile_number: '',
    primary_email: '',
    support_email: '',
    emergency_contact: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    maps_location: '',
    financial_year: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    date_format: 'DD-MMM-YYYY',
    default_tax: '',
    primary_color: '#4F46E5',
    secondary_color: '#0EA5E9',
    report_header: '',
    report_footer: '',
    // file fields
    company_logo: null,
    favicon_logo: null,
    company_signature: null,
    gst_certificate: null,
    pan_card: null,
    registration_certificate: null,
    trade_license: null,
    insurance_certificate: null,
  };

  const [data, setData] = useState(DEFAULT_PROFILE);
  const [docs, setDocs] = useState([]);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Load Company Profile from API ──────────────────────────────────────
  useEffect(() => {
    loadCompanyProfile();
  }, []);

  const baseUrl = 'http://localhost:5001/uploads/';

  const buildDocsFromProfile = (profile = {}) => [
    {
      id: 'gst',
      label: 'GST Certificate',
      uploaded: !!profile.gst_certificate,
      file: profile.gst_certificate || null,
      size: null,
      date: null,
      localUrl: profile.gst_certificate ? `${baseUrl}${profile.gst_certificate}` : null,
    },
    {
      id: 'pan',
      label: 'PAN Card',
      uploaded: !!profile.pan_card,
      file: profile.pan_card || null,
      size: null,
      date: null,
      localUrl: profile.pan_card ? `${baseUrl}${profile.pan_card}` : null,
    },
    {
      id: 'registration',
      label: 'Registration Certificate',
      uploaded: !!profile.registration_certificate,
      file: profile.registration_certificate || null,
      size: null,
      date: null,
      localUrl: profile.registration_certificate ? `${baseUrl}${profile.registration_certificate}` : null,
    },
    {
      id: 'trade',
      label: 'Trade License',
      uploaded: !!profile.trade_license,
      file: profile.trade_license || null,
      size: null,
      date: null,
      localUrl: profile.trade_license ? `${baseUrl}${profile.trade_license}` : null,
    },
    {
      id: 'insurance',
      label: 'Insurance Certificate',
      uploaded: !!profile.insurance_certificate,
      file: profile.insurance_certificate || null,
      size: null,
      date: null,
      localUrl: profile.insurance_certificate ? `${baseUrl}${profile.insurance_certificate}` : null,
    },
  ];

  const loadCompanyProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/company-profile');
      const profileData = res.data.data || {};

      setData(prev => ({ ...prev, ...profileData }));
      setCompanyId(profileData.id || null);
      setDocs(buildDocsFromProfile(profileData));

    } catch (error) {
      console.error('Error loading company profile:', error);
      // If no profile exists yet, initialize with empty defaults
      setData(prev => ({ ...prev }));
      setCompanyId(null);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleChange = e => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ── Handle file uploads ──────────────────────────────────────────────────
  const handleFileChange = e => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];

      // size limits (bytes)
      const limits = {
        company_logo: 2 * 1024 * 1024,
        favicon_logo: 512 * 1024,
        company_signature: 1 * 1024 * 1024,
        gst_certificate: 10 * 1024 * 1024,
        pan_card: 10 * 1024 * 1024,
        registration_certificate: 10 * 1024 * 1024,
        trade_license: 10 * 1024 * 1024,
        insurance_certificate: 10 * 1024 * 1024,
      };

      const max = limits[name] || 10 * 1024 * 1024;
      if (file.size > max) {
        const mb = (max / 1024 / 1024).toFixed(2);
        setErrors(prev => ({ ...prev, [name]: `File too large — max ${mb} MB` }));
        return;
      }

      // optional type checks
      const acceptImage = ['company_logo', 'favicon_logo', 'company_signature'];
      if (acceptImage.includes(name) && !file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, [name]: 'Invalid file type — expected an image' }));
        return;
      }

      // clear any previous file error
      setErrors(prev => ({ ...prev, [name]: '' }));

      // create local preview URL for any selected file (image or PDF). This allows the UI to preview images and files immediately.
      const localUrl = file ? URL.createObjectURL(file) : null;

      setData(prev => ({ ...prev, [name]: file, ...(localUrl ? { [name + '_preview']: localUrl } : {}) }));

      // If this is a document certificate, update docs state so UI shows uploaded immediately
      const docFieldToId = {
        gst_certificate: 'gst',
        pan_card: 'pan',
        registration_certificate: 'registration',
        trade_license: 'trade',
        insurance_certificate: 'insurance',
      };

      if (Object.keys(docFieldToId).includes(name)) {
        const id = docFieldToId[name];
        const fileSize = file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : null;
        const today = new Date().toLocaleDateString();

        setDocs(prevDocs => prevDocs.map(d => d.id === id ? ({
          ...d,
          uploaded: true,
          file: file.name,
          size: fileSize,
          date: today,
          localUrl: localUrl || null,
        }) : d));
      }
    }
  };

  const validate = () => {
    const errs = {};
    if (!data.company_name?.trim())  errs.company_name  = 'Company name is required';
    if (!data.gst_number?.trim())    errs.gst_number    = 'GST number is required';
    if (!data.primary_email?.trim()) errs.primary_email = 'Primary email is required';
    if (!data.office_phone?.trim())  errs.office_phone  = 'Office phone is required';
    if (!data.address_line1?.trim()) errs.address_line1 = 'Address is required';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      if (errs.company_name || errs.gst_number)          setActiveTab('general');
      else if (errs.primary_email || errs.office_phone)  setActiveTab('contact');
      else if (errs.address_line1)                      setActiveTab('address');
      return;
    }

    setSaving(true);
    try {
      // Use FormData for file uploads
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(data).forEach(key => {
        if (key !== 'company_logo' && key !== 'favicon_logo' && key !== 'company_signature' && 
            key !== 'gst_certificate' && key !== 'pan_card' && 
            key !== 'registration_certificate' && key !== 'trade_license' && 
            key !== 'insurance_certificate' && data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      // Append files if they exist
      if (data.company_logo instanceof File) formData.append('company_logo', data.company_logo);
      if (data.favicon_logo instanceof File) formData.append('favicon_logo', data.favicon_logo);
      if (data.company_signature instanceof File) formData.append('company_signature', data.company_signature);
      if (data.gst_certificate instanceof File) formData.append('gst_certificate', data.gst_certificate);
      if (data.pan_card instanceof File) formData.append('pan_card', data.pan_card);
      if (data.registration_certificate instanceof File) formData.append('registration_certificate', data.registration_certificate);
      if (data.trade_license instanceof File) formData.append('trade_license', data.trade_license);
      if (data.insurance_certificate instanceof File) formData.append('insurance_certificate', data.insurance_certificate);

      let response;
      if (companyId) {
        // UPDATE existing profile
        response = await api.put(
          `/company-profile/${companyId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        // CREATE new profile
        response = await api.post(
          '/company-profile',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      // ── FIX: response.data.data should contain the full profile ──
      const savedData = response.data.data;

      if (savedData) {
          setData(prev => ({ ...prev, ...savedData }));
          setCompanyId(savedData.id);
          setDocs(buildDocsFromProfile(savedData));
        }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);

    } catch (error) {
      console.error('Error saving company profile:', error);
      alert(error.response?.data?.message || 'Failed to save company profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadCompanyProfile();
  };

  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(generatePrintHTML(data, docs));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  };

  const handleCopy = () => {
    const text = [
      `Company: ${data.company_name || ''}`,
      `GST: ${data.gst_number || ''}  PAN: ${data.pan_number || ''}`,
      `Address: ${[data.address_line1, data.address_line2, data.city, data.state, data.pincode].filter(Boolean).join(', ')}`,
      `Phone: ${data.office_phone || ''}  Email: ${data.primary_email || ''}`,
      `Website: ${data.website || '—'}`,
      `Financial Year: ${data.financial_year || ''}  Currency: ${data.currency || ''}`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Derived values ──────────────────────────────────────────────────────────

  const uploadedCount = docs.filter(d => d.uploaded).length;

  const tabErrors = {
    general: !!(errors.company_name || errors.gst_number),
    contact: !!(errors.primary_email || errors.office_phone),
    address: !!errors.address_line1,
  };

  const noSaveBar = activeTab === 'documents' || activeTab === 'view';

  const kpiCards = [
    { label: 'Company Status', value: data.company_status || 'Active', icon: Building2,    badge: (data.company_status || 'Active') === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200', dot: (data.company_status || 'Active') === 'Active' ? 'bg-green-500' : 'bg-red-500' },
    { label: 'GST Status',     value: data.gst_number ? 'Verified' : 'Pending', icon: Shield, badge: data.gst_number ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: data.gst_number ? 'bg-blue-500' : 'bg-yellow-500' },
    { label: 'Financial Year', value: data.financial_year || '2025-26', icon: CalendarDays,  plain: true },
    { label: 'Running Plants', value: '8',                icon: MapPin,        plain: true },
    { label: 'Total Users',    value: '48',               icon: Users,         plain: true },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'general':   return <GeneralTab   data={data} onChange={handleChange} handleFileChange={handleFileChange} errors={errors} />;
      case 'contact':   return <ContactTab   data={data} onChange={handleChange} errors={errors} />;
      case 'address':   return <AddressTab   data={data} onChange={handleChange} errors={errors} />;
      case 'financial': return <FinancialTab data={data} onChange={handleChange} />;
      case 'branding':  return <BrandingTab  data={data} onChange={handleChange} handleFileChange={handleFileChange} errors={errors} />;
      case 'documents': return <DocumentsTab docs={docs} handleFileChange={handleFileChange} errors={errors} />;
      case 'view':      return <ProfileViewTab data={data} docs={docs} />;
      default:          return null;
    }
  };

  // ── Loading State ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading Company Profile...</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-400 mx-auto pb-12 space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
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

        {/* Header action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          
          <button onClick={() => setPreview(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
         
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Printer className="w-3.5 h-3.5" /> Print / PDF
          </button>
          <Can module="Company Profile" action="edit">
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
          </Can>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
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

      {/* ── Main Layout: Form + Sidebar ─────────────────────────────────────── */}
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
                <Can module="Company Profile" action="edit">
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
                </Can>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Sidebar ─────────────────────────────────────────────────── */}
        <div className="xl:col-span-1 space-y-4">

          {/* Company Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Company Info</span>
            </div>
            <div className="p-4 divide-y divide-slate-100">
              {[
                { label: 'Company Name',   value: data.company_name || '—'    },
                { label: 'Company ID',     value: data.company_code || '—'          },
                { label: 'Status',         value: data.company_status || 'Active', isStatus: true },
                { label: 'Financial Year', value: data.financial_year || '—'  },
                { label: 'Running Plants', value: '8'                 },
                { label: 'Employees',      value: '48'                },
                { label: 'Created On',     value: data.created_at ? new Date(data.created_at).toLocaleDateString() : '—'       },
                { label: 'Last Updated',   value: data.updated_at ? new Date(data.updated_at).toLocaleString() : '—'             },
                { label: 'Updated By',     value: data.updated_by || '—'     },
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

          {/* Documents Status Card */}
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
              {/* Progress bar - FIX: prevent NaN when docs.length === 0 */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{
                    width: docs.length
                      ? `${(uploadedCount / docs.length) * 100}%`
                      : '0%'
                  }}
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

          {/* Audit Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Audit Information</span>
            </div>
            <div className="p-4 divide-y divide-slate-100">
              {[
                { label: 'Created By', value: data.created_by || '—'          },
                { label: 'Created On', value: data.created_at ? new Date(data.created_at).toLocaleString() : '—'          },
                { label: 'Updated By', value: data.updated_by || '—'          },
                { label: 'Updated On', value: data.updated_at ? new Date(data.updated_at).toLocaleString() : '—'          },
                { label: 'Version',    value: `v${data.version || 1}`      },
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

      {/* ── Save Toast ───────────────────────────────────────────────────────── */}
      <div className={`fixed top-6 right-6 z-60 flex items-center gap-3 bg-white border border-green-200 shadow-xl rounded-2xl px-4 py-3.5 transition-all duration-300 ${
        saved ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}>
        <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-800 leading-tight">Company Profile Saved</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">All changes have been saved successfully.</p>
        </div>
      </div>

      {/* ── Preview Slide-in Panel ───────────────────────────────────────────── */}
      {preview && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setPreview(false)} />
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
                  style={{ backgroundColor: data.primary_color + '12', borderBottomColor: data.primary_color }}
                >
                  <div>
                    <p className="text-base font-black text-slate-800 leading-tight">{data.company_name || 'Company Name'}</p>
                    {data.legal_name && <p className="text-[11px] text-slate-500 font-medium mt-0.5">{data.legal_name}</p>}
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: data.primary_color || '#4F46E5' }}>
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">{data.report_header || 'Report Header'}</p>
                </div>
                <div className="px-5 py-2.5 bg-white">
                  <p className="text-[10px] text-slate-400 font-medium text-center">{data.report_footer || 'Report Footer'}</p>
                </div>
              </div>

              {/* Registration */}
              <PreviewSection title="Registration">
                {[
                  { label: 'GST Number',  value: data.gst_number        },
                  { label: 'PAN Number',  value: data.pan_number        },
                  { label: 'CIN Number',  value: data.cin_number        },
                  { label: 'Industry',    value: data.industry_type     },
                  { label: 'Established', value: data.established_date  },
                  { label: 'Status',      value: data.company_status || 'Active', badge: true },
                ].filter(r => r.value).map(row => (
                  <PreviewRow key={row.label} label={row.label}>
                    {row.badge ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        (data.company_status || 'Active') === 'Active'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${(data.company_status || 'Active') === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
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
                  { icon: Phone, value: data.office_phone  },
                  { icon: Phone, value: data.mobile_number },
                  { icon: Mail,  value: data.primary_email },
                  { icon: Mail,  value: data.support_email },
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
                    {[data.address_line1, data.address_line2, data.city, data.state, data.country, data.pincode]
                      .filter(Boolean).join(', ')}
                  </p>
                </div>
              </PreviewSection>

              {/* Financial */}
              <PreviewSection title="Financial Configuration">
                {[
                  { label: 'Financial Year', value: data.financial_year    },
                  { label: 'Currency',       value: data.currency         },
                  { label: 'Timezone',       value: data.timezone         },
                  { label: 'Date Format',    value: data.date_format       },
                  { label: 'Default Tax',    value: `${data.default_tax || 0}%` },
                ].filter(r => r.value).map(row => (
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
// ─── Mock Data & Constants ────────────────────────────────────────────────────

export const INITIAL_DATA = {
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

export const INITIAL_DOCS = [
  { id: 'gst',       label: 'GST Certificate',                  uploaded: true,  size: '1.2 MB', date: '01-Jan-2026', file: 'gst_certificate.pdf' },
  { id: 'pan',       label: 'PAN Card',                         uploaded: true,  size: '0.8 MB', date: '01-Jan-2026', file: 'pan_card.pdf' },
  { id: 'reg',       label: 'Company Registration Certificate', uploaded: true,  size: '2.4 MB', date: '15-Jan-2026', file: 'registration_cert.pdf' },
  { id: 'trade',     label: 'Trade License',                    uploaded: false, size: null,     date: null,          file: null },
  { id: 'insurance', label: 'Insurance Certificate',            uploaded: false, size: null,     date: null,          file: null },
];

export const AUDIT = {
  createdBy: 'Admin',
  createdOn: '01-Jan-2026',
  updatedBy: 'Ashwini',
  updatedOn: '30-Jun-2026',
  version:   '1.0',
};

export const TABS = [
  { id: 'general',   label: 'General Information' },
  { id: 'contact',   label: 'Contact Information' },
  { id: 'address',   label: 'Address' },
  { id: 'financial', label: 'Financial Settings' },
  { id: 'branding',  label: 'Branding' },
  { id: 'documents', label: 'Company Documents' },
  { id: 'view',      label: '📄 Full Profile View' },
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export const PREFIX_FIELDS = [
  { name: 'invoicePrefix',    label: 'Invoice Prefix',        desc: 'All customer invoices · e.g. INV-0001' },
  { name: 'tripPrefix',       label: 'Trip Prefix',           desc: 'Auto-generated trip numbers · e.g. TRP-0001' },
  { name: 'vehiclePrefix',    label: 'Vehicle Prefix',        desc: 'Vehicle IDs in Vehicle Master · e.g. VEH-001' },
  { name: 'poPrefix',         label: 'Purchase Order Prefix', desc: 'Parts and fuel purchase orders · e.g. PO-0001' },
  { name: 'settlementPrefix', label: 'Settlement Prefix',     desc: 'Driver settlement records · e.g. STL-001' },
];
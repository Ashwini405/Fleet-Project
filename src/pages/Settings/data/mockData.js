export const mockAdminProfile = {
  name: "Alexander Patel",
  email: "alex.patel@cityhubfleet.com",
  phone: "+91 98765 43210",
  employeeId: "EMP-0042",
  role: "System Admin",
  department: "Operations",
  designation: "Fleet Operations Manager",
  avatar: "https://i.pravatar.cc/150?u=admin"
};

export const mockNotifications = {
  email: true,
  sms: false,
  browser: true,
  tripAlerts: true,
  fuelAlerts: false,
  maintenanceAlerts: true,
  approvalAlerts: true,
  weeklyReports: false
};

export const mockSecurity = {
  twoFactor: false,
  rememberDevices: true,
  lastLogin: "01 Jul 2026, 09:15 AM",
  browser: "Chrome 126",
  ipAddress: "103.21.58.44"
};

export const mockActiveSessions = [
  {
    id: 1,
    device: "Windows PC",
    browser: "Chrome 126",
    os: "Windows 11",
    ip: "103.21.58.44",
    loginTime: "01 Jul 2026, 09:15 AM",
    current: true
  },
  {
    id: 2,
    device: "iPhone 14",
    browser: "Safari 17",
    os: "iOS 17.4",
    ip: "103.21.58.91",
    loginTime: "30 Jun 2026, 06:42 PM",
    current: false
  }
];

export const mockLoginHistory = [
  { date: "01 Jul 2026", time: "09:15 AM", browser: "Chrome 126", os: "Windows 11", ip: "103.21.58.44", status: "Success" },
  { date: "30 Jun 2026", time: "06:42 PM", browser: "Safari 17",  os: "iOS 17.4",   ip: "103.21.58.91", status: "Success" },
  { date: "30 Jun 2026", time: "09:01 AM", browser: "Chrome 126", os: "Windows 11", ip: "103.21.58.44", status: "Success" },
  { date: "29 Jun 2026", time: "08:55 AM", browser: "Chrome 126", os: "Windows 11", ip: "103.21.58.44", status: "Success" },
  { date: "28 Jun 2026", time: "10:30 AM", browser: "Firefox 127",os: "Windows 11", ip: "103.21.58.44", status: "Success" },
  { date: "27 Jun 2026", time: "11:14 PM", browser: "Chrome 126", os: "Android 14", ip: "49.36.112.7",  status: "Failed"  },
  { date: "27 Jun 2026", time: "09:00 AM", browser: "Chrome 126", os: "Windows 11", ip: "103.21.58.44", status: "Success" },
  { date: "26 Jun 2026", time: "08:47 AM", browser: "Chrome 126", os: "Windows 11", ip: "103.21.58.44", status: "Success" }
];

export const mockPermissions = {
  vehicles: true,
  tyres: true,
  inventory: true,
  inspection: true,
  claims: false,
  incidents: false
};

export const mockOrganization = {
  companyName: "Fleet Logistics Pvt Ltd",
  address: "City Hub Operations Centre, India",
  gst: "27AABCF1234A1Z5",
  currency: "INR"
};
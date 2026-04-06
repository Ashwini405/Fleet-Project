export const mockAdminProfile = {
  name: "Alexander Patel",
  email: "alex.patel@cityhubfleet.com",
  phone: "+91 98765 43210",
  role: "System Admin",
  avatar: "https://i.pravatar.cc/150?u=admin"
};

export const mockUsers = [
  { id: "USR-001", name: "Alexander Patel", email: "alex@cityhubfleet.com", role: "Admin", status: "Active" },
  { id: "USR-002", name: "Sarah Jenkins", email: "sarah.j@cityhubfleet.com", role: "Supervisor", status: "Active" },
  { id: "USR-003", name: "Ravi Kumar", email: "ravi.k@cityhubfleet.com", role: "Driver", status: "Inactive" },
  { id: "USR-004", name: "Emily Chen", email: "emily.c@cityhubfleet.com", role: "Supervisor", status: "Active" }
];

export const mockPermissions = {
  vehicles: true,
  tyres: true,
  inventory: false,
  inspection: true,
  claims: false,
  incidents: true
};

export const mockOrganization = {
  companyName: "CityHub Logistics Ltd.",
  address: "45 Industrial Hub, Sector 12, Mumbai, 400001",
  gst: "27AABCU9603R1ZM",
  currency: "INR"
};

export const mockNotifications = {
  email: true,
  sms: false,
  system: true
};

import React, { useState } from "react";
import SettingsSidebar from "./SettingsSidebar";

// Tabs
import ProfileTab from "./tabs/ProfileTab";
import SecurityTab from "./tabs/SecurityTab";
import UserManagementTab from "./tabs/UserManagementTab";
import RolesPermissionsTab from "./tabs/RolesPermissionsTab";
import NotificationsTab from "./tabs/NotificationsTab";
import OrganizationTab from "./tabs/OrganizationTab";

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab />;
      case 'security': return <SecurityTab />;
      case 'users': return <UserManagementTab />;
      case 'roles': return <RolesPermissionsTab />;
      case 'notifications': return <NotificationsTab />;
      case 'organization': return <OrganizationTab />;
      default: return <ProfileTab />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Admin & Settings</h1>
        <p className="text-gray-500 mt-1">Manage users, permissions, and organization-wide configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 w-full min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import SettingsSidebar from "./SettingsSidebar";
import ProfileTab from "./tabs/ProfileTab";
import ChangePasswordTab from "./tabs/ChangePasswordTab";
import SecurityTab from "./tabs/SecurityTab";
import NotificationsTab from "./tabs/NotificationsTab";
import ActiveSessionsTab from "./tabs/ActiveSessionsTab";
import LoginHistoryTab from "./tabs/LoginHistoryTab";

export default function MyAccount() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':       return <ProfileTab />;
      case 'password':      return <ChangePasswordTab />;
      case 'security':      return <SecurityTab />;
      case 'notifications': return <NotificationsTab />;
      case 'sessions':      return <ActiveSessionsTab />;
      case 'history':       return <LoginHistoryTab />;
      default:              return <ProfileTab />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">My Account</h1>
        <p className="text-gray-500 mt-1">Manage your personal profile, security, and account preferences.</p>
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

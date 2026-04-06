import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import { mockUsers } from "../data/mockData";
import UserModal from "../components/UserModal";

export default function UserManagementTab() {
  const [users, setUsers] = useState(mockUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleAddClick = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to completely remove this user's access?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...userData, id: editingUser.id } : u));
    } else {
      setUsers([...users, { ...userData, id: `USR-00${users.length + 1}` }]);
    }
    setIsModalOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-5xl">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> User Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">Add or remove platform access and assign roles.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add New User
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4 hidden md:table-cell">Role</th>
              <th className="px-6 py-4 hidden sm:table-cell">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800 text-base">{user.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{user.email}</div>
                  <div className="text-gray-400 text-xs mt-1 md:hidden">Role: {user.role}</div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell font-medium text-gray-700">
                  {user.role}
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  {user.status === 'Active' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase tracking-widest border border-green-200/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 uppercase tracking-widest border border-gray-200">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => handleEditClick(user)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition" title="Edit User">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition" title="Delete User">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserModal 
          user={editingUser} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveUser} 
        />
      )}
    </motion.div>
  );
}

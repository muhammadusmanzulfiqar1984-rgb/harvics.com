'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'

export default function UsersAndAccess() {
  const locale = useLocale()
  const [showAddModal, setShowAddModal] = useState(false)

  const users = [
    { name: 'John Doe', email: 'john.doe@costcowest.com', role: 'Admin', status: 'Active', lastLogin: '2025-01-20 10:30' },
    { name: 'Jane Smith', email: 'jane.smith@costcowest.com', role: 'Sales', status: 'Active', lastLogin: '2025-01-19 14:20' },
    { name: 'Bob Johnson', email: 'bob.johnson@costcowest.com', role: 'Finance', status: 'Active', lastLogin: '2025-01-18 09:15' },
    { name: 'Alice Brown', email: 'alice.brown@costcowest.com', role: 'Viewer', status: 'Disabled', lastLogin: '2024-12-10 16:45' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#C3A35E]">Users & Access</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-white text-white px-6 py-2 font-semibold hover:opacity-90 transition-opacity"
        >
          Add User
        </button>
      </div>

      <div className="bg-white border border-black200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">User Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={index} className="hover:bg-white">
                  <td className="px-6 py-4 font-semibold text-[#C3A35E]/90">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-white text-[#C3A35E]/90 rounded-full text-xs font-semibold">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{user.lastLogin}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-white hover:underline text-sm font-semibold">
                        Edit
                      </button>
                      <button className={`text-sm font-semibold ${
                        user.status === 'Active' ? 'text-red-600 hover:underline' : 'text-green-600 hover:underline'
                      }`}>
                        {user.status === 'Active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#C3A35E]">Add User</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#C3A35E]/90 hover:text-[#C3A35E]/90"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Name *</label>
                <input type="text" className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Email *</label>
                <input type="email" className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Role *</label>
                <select className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black" required>
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Permissions</label>
                <div className="space-y-2">
                  {['View Orders', 'Place Orders', 'View Finance', 'Manage Users'].map(permission => (
                    <label key={permission} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="flex-1 bg-white text-white px-6 py-3 font-semibold hover:opacity-90 transition-opacity">
                  Add User
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-white text-[#C3A35E]/90 px-6 py-3 font-semibold hover:bg-white transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


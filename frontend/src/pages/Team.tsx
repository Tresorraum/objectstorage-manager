import React, { useState } from 'react';
import {
  UserGroupIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  lastActive: string;
  avatar?: string;
}

export default function Team() {
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const isPremium = user?.is_premium;

  // Mock data
  const members: TeamMember[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'owner',
      status: 'active',
      lastActive: '2 minutes ago',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
      status: 'active',
      lastActive: '1 hour ago',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'member',
      status: 'active',
      lastActive: '3 hours ago',
    },
    {
      id: 4,
      name: 'Alice Williams',
      email: 'alice@example.com',
      role: 'viewer',
      status: 'pending',
      lastActive: 'Never',
    },
  ];

  const roles = [
    {
      name: 'Owner',
      description: 'Full access to all features and billing',
      permissions: ['All permissions', 'Manage billing', 'Delete organization'],
    },
    {
      name: 'Admin',
      description: 'Manage instances, backups, and team members',
      permissions: ['Manage instances', 'Manage backups', 'Invite members', 'View analytics'],
    },
    {
      name: 'Member',
      description: 'Create and manage backups',
      permissions: ['Create backups', 'View instances', 'Run backup jobs'],
    },
    {
      name: 'Viewer',
      description: 'Read-only access to view resources',
      permissions: ['View instances', 'View backups', 'View analytics'],
    },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3.5 w-3.5 mr-1" />
            Pending
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Collaborate with your team and manage access
          </p>
        </div>

        {/* Premium Upsell */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-start gap-6">
            <div className="bg-white/20 p-4 rounded-xl">
              <UserGroupIcon className="h-12 w-12" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <LockClosedIcon className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Premium Feature</span>
              </div>
              <h2 className="text-2xl font-bold mb-3">Unlock Team Collaboration</h2>
              <p className="text-purple-100 mb-6 max-w-2xl">
                Invite team members, assign roles, and collaborate on managing your storage infrastructure. Perfect for teams and organizations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <UserGroupIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Unlimited Members</div>
                    <div className="text-sm text-purple-100">Invite your entire team</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <ShieldCheckIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Role-Based Access</div>
                    <div className="text-sm text-purple-100">Control permissions precisely</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <EnvelopeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Email Invitations</div>
                    <div className="text-sm text-purple-100">Easy onboarding process</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <CheckCircleIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Activity Tracking</div>
                    <div className="text-sm text-purple-100">See who did what and when</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/subscribe'}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage team members and their access permissions
          </p>
        </div>
        <button
          onClick={() => toast('Coming soon! Invite feature under development.', { icon: '🚀' })}
          className="btn-primary w-full sm:w-auto"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{members.length}</div>
          <div className="text-sm text-gray-600">Total Members</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {members.filter(m => m.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {members.filter(m => m.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {members.filter(m => m.role === 'admin').length}
          </div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-sm">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(member.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {member.lastActive}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toast('Coming soon!', { icon: '🚀' })}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      {member.role !== 'owner' && (
                        <button
                          onClick={() => toast('Coming soon!', { icon: '🚀' })}
                          className="text-red-600 hover:text-red-900"
                          title="Remove"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roles & Permissions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Roles & Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div key={role.name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">{role.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              <div className="space-y-1">
                {role.permissions.map((permission) => (
                  <div key={permission} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    {permission}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

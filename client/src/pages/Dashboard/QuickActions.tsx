import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CloudArrowUpIcon,
  ServerIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface QuickActionsProps {
  isPremium: boolean;
}

export default function QuickActions({ isPremium }: QuickActionsProps) {
  const navigate = useNavigate();

  const handleAnalyticsClick = () => {
    if (isPremium) {
      navigate('/analytics');
    } else {
      toast('Upgrade to Premium to access Analytics', { icon: '⭐' });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button 
          onClick={() => navigate('/backups')}
          className="w-full flex items-center gap-3 p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-left"
        >
          <div className="bg-indigo-600 p-2 rounded-lg">
            <CloudArrowUpIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900">Manage Backups</div>
            <div className="text-xs text-gray-500">View and run backup jobs</div>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
        </button>
        <button 
          onClick={() => navigate('/instances')}
          className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
        >
          <div className="bg-green-600 p-2 rounded-lg">
            <ServerIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900">Manage Instances</div>
            <div className="text-xs text-gray-500">Connect new storage</div>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
        </button>
        <button 
          onClick={handleAnalyticsClick}
          className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
        >
          <div className="bg-purple-600 p-2 rounded-lg">
            <ChartBarIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900">View Analytics</div>
            <div className="text-xs text-gray-500">Detailed insights</div>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

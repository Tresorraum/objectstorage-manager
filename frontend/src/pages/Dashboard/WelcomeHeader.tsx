import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, CloudArrowUpIcon, ServerIcon } from '@heroicons/react/24/outline';

interface WelcomeHeaderProps {
  username?: string;
}

export default function WelcomeHeader({ username }: WelcomeHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-wide opacity-90">Welcome Back</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 break-words text-center sm:text-left">
            {username ? `Hello, ${username}!` : 'Dashboard'}
          </h1>
          <p className="text-indigo-100">
            Here's what's happening with your storage infrastructure today
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => navigate('/backups')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <CloudArrowUpIcon className="h-5 w-5" />
            View Backups
          </button>
          <button 
            onClick={() => navigate('/instances')}
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <ServerIcon className="h-5 w-5" />
            Add Instance
          </button>
        </div>
      </div>
    </div>
  );
}

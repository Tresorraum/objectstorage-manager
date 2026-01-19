import React from 'react';
import { CloudArrowUpIcon, CircleStackIcon, CloudIcon } from '@heroicons/react/24/outline';

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  premium?: boolean;
}

interface BackupTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isPremium: boolean;
}

const tabs: Tab[] = [
  {
    id: 'scheduled',
    name: 'Scheduled Backups',
    icon: CloudArrowUpIcon,
    description: 'Automated backup jobs for object storage',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    icon: CircleStackIcon,
    description: 'Instant database backups',
    premium: true,
  },
  {
    id: 'vps',
    name: 'VPS Files',
    icon: CloudIcon,
    description: 'Server file backups',
    premium: true,
  },
];

export default function BackupTabs({ activeTab, onTabChange, isPremium }: BackupTabsProps) {
  return (
    <div className="border-b border-gray-200 bg-white rounded-t-xl">
      {/* Mobile Dropdown */}
      <div className="sm:hidden px-4 py-3">
        <label htmlFor="backup-tab" className="sr-only">
          Select a backup type
        </label>
        <select
          id="backup-tab"
          className="input-field"
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id} disabled={tab.premium && !isPremium}>
              {tab.name} {tab.premium && !isPremium ? '(Premium)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:block">
        <nav className="flex space-x-4 px-6" aria-label="Backup types">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isLocked = tab.premium && !isPremium;

            return (
              <button
                key={tab.id}
                onClick={() => !isLocked && onTabChange(tab.id)}
                disabled={isLocked}
                className={`
                  group relative flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all
                  ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                <span>{tab.name}</span>
                {tab.premium && !isPremium && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                    Premium
                  </span>
                )}
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {tab.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

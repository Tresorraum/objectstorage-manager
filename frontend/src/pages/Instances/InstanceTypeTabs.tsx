import React from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { InstanceType, InstanceTypeConfig } from './types';

interface InstanceTypeTabsProps {
  types: InstanceTypeConfig[];
  selectedType: InstanceType;
  onTypeClick: (type: InstanceType) => void;
}

export default function InstanceTypeTabs({ types, selectedType, onTypeClick }: InstanceTypeTabsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {types.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          const isLocked = !type.available;
          
          return (
            <button
              key={type.id}
              onClick={() => onTypeClick(type.id)}
              className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? `border-${type.color.replace('text-', '')} ${type.bgColor}`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } ${isLocked ? 'opacity-60' : ''}`}
            >
              {isLocked && (
                <div className="absolute top-2 right-2">
                  <LockClosedIcon className="h-4 w-4 text-gray-400" />
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className={`${type.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${type.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate">
                    {type.name}
                  </div>
                  {isLocked && (
                    <div className="text-xs text-gray-500 mt-0.5">Coming Soon</div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

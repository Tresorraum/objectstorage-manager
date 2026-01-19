import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { InstanceTypeConfig } from './types';

interface InstanceTypeHeaderProps {
  typeConfig: InstanceTypeConfig;
  onAddInstance: () => void;
}

export default function InstanceTypeHeader({ typeConfig, onAddInstance }: InstanceTypeHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`${typeConfig.bgColor} p-3 rounded-xl`}>
            <typeConfig.icon className={`h-8 w-8 ${typeConfig.color}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{typeConfig.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{typeConfig.description}</p>
          </div>
        </div>
        <button
          onClick={onAddInstance}
          className={`btn-primary w-full sm:w-auto ${!typeConfig.available ? 'opacity-60' : ''}`}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Instance
        </button>
      </div>
    </div>
  );
}

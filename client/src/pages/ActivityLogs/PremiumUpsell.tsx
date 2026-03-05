import React from 'react';
import {
  DocumentTextIcon,
  LockClosedIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

export default function PremiumUpsell() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="mt-2 text-sm text-gray-600">
          Complete audit trail of all system activities
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="bg-white/20 p-4 rounded-xl">
            <DocumentTextIcon className="h-12 w-12" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <LockClosedIcon className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Premium Feature</span>
            </div>
            <h2 className="text-2xl font-bold mb-3">Unlock Activity Logs & Audit Trail</h2>
            <p className="text-blue-100 mb-6 max-w-2xl">
              Track every action in your system with comprehensive activity logs. Perfect for compliance, security auditing, and troubleshooting issues.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                  <ClockIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">Real-time Tracking</div>
                  <div className="text-sm text-blue-100">Monitor all system activities live</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">Advanced Search</div>
                  <div className="text-sm text-blue-100">Find specific events quickly</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                  <FunnelIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">Powerful Filters</div>
                  <div className="text-sm text-blue-100">Filter by user, action, status</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                  <DocumentTextIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">Export Reports</div>
                  <div className="text-sm text-blue-100">Download logs for compliance</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/subscribe'}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

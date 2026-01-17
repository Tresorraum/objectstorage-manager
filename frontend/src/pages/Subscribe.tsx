import React from 'react';
import { WrenchScrewdriverIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function Subscribe() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </button>

        {/* Under Construction Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
              <WrenchScrewdriverIcon className="h-12 w-12 text-indigo-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Under Construction
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            We're working hard to bring you our Enterprise subscription plans. Check back soon!
          </p>

          {/* Info Box */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
            <h3 className="text-sm font-semibold text-indigo-900 mb-3">
              Coming Soon:
            </h3>
            <ul className="space-y-2 text-sm text-indigo-800">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span>Flexible subscription plans</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span>Server storage backups</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span>Advanced features</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/backups')}
              className="btn-primary"
            >
              Go to Backups
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Go to Dashboard
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 mt-8">
            For inquiries, please contact support
          </p>
        </div>
      </div>
    </div>
  );
}

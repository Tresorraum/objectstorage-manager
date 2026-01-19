import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { BackupJob } from './types';
import { formatBytes, getStatusColor, getSourceInstanceName, getSourceDetails, getSourceTypeLabel } from './utils';

interface BackupHistoryModalProps {
  job: BackupJob;
  onClose: () => void;
}

export default function BackupHistoryModal({ job, onClose }: BackupHistoryModalProps) {
  return (
    <div className="space-y-4">
      {/* Job Info */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Source Type:</span>
            <span className="ml-2 font-medium text-gray-900">{getSourceTypeLabel(job.source_type)}</span>
          </div>
          <div>
            <span className="text-gray-500">Instance:</span>
            <span className="ml-2 font-medium text-gray-900">{getSourceInstanceName(job)}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Source:</span>
            <span className="ml-2 font-medium text-gray-900">{getSourceDetails(job)}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Storage Path:</span>
            <span className="ml-2 font-mono text-xs text-gray-900">{job.destination_path}</span>
          </div>
        </div>
      </div>

      {/* Backup Runs List */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Backup Runs</h4>
        {job.backup_runs && job.backup_runs.length > 0 ? (
          <div className="space-y-2">
            {job.backup_runs.map((run) => (
              <div key={run.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(run.status)}`}>
                        {run.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(run.started_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {run.status === 'completed' && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-500">Files</div>
                      <div className="font-semibold text-gray-900">{run.files_count.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-500">Size</div>
                      <div className="font-semibold text-gray-900">{formatBytes(run.bytes_count)}</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="font-semibold text-gray-900">
                        {run.completed_at 
                          ? `${Math.round((new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000)}s`
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                )}

                {run.backup_path && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Archive Path:</div>
                    <div className="font-mono text-xs text-gray-900 bg-gray-50 p-2 rounded break-all">
                      {run.backup_path}
                    </div>
                  </div>
                )}

                {run.error_msg && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">
                    <div className="text-xs font-semibold text-red-800 mb-1">Error:</div>
                    <div className="text-xs text-red-700 break-words">{run.error_msg}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm">No backup runs yet</p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button onClick={onClose} className="btn-secondary">
          Close
        </button>
      </div>
    </div>
  );
}

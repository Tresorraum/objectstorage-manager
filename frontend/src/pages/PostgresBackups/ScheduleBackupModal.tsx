import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import Modal from '../../components/Modal';

interface ScheduleBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  databaseId: string;
  databaseName: string;
}

interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  cronExpression?: string;
  retentionDays: number;
  encryption: boolean;
}

export default function ScheduleBackupModal({
  isOpen,
  onClose,
  databaseId,
  databaseName,
}: ScheduleBackupModalProps) {
  const [config, setConfig] = useState<ScheduleConfig>({
    frequency: 'daily',
    time: '02:00',
    retentionDays: 7,
    encryption: true,
  });
  const queryClient = useQueryClient();

  const scheduleMutation = useMutation({
    mutationFn: (data: any) => api.post('/backup-schedules', data),
    onSuccess: () => {
      toast.success('Backup schedule created successfully');
      queryClient.invalidateQueries({ queryKey: ['backup-schedules', databaseId] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create schedule');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let cronExpression = '';
    const [hour, minute] = config.time.split(':');

    switch (config.frequency) {
      case 'daily':
        cronExpression = `${minute} ${hour} * * *`;
        break;
      case 'weekly':
        cronExpression = `${minute} ${hour} * * ${config.dayOfWeek || 0}`;
        break;
      case 'monthly':
        cronExpression = `${minute} ${hour} ${config.dayOfMonth || 1} * *`;
        break;
      case 'custom':
        cronExpression = config.cronExpression || '';
        break;
    }

    scheduleMutation.mutate({
      database_id: databaseId,
      cron_expression: cronExpression,
      retention_days: config.retentionDays,
      encryption: config.encryption,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Automatic Backups" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Database Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-1">Database</h3>
          <p className="text-sm text-blue-800">{databaseName}</p>
        </div>

        {/* Frequency */}
        <div>
          <label className="input-label">Backup Frequency</label>
          <select
            value={config.frequency}
            onChange={(e) =>
              setConfig({
                ...config,
                frequency: e.target.value as ScheduleConfig['frequency'],
              })
            }
            className="input-field"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom (Cron)</option>
          </select>
        </div>

        {/* Time */}
        <div>
          <label className="input-label">Backup Time</label>
          <div className="relative">
            <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="time"
              value={config.time}
              onChange={(e) => setConfig({ ...config, time: e.target.value })}
              className="input-field pl-10"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Time is in your local timezone
          </p>
        </div>

        {/* Day of Week (for weekly) */}
        {config.frequency === 'weekly' && (
          <div>
            <label className="input-label">Day of Week</label>
            <select
              value={config.dayOfWeek || 0}
              onChange={(e) =>
                setConfig({ ...config, dayOfWeek: parseInt(e.target.value) })
              }
              className="input-field"
            >
              <option value="0">Sunday</option>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
            </select>
          </div>
        )}

        {/* Day of Month (for monthly) */}
        {config.frequency === 'monthly' && (
          <div>
            <label className="input-label">Day of Month</label>
            <input
              type="number"
              min="1"
              max="31"
              value={config.dayOfMonth || 1}
              onChange={(e) =>
                setConfig({ ...config, dayOfMonth: parseInt(e.target.value) })
              }
              className="input-field"
              required
            />
          </div>
        )}

        {/* Custom Cron */}
        {config.frequency === 'custom' && (
          <div>
            <label className="input-label">Cron Expression</label>
            <input
              type="text"
              value={config.cronExpression || ''}
              onChange={(e) => setConfig({ ...config, cronExpression: e.target.value })}
              className="input-field font-mono"
              placeholder="0 2 * * *"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Format: minute hour day month day-of-week
            </p>
          </div>
        )}

        {/* Retention */}
        <div>
          <label className="input-label">Retention Period (days)</label>
          <input
            type="number"
            min="1"
            max="365"
            value={config.retentionDays}
            onChange={(e) =>
              setConfig({ ...config, retentionDays: parseInt(e.target.value) })
            }
            className="input-field"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Backups older than this will be automatically deleted
          </p>
        </div>

        {/* Encryption */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.encryption}
              onChange={(e) => setConfig({ ...config, encryption: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Enable Encryption
              </span>
              <p className="text-xs text-gray-600 mt-1">
                Encrypt backups using AES-256-GCM (recommended)
              </p>
            </div>
          </label>
        </div>

        {/* Schedule Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Schedule Preview
          </h4>
          <p className="text-sm text-gray-700">
            {config.frequency === 'daily' && `Every day at ${config.time}`}
            {config.frequency === 'weekly' &&
              `Every ${
                ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
                  config.dayOfWeek || 0
                ]
              } at ${config.time}`}
            {config.frequency === 'monthly' &&
              `On day ${config.dayOfMonth || 1} of every month at ${config.time}`}
            {config.frequency === 'custom' && `Custom: ${config.cronExpression || 'Not set'}`}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Backups will be retained for {config.retentionDays} days
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={scheduleMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={scheduleMutation.isPending}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scheduleMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Schedule...
              </>
            ) : (
              <>
                <CalendarIcon className="h-5 w-5 mr-2" />
                Create Schedule
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

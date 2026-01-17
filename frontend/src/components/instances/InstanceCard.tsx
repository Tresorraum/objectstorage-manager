import React from 'react';
import { PencilIcon, TrashIcon, CheckCircleIcon, ServerIcon } from '@heroicons/react/24/outline';
import { RustFSInstance } from '../../types/instance.types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface InstanceCardProps {
  instance: RustFSInstance;
  onEdit: (instance: RustFSInstance) => void;
  onDelete: (id: number) => void;
}

export const InstanceCard: React.FC<InstanceCardProps> = ({
  instance,
  onEdit,
  onDelete,
}) => {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ServerIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{instance.name}</h3>
              <p className="text-sm text-gray-600">{instance.endpoint}</p>
            </div>
          </div>
          <Badge variant={instance.status === 'active' ? 'success' : 'error'}>
            {instance.status}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Region:</span>
            <span className="font-medium">{instance.region}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">SSL:</span>
            <span className="font-medium">
              {instance.ssl ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500 inline" />
              ) : (
                'Disabled'
              )}
            </span>
          </div>
          {instance.description && (
            <div className="text-sm">
              <span className="text-gray-600">Description:</span>
              <p className="text-gray-900 mt-1">{instance.description}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <Button
            size="sm"
            variant="secondary"
            icon={<PencilIcon className="h-4 w-4" />}
            onClick={() => onEdit(instance)}
            className="flex-1"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this instance?')) {
                onDelete(instance.id);
              }
            }}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

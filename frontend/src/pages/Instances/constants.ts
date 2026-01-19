import { ServerIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import { InstanceTypeConfig } from './types';

export const instanceTypes: InstanceTypeConfig[] = [
  {
    id: 'object-storage',
    name: 'Object Storage',
    icon: CircleStackIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'S3-compatible object storage (RustFS, MinIO, AWS S3)',
    available: true,
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    icon: ServerIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'PostgreSQL database instances',
    available: false,
  },
  {
    id: 'mysql',
    name: 'MySQL',
    icon: ServerIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'MySQL/MariaDB database instances',
    available: false,
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    icon: ServerIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'MongoDB NoSQL database instances',
    available: false,
  },
  {
    id: 'redis',
    name: 'Redis',
    icon: ServerIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Redis in-memory data store instances',
    available: false,
  },
];

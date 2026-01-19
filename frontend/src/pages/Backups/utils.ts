export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'running':
      return 'bg-blue-100 text-blue-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getTypeColor = (type: string): string => {
  return type === 'server'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-green-100 text-green-800';
};

export const getSourceInstanceName = (job: any): string => {
  if (job.rustfs_instance) {
    return job.rustfs_instance.name;
  } else if (job.postgres_instance) {
    return job.postgres_instance.name;
  } else if (job.vps_instance) {
    return job.vps_instance.name;
  }
  return 'Unknown';
};

export const getSourceDetails = (job: any): string => {
  if (job.rustfs_instance && job.source_bucket) {
    return job.source_bucket;
  } else if (job.postgres_instance) {
    return job.postgres_instance.database;
  } else if (job.vps_instance && job.source_path) {
    return job.source_path;
  }
  return '';
};

export const getSourceTypeLabel = (sourceType: string): string => {
  switch (sourceType) {
    case 'object_storage':
      return 'Object Storage';
    case 'postgres':
      return 'PostgreSQL';
    case 'vps':
      return 'VPS';
    default:
      return sourceType;
  }
};

export const getSourceTypeColor = (sourceType: string): string => {
  switch (sourceType) {
    case 'object_storage':
      return 'bg-indigo-100 text-indigo-800';
    case 'postgres':
      return 'bg-blue-100 text-blue-800';
    case 'vps':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

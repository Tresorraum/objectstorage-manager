export interface RustFSInstance {
  id: number;
  name: string;
  endpoint: string;
  access_key: string;
  region: string;
  ssl: boolean;
  description: string;
  status: string;
  created_at: string;
}

export type InstanceType = 'object-storage' | 'postgres' | 'mysql' | 'mongodb' | 'redis';

export interface InstanceTypeConfig {
  id: InstanceType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
  available: boolean;
}

export interface InstanceFormData {
  name: string;
  endpoint: string;
  access_key: string;
  secret_key: string;
  region: string;
  ssl: boolean;
  description: string;
}

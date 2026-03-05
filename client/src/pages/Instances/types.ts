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

export interface PostgresInstance {
  id: number;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  ssl: boolean;
  description: string;
  status: string;
  created_at: string;
}

export interface VPSInstance {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  auth_type: 'password' | 'ssh_key';
  backup_path: string;
  description: string;
  status: string;
  created_at: string;
}

export type InstanceType = 'object-storage' | 'postgres' | 'vps' | 'mysql' | 'mongodb' | 'redis';

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

export interface PostgresFormData {
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  description: string;
}

export interface VPSFormData {
  name: string;
  host: string;
  port: number;
  username: string;
  auth_type: 'password' | 'ssh_key';
  password: string;
  ssh_key: string;
  backup_path: string;
  description: string;
}

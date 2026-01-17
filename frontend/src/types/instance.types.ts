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

export interface InstanceFormData {
  name: string;
  endpoint: string;
  access_key: string;
  secret_key: string;
  region: string;
  ssl: boolean;
  description: string;
}

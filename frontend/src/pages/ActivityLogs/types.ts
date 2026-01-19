export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  resource: string;
  resource_id?: number;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface LogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export type ViewMode = 'table' | 'cards';
export type LogStatus = 'success' | 'warning' | 'error';

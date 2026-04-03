import axios from 'axios';

export interface ConnectionParams {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface ExplainParams extends ConnectionParams {
  sql: string;
  mode: 'EXPLAIN' | 'EXPLAIN_ANALYZE' | 'EXPLAIN_ANALYZE_VERBOSE';
}

export interface ExplainResponse {
  success: boolean;
  planJson: string | null;
  error: string | null;
  mode: string | null;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
}

export async function testConnection(params: ConnectionParams): Promise<TestConnectionResponse> {
  const { data } = await axios.post<TestConnectionResponse>('/api/test-connection', params);
  return data;
}

export async function executeExplain(params: ExplainParams): Promise<ExplainResponse> {
  const { data } = await axios.post<ExplainResponse>('/api/explain', params);
  return data;
}

export interface Project {
  project_id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

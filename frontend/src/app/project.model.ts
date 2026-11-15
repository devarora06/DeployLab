export type ProjectStatus = 'Active' | 'Completed' | 'Archived';

export const PROJECT_STATUSES: ProjectStatus[] = ['Active', 'Completed', 'Archived'];

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface NewProject {
  name: string;
  description: string;
  status: ProjectStatus;
}

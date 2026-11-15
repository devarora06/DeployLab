import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewProject, Project, ProjectStatus } from './project.model';

// Relative URL on purpose:
// - in development, "ng serve" forwards /api to the backend (see proxy.conf.json)
// - in production, Nginx forwards /api to the Node.js backend
@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/projects';

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);
  }

  create(project: NewProject): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, project);
  }

  updateStatus(id: string, status: ProjectStatus): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/${id}`, { status });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

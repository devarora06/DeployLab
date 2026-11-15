import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { PROJECT_STATUSES, Project, ProjectStatus } from './project.model';
import { ProjectService } from './project.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly projectService = inject(ProjectService);

  protected readonly statuses = PROJECT_STATUSES;
  protected readonly projects = signal<Project[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly filter = signal<ProjectStatus | 'All'>('All');
  protected readonly visibleProjects = computed(() =>
    this.filter() === 'All' ? this.projects() : this.projects().filter((p) => p.status === this.filter())
  );
  protected readonly counts = computed(() => {
    const list = this.projects();
    return {
      All: list.length,
      Active: list.filter((p) => p.status === 'Active').length,
      Completed: list.filter((p) => p.status === 'Completed').length,
      Archived: list.filter((p) => p.status === 'Archived').length,
    };
  });

  // Add-project form fields
  protected name = '';
  protected description = '';
  protected status: ProjectStatus = 'Active';

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.error.set('');
        this.loading.set(false);
      },
      error: (err) => this.fail(err, 'Could not load projects.'),
    });
  }

  protected add(): void {
    const name = this.name.trim();
    if (!name) return;
    this.projectService.create({ name, description: this.description.trim(), status: this.status }).subscribe({
      next: (created) => {
        this.projects.update((list) => [created, ...list]);
        this.name = '';
        this.description = '';
        this.status = 'Active';
        this.error.set('');
      },
      error: (err) => this.fail(err, 'Could not add the project.'),
    });
  }

  protected changeStatus(project: Project, status: ProjectStatus): void {
    this.projectService.updateStatus(project.id, status).subscribe({
      next: (updated) => {
        this.projects.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
        this.error.set('');
      },
      error: (err) => {
        this.fail(err, 'Could not update the status.');
        this.load(); // reset the dropdown to the saved value
      },
    });
  }

  protected remove(project: Project): void {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    this.projectService.delete(project.id).subscribe({
      next: () => {
        this.projects.update((list) => list.filter((p) => p.id !== project.id));
        this.error.set('');
      },
      error: (err) => this.fail(err, 'Could not delete the project.'),
    });
  }

  private fail(err: HttpErrorResponse, fallback: string): void {
    this.loading.set(false);
    const apiMessage = err.error?.message;
    this.error.set(apiMessage ?? (err.status === 0 ? `${fallback} The API is not reachable.` : fallback));
  }
}

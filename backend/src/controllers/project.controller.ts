import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';
import { Project, PROJECT_STATUSES } from '../models/project.model';

// Express 5 forwards errors from async handlers automatically,
// so we only handle the expected cases (400 / 404) here.

function checkId(id: string, res: Response): boolean {
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid project id' });
    return false;
  }
  return true;
}

const statusError = `Status must be one of: ${PROJECT_STATUSES.join(', ')}`;

export async function getProjects(_req: Request, res: Response) {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
}

export async function getProject(req: Request<{ id: string }>, res: Response) {
  if (!checkId(req.params.id, res)) return;
  const project = await Project.findById(req.params.id);
  if (!project) return void res.status(404).json({ message: 'Project not found' });
  res.json(project);
}

export async function createProject(req: Request, res: Response) {
  const { name, description, status } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim()) {
    return void res.status(400).json({ message: 'Name is required' });
  }
  if (status !== undefined && !PROJECT_STATUSES.includes(status)) {
    return void res.status(400).json({ message: statusError });
  }
  const project = await Project.create({ name, description, status });
  res.status(201).json(project);
}

export async function updateProject(req: Request<{ id: string }>, res: Response) {
  if (!checkId(req.params.id, res)) return;
  const { name, description, status } = req.body ?? {};
  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return void res.status(400).json({ message: 'Name cannot be empty' });
  }
  if (status !== undefined && !PROJECT_STATUSES.includes(status)) {
    return void res.status(400).json({ message: statusError });
  }
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { name, description, status }, // undefined fields are ignored by Mongoose
    { new: true, runValidators: true }
  );
  if (!project) return void res.status(404).json({ message: 'Project not found' });
  res.json(project);
}

export async function deleteProject(req: Request<{ id: string }>, res: Response) {
  if (!checkId(req.params.id, res)) return;
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return void res.status(404).json({ message: 'Project not found' });
  res.status(204).send();
}

// Central error handler (registered last in server.ts)
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}

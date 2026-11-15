import { Schema, model } from 'mongoose';

export const PROJECT_STATUSES = ['Active', 'Completed', 'Archived'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface IProject {
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', trim: true, maxlength: 500 },
    status: { type: String, enum: PROJECT_STATUSES, default: 'Active' },
  },
  {
    // We only need createdAt, as listed in the project model
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      versionKey: false,
      // Expose "id" instead of Mongo's "_id"
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret['_id'];
        return ret;
      },
    },
  }
);

export const Project = model<IProject>('Project', projectSchema);

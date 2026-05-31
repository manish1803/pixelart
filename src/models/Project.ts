import mongoose, { Document, Model, Schema } from 'mongoose';

// ----- Frame sub-document -----
interface IFrame {
  id: number | string;
  pixels: Map<string, string>;
}

const FrameSchema = new Schema<IFrame>(
  {
    id: { type: Schema.Types.Mixed, required: true },
    pixels: { type: Map, of: String, default: {} },
  },
  { _id: false }
);

// ----- Project document -----
export interface IProject extends Document {
  userId: string;
  folderId?: string | null;
  name: string;
  date: string;
  preview: string;
  pixels: Map<string, string>;
  gridSize: number;
  frames: IFrame[];
  animationState?: any;
  isFavourite: boolean;
  isDraft: boolean;
  isDeleted: boolean;
  schemaVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId:      { type: String, required: true },
    folderId:    { type: String, default: null },
    name:        { type: String, default: 'Untitled Project' },
    date:        { type: String, default: '' },
    preview:     { type: String, default: '' },
    pixels:      { type: Map, of: String, default: {} },
    gridSize:    { type: Number, default: 32 },
    frames:      { type: [FrameSchema], default: [] },
    animationState: { type: Schema.Types.Mixed, default: null },
    isFavourite: { type: Boolean, default: false },
    isDraft:     { type: Boolean, default: false },
    isDeleted:   { type: Boolean, default: false },
    schemaVersion: { type: Number, default: 2 },
  },
  { timestamps: true }
);

// Index for fast per-user queries and folder lookups
ProjectSchema.index({ userId: 1, folderId: 1, createdAt: -1 });

if (mongoose.models.Project) {
  delete (mongoose.models as any).Project;
}
export const Project: Model<IProject> = mongoose.model<IProject>('Project', ProjectSchema);

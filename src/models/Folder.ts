import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFolder extends Document {
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolder>(
  {
    userId: { type: String, required: true },
    name:   { type: String, required: true, default: 'New Folder' },
  },
  { timestamps: true }
);

// Index for fast per-user queries
FolderSchema.index({ userId: 1, createdAt: -1 });

export const Folder: Model<IFolder> =
  mongoose.models.Folder ?? mongoose.model<IFolder>('Folder', FolderSchema);

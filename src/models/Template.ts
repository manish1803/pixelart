import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITemplate extends Document {
  userId: string; // User who created it. Null or 'system' for default templates.
  name: string;
  description: string;
  gridSize: number;
  palette: string[];
  pixels: Map<string, string>; // Optional starting pixels
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    userId:      { type: String, required: true },
    name:        { type: String, required: true },
    description: { type: String, default: '' },
    gridSize:    { type: Number, required: true },
    palette:     { type: [String], default: [] },
    pixels:      { type: Map, of: String, default: {} },
    isSystem:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

TemplateSchema.index({ userId: 1, createdAt: -1 });

export const Template: Model<ITemplate> =
  mongoose.models.Template ?? mongoose.model<ITemplate>('Template', TemplateSchema);

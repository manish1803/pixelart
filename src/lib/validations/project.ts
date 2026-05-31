import { z } from 'zod';

// ----- Frame -----
export const FrameSchema = z.object({
  id: z.union([z.number(), z.string()]),
  pixels: z.record(z.string(), z.string()).default({}),
});

// ----- Create / Update -----
export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100).default('Untitled Project'),
  folderId: z.string().nullable().optional(),
  date: z.string().optional(),
  preview: z.string().default(''),
  pixels: z.record(z.string(), z.string()).default({}),
  gridSize: z.number().int().min(8).max(128).default(32),
  frames: z.array(FrameSchema).default([]),
  animationState: z.any().optional(),
  isFavourite: z.boolean().default(false),
  isDraft: z.boolean().default(false),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

// ----- Toggle -----
export const ToggleFieldSchema = z.object({
  field: z.enum(['isFavourite', 'isDraft', 'isDeleted']),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

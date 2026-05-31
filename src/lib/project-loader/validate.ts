import { z } from 'zod';

export const ProjectV1Schema = z.object({
  schemaVersion: z.literal(1).optional(),
  name: z.string().default('Untitled Project'),
  frames: z.array(z.object({
    id: z.number(),
    pixels: z.record(z.string(), z.string()).default({})
  })).default([])
}).passthrough(); // Allow extra fields

export const ProjectV2Schema = z.object({
  schemaVersion: z.literal(2),
  name: z.string().default('Untitled Project'),
  animationState: z.object({
    layers: z.array(z.any()),
    frames: z.array(z.any()),
    cels: z.array(z.any()),
    celData: z.record(z.string(), z.any())
  })
}).passthrough();

export function validateProject(project: any): { success: boolean; version: number; error?: string } {
  // If no schema version, try v1
  if (!project.schemaVersion || project.schemaVersion === 1) {
    const result = ProjectV1Schema.safeParse(project);
    if (result.success) return { success: true, version: 1 };
    return { success: false, version: 1, error: result.error.message };
  }
  
  if (project.schemaVersion === 2) {
    const result = ProjectV2Schema.safeParse(project);
    if (result.success) return { success: true, version: 2 };
    return { success: false, version: 2, error: result.error.message };
  }

  return { success: false, version: project.schemaVersion, error: `Unsupported schema version: ${project.schemaVersion}` };
}

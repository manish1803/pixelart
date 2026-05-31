import { runMigrations } from '@/lib/migrations';
import { normalizeProject } from './normalize';
import { validateProject } from './validate';

export async function loadProject(rawProject: any): Promise<any> {
  console.info(`[ProjectLoader] Loading project: ${rawProject.name || 'Untitled'}`);
  
  try {
    // 1. Validate raw data
    const validation = validateProject(rawProject);
    if (!validation.success) {
      console.warn(`[ProjectLoader] Validation failed for v${validation.version}: ${validation.error}`);
    }
    
    // 2. Run migrations
    const migratedProject = runMigrations(rawProject);
    
    // 3. Normalize data (ensure defaults)
    const normalizedProject = normalizeProject(migratedProject);
    
    return normalizedProject;
  } catch (error) {
    console.error(`[ProjectLoader] Failed to load project:`, error);
    throw error;
  }
}

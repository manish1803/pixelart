import { CURRENT_SCHEMA_VERSION } from '@/lib/project-schema/constants';
import { migrateV1ToV2 } from './v1-to-v2';

const migrations: { [key: number]: (project: any) => any } = {
  1: migrateV1ToV2,
};

export function runMigrations(project: any): any {
  let migratedProject = { ...project };
  
  // If no schema version, assume v1
  if (!migratedProject.schemaVersion) {
    migratedProject.schemaVersion = 1;
  }

  while (migratedProject.schemaVersion < CURRENT_SCHEMA_VERSION) {
    const migrate = migrations[migratedProject.schemaVersion];
    
    if (!migrate) {
      throw new Error(`Missing migration for v${migratedProject.schemaVersion}`);
    }

    console.info(`[Migration] Running v${migratedProject.schemaVersion} -> v${migratedProject.schemaVersion + 1}`);
    migratedProject = migrate(migratedProject);
  }

  return migratedProject;
}

import { connectToDatabase } from '@/lib/mongodb';
import type { CreateProjectInput, UpdateProjectInput } from '@/lib/validations/project';
import { IProject, Project } from '@/models/Project';

// Serialize a Mongoose document to a plain JS object with `id` string
function serialize(doc: IProject) {
  const obj = doc.toObject({ flattenMaps: true });
  return {
    ...obj,
    id: (obj._id as { toString(): string }).toString(),
    _id: undefined,
    __v: undefined,
  };
}

export async function getProjectsByUser(userId: string, trash: boolean = false) {
  await connectToDatabase();
  const docs = await Project.find({ 
    userId, 
    isDeleted: trash ? true : { $ne: true } 
  }).sort({ createdAt: -1 });
  return docs.map(serialize);
}

function migrateProject(project: any) {
  const CURRENT_VERSION = 2;
  let migrated = false;
  
  if (!project.schemaVersion) {
    project.schemaVersion = 1;
    migrated = true;
  }
  
  if (project.schemaVersion < 2) {
    if (!project.animationState) {
      project.animationState = {
        frames: project.frames || [],
        layers: [{ id: 'layer-1', name: 'Layer 1', isVisible: true, isLocked: false }],
        cels: (project.frames || []).map((f: any) => ({ frameId: f.id.toString(), layerId: 'layer-1', dataId: `data-${f.id}-layer-1` })),
        celData: (project.frames || []).reduce((acc: any, f: any) => {
          acc[`data-${f.id}-layer-1`] = { id: `data-${f.id}-layer-1`, pixels: f.pixels || {} };
          return acc;
        }, {}),
        activeFrameIndex: 0,
        fps: 12,
        isPlaying: false
      };
      migrated = true;
    }
    project.schemaVersion = 2;
    migrated = true;
  }
  
  return { project, migrated };
}

export async function getProjectById(userId: string, id: string) {
  await connectToDatabase();
  const doc = await Project.findOne({ _id: id, userId });
  if (!doc) return null;
  
  const obj = doc.toObject({ flattenMaps: true });
  const { project, migrated } = migrateProject(obj);
  
  if (migrated) {
    await Project.updateOne({ _id: id }, { $set: { schemaVersion: project.schemaVersion, animationState: project.animationState } });
  }
  
  return {
    ...project,
    id: (obj._id as { toString(): string }).toString(),
    _id: undefined,
    __v: undefined,
  };
}

export async function getProject(id: string) {
  await connectToDatabase();
  try {
    const doc = await Project.findOne({ _id: id });
    return doc ? serialize(doc) : null;
  } catch (e) {
    return null;
  }
}

export async function createProject(userId: string, data: CreateProjectInput & { folderId?: string | null }) {
  await connectToDatabase();
  const doc = await Project.create({
    userId,
    ...data,
    date: data.date ?? new Date().toLocaleDateString(),
  });
  return serialize(doc);
}

export async function updateProject(userId: string, id: string, data: UpdateProjectInput & { folderId?: string | null }) {
  await connectToDatabase();
  const doc = await Project.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { returnDocument: 'after' }
  );
  return doc ? serialize(doc) : null;
}

export async function moveProjectToFolder(userId: string, projectId: string, folderId: string | null) {
  await connectToDatabase();
  const doc = await Project.findOneAndUpdate(
    { _id: projectId, userId },
    { $set: { folderId } },
    { returnDocument: 'after' }
  );
  return doc ? serialize(doc) : null;
}

export async function deleteProject(userId: string, id: string) {
  await connectToDatabase();
  const project = await Project.findOne({ _id: id, userId });
  if (!project) return null;

  if (project.isDeleted) {
    // If already in trash, delete permanently!
    const doc = await Project.findOneAndDelete({ _id: id, userId });
    return doc ? serialize(doc) : null;
  } else {
    // Soft-delete!
    project.isDeleted = true;
    await project.save();
    return serialize(project);
  }
}

export async function toggleProjectField(
  userId: string,
  id: string,
  field: 'isFavourite' | 'isDraft' | 'isDeleted'
) {
  await connectToDatabase();
  const doc = await Project.findOne({ _id: id, userId });
  if (!doc) return null;
  doc[field] = !doc[field];
  await doc.save();
  return serialize(doc);
}

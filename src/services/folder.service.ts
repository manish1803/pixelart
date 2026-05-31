import { connectToDatabase } from '@/lib/mongodb';
import { Folder, IFolder } from '@/models/Folder';
import { Project } from '@/models/Project';

function serialize(doc: IFolder) {
  const obj = doc.toObject();
  return {
    ...obj,
    id: (obj._id as { toString(): string }).toString(),
    _id: undefined,
    __v: undefined,
  };
}

export async function getFoldersByUser(userId: string) {
  await connectToDatabase();
  const docs = await Folder.find({ userId }).sort({ createdAt: -1 });
  return docs.map(serialize);
}

export async function createFolder(userId: string, name: string) {
  await connectToDatabase();
  const doc = await Folder.create({ userId, name });
  return serialize(doc);
}

export async function updateFolder(userId: string, id: string, name: string) {
  await connectToDatabase();
  const doc = await Folder.findOneAndUpdate(
    { _id: id, userId },
    { $set: { name } },
    { returnDocument: 'after' }
  );
  return doc ? serialize(doc) : null;
}

export async function deleteFolder(userId: string, id: string) {
  await connectToDatabase();
  // When a folder is deleted, we reset its projects to "unfolderized" (folderId: null)
  await Project.updateMany({ userId, folderId: id }, { $set: { folderId: null } });
  const doc = await Folder.findOneAndDelete({ _id: id, userId });
  return doc ? serialize(doc) : null;
}

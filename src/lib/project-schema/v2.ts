import { AnimationState } from '@/lib/models/animation';

export interface ProjectV2 {
  schemaVersion: 2;
  name: string;
  date: string;
  preview: string;
  gridSize: number;
  animationState: AnimationState;
  isFavourite: boolean;
  isDraft: boolean;
  folderId?: string | null;
}

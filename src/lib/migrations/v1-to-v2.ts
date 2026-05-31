import { AnimationState } from '@/lib/models/animation';
import { ProjectV1 } from '@/lib/project-schema/v1';
import { ProjectV2 } from '@/lib/project-schema/v2';

export function migrateV1ToV2(project: ProjectV1): ProjectV2 {
  // Normalize frames or fallback to pixels
  let framesData = project.frames;
  if ((!framesData || framesData.length === 0) && project.pixels) {
    framesData = [{ id: 1, pixels: project.pixels }];
  }
  
  if (!framesData) framesData = [];

  const frames = framesData.map(f => ({ id: `frame-${f.id}` }));
  const layers = [{ id: 'layer-1', name: 'Layer 1', isVisible: true, isLocked: false }];
  
  const cels: any[] = [];
  const celData: { [key: string]: any } = {};

  framesData.forEach(f => {
    const frameId = `frame-${f.id}`;
    const layerId = 'layer-1';
    const dataId = `data-${frameId}-${layerId}`;

    cels.push({
      frameId,
      layerId,
      dataId,
    });

    celData[dataId] = {
      id: dataId,
      pixels: f.pixels || {},
    };
  });

  const animationState: AnimationState = {
    layers,
    frames,
    cels,
    celData,
    thumbnailFrameId: frames.length > 0 ? frames[0].id : undefined,
  };

  return {
    name: project.name,
    date: project.date,
    preview: project.preview,
    gridSize: project.gridSize,
    schemaVersion: 2,
    animationState,
    isFavourite: project.isFavourite ?? false,
    isDraft: project.isDraft ?? false,
  };
}

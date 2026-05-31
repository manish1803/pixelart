export function normalizeProject(project: any): any {
  // We expect a v2 project here after migration!
  return {
    ...project,
    name: project.name || 'Untitled Project',
    isFavourite: project.isFavourite ?? false,
    isDraft: project.isDraft ?? false,
    // Ensure animationState has all required fields
    animationState: {
      ...project.animationState,
      layers: project.animationState.layers || [],
      frames: project.animationState.frames || [],
      cels: project.animationState.cels || [],
      celData: project.animationState.celData || {},
      thumbnailFrameId: project.animationState.thumbnailFrameId || (project.animationState.frames.length > 0 ? project.animationState.frames[0].id : null),
    }
  };
}

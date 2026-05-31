export interface FrameV1 {
  id: number;
  pixels: { [key: string]: string };
}

export interface ProjectV1 {
  schemaVersion?: 1;
  name: string;
  date: string;
  preview: string;
  gridSize: number;
  frames?: FrameV1[];
  pixels?: { [key: string]: string };
  isFavourite?: boolean;
  isDraft?: boolean;
}

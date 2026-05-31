import { getProject } from '@/services/project.service';
import { Metadata } from 'next';
import EditorClient from './EditorClient';

interface EditorPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: EditorPageProps): Promise<Metadata> {
  const { id } = await searchParams;
  
  if (typeof id === 'string') {
    const project = await getProject(id);
    if (project) {
      return {
        title: `Editing: ${project.name}`,
        description: `Now editing ${project.name} in the Pixel Art Editor.`,
        robots: { index: false }, // Don't index individual editing sessions
      };
    }
  }

  return {
    title: 'New Canvas',
    description: 'Start a new pixel art project or animation.',
    robots: { index: false },
  };
}

export default function EditorPage() {
  return <EditorClient />;
}

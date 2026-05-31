import { getProject } from '@/services/project.service';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProject(params.slug);

  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested pixel art project could not be found.',
    };
  }

  return {
    title: project.name,
    description: `View ${project.name}, a pixel art project created on Pixel Art Editor. Grid size: ${project.gridSize}x${project.gridSize}.`,
    alternates: {
      canonical: `https://pixelart-editor.vercel.app/dashboard/${params.slug}`,
    },
    openGraph: {
      title: `${project.name} | Pixel Art Editor`,
      description: `Check out this pixel art: ${project.name}`,
      images: [project.preview],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.name,
      description: `View this pixel art project on Pixel Art Editor.`,
      images: [project.preview],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const project = await getProject(params.slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter">{project.name}</h1>
          <p className="text-sm opacity-40 uppercase tracking-widest">Created on {project.date} • {project.gridSize}x{project.gridSize} Canvas</p>
        </header>

        <div className="border border-border bg-panel/30 aspect-square max-w-2xl mx-auto flex items-center justify-center p-8">
          <img 
            src={project.preview} 
            alt={project.name} 
            className="w-full h-full object-contain [image-rendering:pixelated] shadow-2xl"
          />
        </div>

        <div className="flex justify-center gap-4">
          <a 
            href={`/editor?id=${project.id}`}
            className="px-8 py-3 bg-foreground text-background font-bold uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Open in Editor
          </a>
        </div>
      </div>
    </div>
  );
}

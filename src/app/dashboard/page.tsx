import { Metadata } from 'next';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'My Projects',
  description: 'Manage your pixel art creations, organize them into folders, and start new designs in a premium dark-themed environment.',
  openGraph: {
    title: 'My Projects | Pixel Art Editor',
    description: 'Manage and organize your pixel art creations.',
  }
};

export default function ProjectsPage() {
  // We removed the server-side fetch here because in a serverless environment (like Vercel),
  // database connections and cold starts can block the initial page load, making the transition
  // feel slow. By making this a pure client-side load with an instant shell, the app feels much more responsive.
  return <ProjectsClient initialProjects={[]} initialFolders={[]} />;
}

import { HeroSection } from '@/components/landing/HeroSection';
import { Navbar } from '@/components/landing/Navbar';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import components below the fold to improve initial load and smoothness
const FeatureGrid = dynamic(() => import('@/components/landing/FeatureGrid').then(mod => mod.FeatureGrid));
const ShowcaseSection = dynamic(() => import('@/components/landing/ShowcaseSection').then(mod => mod.ShowcaseSection));
const RoadmapSection = dynamic(() => import('@/components/landing/RoadmapSection').then(mod => mod.RoadmapSection));
const CTASection = dynamic(() => import('@/components/landing/CTASection').then(mod => mod.CTASection));
const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => mod.Footer));

export const metadata: Metadata = {
  title: 'PIXEL.ART',
  description: 'A premium, dark-themed pixel art editor and animator built for designers and artists. Create, animate, and export your pixel art with ease.',
  openGraph: {
    title: 'PIXEL.ART',
    description: 'A premium, dark-themed pixel art editor and animator built for designers and artists. Create, animate, and export your pixel art with ease.',
    url: 'https://pixelart-merlin.vercel.app',
    siteName: 'PIXEL.ART',
    images: [
      {
        url: '/landing-preview.png',
        width: 1200,
        height: 630,
        alt: 'PIXEL.ART Workspace Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PIXEL.ART',
    description: 'A premium, dark-themed pixel art editor and animator built for designers and artists. Create, animate, and export your pixel art with ease.',
    images: ['/landing-preview.png'],
  },
};

export default function HomePage() {
  return (
    <main className="bg-background min-h-screen dark text-foreground">
      <Navbar />
      <HeroSection />
      <FeatureGrid />
      <ShowcaseSection />
      <RoadmapSection />
      <CTASection />
      <Footer />
    </main>
  );
}

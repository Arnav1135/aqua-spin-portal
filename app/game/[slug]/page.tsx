import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { GamePlayer } from '@/components/GamePlayer';
import Link from 'next/link';
import { ArrowLeft, Gamepad2, Info } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 60;

type Props = {
  params: { slug: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: game } = await supabase
    .from('games')
    .select('title, description, thumbnail_url')
    .eq('slug', params.slug)
    .single();

  if (!game) return { title: 'Game Not Found - Aqua Spin' };

  return {
    title: `${game.title} - Aqua Spin`,
    description: game.description || `Play ${game.title} on Aqua Spin`,
    openGraph: {
      title: game.title,
      description: game.description || `Play ${game.title} on Aqua Spin`,
      images: game.thumbnail_url ? [game.thumbnail_url] : [],
    },
  };
}

export default async function GamePage({ params }: Props) {
  const supabase = await createClient();
  
  const { data: game } = await supabase
    .from('games')
    .select('*, developers(studio_name)')
    .eq('slug', params.slug)
    .single();

  if (!game || game.status !== 'approved') {
    notFound();
  }

  // Server-side security check: Prevent rendering if iframe_url lacks https
  if (!game.iframe_url?.startsWith('https://')) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
        <div className="bg-red-950/30 border border-red-500/50 p-6 rounded-xl max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Security Violation</h1>
          <p className="text-neutral-300 text-sm">
            This game cannot be loaded because its origin violates platform security policies. (HTTPS required)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-cyan-500/30 pb-12">
      <header className="border-b border-white/10 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Catalog
            </Link>
          </div>
          <Link href="/" className="flex items-center gap-2 group">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <span className="font-bold tracking-tight">Aqua Spin</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">{game.title}</h1>
          <p className="text-neutral-400 flex items-center gap-2">
            By <span className="text-white font-medium">{game.developers?.studio_name || 'Unknown Studio'}</span>
            <span className="w-1 h-1 bg-neutral-600 rounded-full" />
            <span className="text-cyan-400">{game.category}</span>
          </p>
        </div>

        {/* The Sandbox Player */}
        <GamePlayer title={game.title} iframeUrl={game.iframe_url} />

        <div className="mt-8 bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" /> About this Game
          </h2>
          <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {game.description || 'No description provided.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {game.tags?.map((tag: string) => (
              <span key={tag} className="text-xs bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// Temporary import for the error state above
import { AlertTriangle } from 'lucide-react';

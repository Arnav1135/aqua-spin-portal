import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 60;

type Props = {
  params: { category: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = decodeURIComponent(params.category);
  // Capitalize first letter
  const title = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${title} Games - Aqua Spin`,
    description: `Play the best ${category} games on Aqua Spin`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const supabase = await createClient();
  const category = decodeURIComponent(params.category);
  
  const { data: games, error } = await supabase
    .from('games')
    .select('id, title, slug, thumbnail_url, category')
    .eq('status', 'approved')
    .ilike('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching category games:', error);
  }

  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <main className="min-h-screen bg-neutral-950 text-white selection:bg-cyan-500/30">
      <header className="border-b border-white/10 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back Home
            </Link>
            <Link 
              href="/developer" 
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors ml-4"
            >
              Developer Portal
            </Link>
          </div>
          <Link href="/" className="flex items-center gap-2 group">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <span className="font-bold tracking-tight">Aqua Spin</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 border-b border-white/10 pb-4">
          <h1 className="text-4xl font-bold mb-2">{displayCategory} Games</h1>
          <p className="text-neutral-400">Discover all {displayCategory.toLowerCase()} games approved for Aqua Spin.</p>
        </div>

        {games && games.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <Link key={game.id} href={`/game/${game.slug}`} className="group">
                <div className="aspect-[4/3] rounded-2xl bg-neutral-900 overflow-hidden relative border border-white/5 group-hover:border-cyan-500/30 transition-all shadow-lg group-hover:shadow-cyan-500/10">
                  {game.thumbnail_url ? (
                    <img 
                      src={game.thumbnail_url} 
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                      <Gamepad2 className="w-12 h-12 text-neutral-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <h2 className="font-semibold text-lg leading-tight mb-1">{game.title}</h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-neutral-500 border border-dashed border-neutral-800 rounded-3xl">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No games found in this category.</p>
          </div>
        )}
      </div>
    </main>
  );
}

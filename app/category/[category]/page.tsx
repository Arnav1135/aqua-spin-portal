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
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: games, error } = await supabase
    .from('games')
    .select('id, title, slug, thumbnail_url, category, developers(id, studio_name), reviews(rating)')
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
            {user && (
              <Link 
                href="/favorites" 
                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors ml-4"
              >
                My Favorites
              </Link>
            )}
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
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <h2 className="font-semibold text-lg leading-tight mb-1 truncate">{game.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full uppercase tracking-wider">
                        {game.category}
                      </span>
                      {(game.reviews as any[])?.length > 0 && (
                        <span className="flex items-center gap-1 text-xs font-medium text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          {((game.reviews as any[]).reduce((sum, r) => sum + r.rating, 0) / (game.reviews as any[]).length).toFixed(1)}
                        </span>
                      )}
                    </div>
                    {game.developers && (
                      <span className="text-xs text-neutral-400 truncate block mt-2">
                        By {(game.developers as any).studio_name}
                      </span>
                    )}
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

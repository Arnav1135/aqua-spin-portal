import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Gamepad2, Search } from 'lucide-react';

export const revalidate = 60; // Revalidate the page every 60 seconds

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = await createClient();
  const query = searchParams?.q || '';

  let request = supabase
    .from('games')
    .select('id, title, slug, thumbnail_url, category, developers(id, studio_name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(24);

  if (query) {
    // We use the tsvector column 'fts' via Supabase textSearch for high performance
    request = request.textSearch('fts', query, {
      type: 'websearch',
      config: 'english'
    });
  }

  const { data: games, error } = await request;

  if (error) {
    console.error('Error fetching games:', error);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white selection:bg-cyan-500/30">
      <header className="border-b border-white/10 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-cyan-500/10 p-2 rounded-xl group-hover:bg-cyan-500/20 transition-colors">
              <Gamepad2 className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="font-bold text-xl tracking-tight">Aqua Spin</span>
          </Link>

          <div className="flex items-center gap-4">
            <form className="relative hidden md:block w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input 
                name="q"
                defaultValue={query}
                type="text" 
                placeholder="Search for games..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-neutral-600"
              />
            </form>
            <Link 
              href="/developer" 
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Developer Portal
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            {query ? `Search results for "${query}"` : 'Featured Games'}
          </h1>
        </div>

        {games && games.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <Link key={game.id} href={`/game/${game.slug}`} className="group">
                <div className="aspect-[4/3] rounded-2xl bg-neutral-900 overflow-hidden relative border border-white/5 group-hover:border-cyan-500/30 transition-all shadow-lg group-hover:shadow-cyan-500/10">
                  {game.thumbnail_url ? (
                    // Using standard img tag here, next/image would require configuring remote patterns in next.config.js
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
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full uppercase tracking-wider">
                        {game.category}
                      </span>
                      {game.developers && (
                        <span className="text-xs text-neutral-400 truncate max-w-[120px]">
                          By {game.developers.studio_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-neutral-500 border border-dashed border-neutral-800 rounded-3xl">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No games found.</p>
          </div>
        )}
      </div>
    </main>
  );
}

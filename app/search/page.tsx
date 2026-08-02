import { createClient } from '@/utils/supabase/server';
import { GameCard } from '@/components/GameCard';
import { Header } from '@/components/Header';
import { Search } from 'lucide-react';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';
  const supabase = await createClient();

  // Search logic: match title or developer studio_name
  // Using Supabase text search or simple ilike
  let games = [];
  
  if (query) {
    const { data } = await supabase
      .from('games')
      .select('*, developers!inner(studio_name), reviews(rating)')
      .eq('status', 'approved')
      .or(`title.ilike.%${query}%,developers.studio_name.ilike.%${query}%`);
      
    games = data || [];
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-cyan-500/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8 border-b border-neutral-800 pb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-neutral-400">
            {query ? (
              <>Showing results for "<span className="text-white font-medium">{query}</span>"</>
            ) : (
              'Enter a search term to find games or studios.'
            )}
          </p>
        </div>

        {games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard 
                key={game.id} 
                game={game as any} 
                studioName={(game.developers as any)?.studio_name || 'Unknown'} 
              />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-20 bg-neutral-900/30 border border-neutral-800 rounded-3xl">
            <Search className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No results found</h3>
            <p className="text-neutral-500">We couldn't find anything matching "{query}".</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Gamepad2, ArrowLeft, Heart } from 'lucide-react';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';

export const metadata: Metadata = {
  title: 'My Favorites - Aqua Spin',
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the user's favorite games
  // We join through the favorites table to games, and then to developers
  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      game_id,
      games (
        id, 
        title, 
        slug, 
        thumbnail_url, 
        category,
        developers (id, studio_name),
        reviews (rating)
      )
    `)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  // Extract the games array from the favorites join
  // Since games is technically a many-to-one relationship from favorites (a favorite has one game), 
  // it returns an object or array of objects.
  const games = favorites?.map(f => f.games).filter(Boolean) as any[];

  return (
    <main className="min-h-screen bg-neutral-950 text-white selection:bg-cyan-500/30">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-current" />
          <div>
            <h1 className="text-4xl font-bold mb-1">My Favorites</h1>
            <p className="text-neutral-400">Your personal collection of saved games.</p>
          </div>
        </div>

        {games && games.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game: any) => (
              <GameCard 
                key={game.id} 
                game={game} 
                studioName={game.developers?.studio_name || 'Unknown'} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-neutral-500 border border-dashed border-neutral-800 rounded-3xl">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>You haven't favorited any games yet.</p>
            <Link href="/" className="inline-block mt-4 text-cyan-400 hover:text-cyan-300">
              Browse the catalog
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

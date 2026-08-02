import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';

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
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 border-b border-white/10 pb-4">
          <h1 className="text-4xl font-bold mb-2">{displayCategory} Games</h1>
          <p className="text-neutral-400">Discover all {displayCategory.toLowerCase()} games approved for Aqua Spin.</p>
        </div>

        {games && games.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                studioName={game.developers?.studio_name || 'Unknown'} 
              />
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

import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { GamePlayer } from '@/components/GamePlayer';
import Link from 'next/link';
import { ArrowLeft, Gamepad2, Info } from 'lucide-react';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';

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
    .select('*, developers(id, studio_name)')
    .eq('slug', params.slug)
    .single();

  if (!game || game.status !== 'approved') {
    notFound();
  }

  // Check if current user has favorited this game
  const { data: { user } } = await supabase.auth.getUser();
  let isFavorited = false;
  let userReview = null;
  
  if (user) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('game_id', game.id)
      .single();
    if (fav) {
      isFavorited = true;
    }
  }

  // Fetch all reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(email)')
    .eq('game_id', game.id)
    .order('created_at', { ascending: false });

  let averageRating = 0;
  if (reviews && reviews.length > 0) {
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    averageRating = total / reviews.length;
    
    if (user) {
      userReview = reviews.find(r => r.user_id === user.id) || null;
    }
  }

  const toggleFavorite = async () => {
    'use server';
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Silent fail if not logged in

    if (isFavorited) {
      // Remove favorite
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('game_id', game.id);
    } else {
      // Add favorite
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, game_id: game.id });
    }
    
    // Revalidate the page
    const { revalidatePath } = require('next/cache');
    revalidatePath(`/game/${game.slug}`);
  };

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
      <Header />

      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{game.title}</h1>
            <p className="text-neutral-400 flex items-center gap-2">
              By {game.developers ? (
                <Link href={`/studio/${(game.developers as any).id}`} className="text-white font-medium hover:text-cyan-400 hover:underline transition-colors">
                  {(game.developers as any).studio_name}
                </Link>
              ) : (
                <span className="text-white font-medium">Unknown Studio</span>
              )}
              <span className="w-1 h-1 bg-neutral-600 rounded-full" />
              <span className="text-cyan-400">{game.category}</span>
              {reviews && reviews.length > 0 && (
                <>
                  <span className="w-1 h-1 bg-neutral-600 rounded-full" />
                  <span className="flex items-center gap-1 text-yellow-400 font-medium">
                    <Star className="w-4 h-4 fill-current" />
                    {averageRating.toFixed(1)} <span className="text-neutral-500 font-normal">({reviews.length})</span>
                  </span>
                </>
              )}
            </p>
          </div>

          {user && (
            <form action={toggleFavorite}>
              <button 
                type="submit"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isFavorited 
                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' 
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Favorited' : 'Favorite'}
              </button>
            </form>
          )}
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

        {/* Report Button */}
        <div className="flex justify-end">
          <ReportForm gameId={game.id} />
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Player Reviews</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">
                      {(review.profiles as any)?.email?.split('@')[0] || 'Anonymous'}
                    </div>
                    <div className="flex gap-0.5 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-neutral-700'}`} />
                      ))}
                    </div>
                  </div>
                  {review.content && (
                    <p className="text-neutral-300 text-sm mt-2">{review.content}</p>
                  )}
                  <div className="text-xs text-neutral-500 mt-3">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-neutral-500 bg-neutral-900/30 rounded-xl border border-dashed border-neutral-800">
                <p>No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>

          {user && (
            <ReviewForm 
              gameId={game.id} 
              initialRating={userReview?.rating || 0}
              initialContent={userReview?.content || ''}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Temporary import for the error state above
import { AlertTriangle, Heart, Star } from 'lucide-react';
import { ReviewForm } from '@/components/ReviewForm';
import { ReportForm } from '@/components/ReportForm';

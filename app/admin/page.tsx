import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Gamepad2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function AdminReviewQueue() {
  const supabase = await createClient();

  // Fetch games pending review
  // Join developers table to get the studio name
  const { data: games } = await supabase
    .from('games')
    .select('*, developers(studio_name)')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true });

  const approveGame = async (formData: FormData) => {
    'use server';
    const gameId = formData.get('game_id') as string;
    const supabase = await createClient();
    
    await supabase
      .from('games')
      .update({ status: 'approved' })
      .eq('id', gameId);
      
    revalidatePath('/admin');
    revalidatePath('/'); // refresh homepage cache
  };

  const rejectGame = async (formData: FormData) => {
    'use server';
    const gameId = formData.get('game_id') as string;
    const supabase = await createClient();
    
    await supabase
      .from('games')
      .update({ status: 'rejected' })
      .eq('id', gameId);
      
    revalidatePath('/admin');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-red-100">Review Queue</h1>
        <p className="text-red-300/60">Review and approve game submissions.</p>
      </div>

      <div className="flex flex-col gap-6">
        {games && games.length > 0 ? (
          games.map((game) => (
            <div key={game.id} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
              
              {/* Game Thumbnail & Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  {game.thumbnail_url ? (
                    <img src={game.thumbnail_url} alt="" className="w-16 h-16 rounded-xl object-cover bg-neutral-800" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-neutral-800 flex items-center justify-center">
                      <Gamepad2 className="w-8 h-8 text-neutral-500" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{game.title}</h2>
                    <p className="text-neutral-400 text-sm">
                      By {game.developers?.studio_name || 'Unknown'} 
                      <span className="mx-2">•</span> 
                      <span className="text-cyan-400 capitalize">{game.category}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-4">
                  <p className="text-neutral-300 text-sm leading-relaxed mb-3">
                    {game.description || 'No description provided.'}
                  </p>
                  <a 
                    href={game.iframe_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Inspect Source URL
                  </a>
                </div>
                
                <div className="flex gap-2">
                  {game.tags?.map((tag: string) => (
                    <span key={tag} className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-3 justify-center md:border-l border-neutral-800 md:pl-6">
                <form action={approveGame}>
                  <input type="hidden" name="game_id" value={game.id} />
                  <button className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg px-6 py-3 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Approve
                  </button>
                </form>

                <form action={rejectGame}>
                  <input type="hidden" name="game_id" value={game.id} />
                  <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-lg px-6 py-3 transition-colors border border-red-500/20 flex items-center justify-center gap-2">
                    <XCircle className="w-5 h-5" /> Reject
                  </button>
                </form>
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-neutral-900/30 border border-dashed border-neutral-800 rounded-3xl">
            <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Queue is empty</h3>
            <p className="text-neutral-500">There are no pending games to review.</p>
          </div>
        )}
      </div>
    </div>
  );
}

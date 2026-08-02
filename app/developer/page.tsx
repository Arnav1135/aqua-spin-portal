import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { PlusCircle, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export default async function DeveloperDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check profile
  const { data: profile } = await supabase
    .from('developers')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/developer/onboarding');
  }

  // Fetch their games
  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('developer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Welcome back, {profile.studio_name}</h1>
          <p className="text-neutral-400">Manage your published and pending games.</p>
        </div>
        <Link 
          href="/developer/submit" 
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg px-4 py-2 transition-colors flex items-center gap-2 self-start"
        >
          <PlusCircle className="w-5 h-5" /> Submit New Game
        </Link>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
        {games && games.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-sm text-neutral-400 bg-neutral-900/80">
                <th className="px-6 py-4 font-medium">Game Title</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Submitted On</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id} className="border-b border-neutral-800/50 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {game.thumbnail_url ? (
                        <img src={game.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-neutral-800" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                          <Gamepad2 className="w-5 h-5 text-neutral-500" />
                        </div>
                      )}
                      <span className="font-medium">{game.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-300 capitalize">{game.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      game.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      game.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {game.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-400 text-sm">
                    {new Date(game.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-20 px-4">
            <Gamepad2 className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-300 mb-2">No games yet</h3>
            <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
              You haven't submitted any games to the platform yet. Start building your catalog today!
            </p>
            <Link 
              href="/developer/submit" 
              className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg px-4 py-2 transition-colors border border-neutral-700 inline-block"
            >
              Submit Your First Game
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

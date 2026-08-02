import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Gamepad2, Users, Eye, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// Simple string hash to generate consistent mock data per game
const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch approved games
  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('developer_id', user.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (!games || games.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">Analytics Overview</h1>
        <p className="text-neutral-400 mb-8">Track your games' performance across the platform.</p>
        
        <div className="text-center py-20 px-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
          <TrendingUp className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-300 mb-2">No Active Games</h3>
          <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
            You don't have any approved games on the platform yet. Submit a game to start seeing analytics!
          </p>
          <Link 
            href="/developer/submit" 
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg px-4 py-2 transition-colors inline-block"
          >
            Submit a Game
          </Link>
        </div>
      </div>
    );
  }

  // Generate Mock Data
  let totalViews = 0;
  let totalPlayers = 0;
  let totalRevenue = 0;

  const gamesWithAnalytics = games.map(game => {
    const seed = hashString(game.id);
    const views = (seed % 49000) + 1000; // 1,000 to 50,000 views
    const players = Math.floor(views * ((seed % 10 + 5) / 100)); // 5% to 15% conversion
    const revenue = views * 0.005; // half a cent per view

    totalViews += views;
    totalPlayers += players;
    totalRevenue += revenue;

    return {
      ...game,
      metrics: { views, players, revenue }
    };
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Analytics Overview</h1>
        <p className="text-neutral-400">Track your games' performance across the platform.</p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Eye className="w-16 h-16 text-cyan-400" />
          </div>
          <p className="text-neutral-400 font-medium mb-1 relative z-10">Total Impressions</p>
          <h2 className="text-4xl font-bold text-white relative z-10">{totalViews.toLocaleString()}</h2>
        </div>
        
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Users className="w-16 h-16 text-emerald-400" />
          </div>
          <p className="text-neutral-400 font-medium mb-1 relative z-10">Total Active Players</p>
          <h2 className="text-4xl font-bold text-white relative z-10">{totalPlayers.toLocaleString()}</h2>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <DollarSign className="w-16 h-16 text-yellow-400" />
          </div>
          <p className="text-neutral-400 font-medium mb-1 relative z-10">Estimated Revenue</p>
          <h2 className="text-4xl font-bold text-white relative z-10">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>
      </div>

      {/* Per Game Analytics */}
      <h2 className="text-xl font-bold mb-6">Game Performance</h2>
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-sm text-neutral-400 bg-neutral-900/80">
              <th className="px-6 py-4 font-medium">Game Title</th>
              <th className="px-6 py-4 font-medium">Impressions</th>
              <th className="px-6 py-4 font-medium">Players</th>
              <th className="px-6 py-4 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {gamesWithAnalytics.map((game) => (
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
                <td className="px-6 py-4 text-neutral-300">
                  {game.metrics.views.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-neutral-300">
                  {game.metrics.players.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-emerald-400 font-medium">
                  ${game.metrics.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <p className="text-sm text-amber-400 flex items-center gap-2">
          <strong>Note:</strong> These metrics are currently mock data for demonstration purposes in Phase 10.
        </p>
      </div>
    </div>
  );
}

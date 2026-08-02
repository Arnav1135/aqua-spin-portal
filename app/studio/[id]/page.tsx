import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Gamepad2, Globe, Mail, ArrowLeft, Building2 } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 60;

type Props = {
  params: { id: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: developer } = await supabase
    .from('developers')
    .select('studio_name')
    .eq('id', params.id)
    .single();

  if (!developer) return { title: 'Studio Not Found - Aqua Spin' };

  return {
    title: `${developer.studio_name} - Aqua Spin`,
    description: `Play games by ${developer.studio_name} on Aqua Spin`,
  };
}

export default async function StudioPage({ params }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: developer, error: devError } = await supabase
    .from('developers')
    .select('*')
    .eq('id', params.id)
    .single();

  if (devError || !developer) {
    notFound();
  }

  // Fetch their published games
  const { data: games } = await supabase
    .from('games')
    .select('id, title, slug, thumbnail_url, category, reviews(rating)')
    .eq('developer_id', params.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

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
          </div>
          <Link href="/" className="flex items-center gap-2 group">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <span className="font-bold tracking-tight">Aqua Spin</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Studio Header */}
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-neutral-800 rounded-2xl flex items-center justify-center border border-white/5">
              <Building2 className="w-10 h-10 text-neutral-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{developer.studio_name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-neutral-400 text-sm">
                <span>{games?.length || 0} Games Published</span>
                
                {developer.website_url && (
                  <>
                    <span className="w-1 h-1 bg-neutral-700 rounded-full" />
                    <a href={developer.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                      <Globe className="w-4 h-4" /> Website
                    </a>
                  </>
                )}
                
                {developer.contact_email && (
                  <>
                    <span className="w-1 h-1 bg-neutral-700 rounded-full" />
                    <a href={`mailto:${developer.contact_email}`} className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                      <Mail className="w-4 h-4" /> Contact
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold">Games by {developer.studio_name}</h2>
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-neutral-500 border border-dashed border-neutral-800 rounded-3xl">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>This studio hasn't published any approved games yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}

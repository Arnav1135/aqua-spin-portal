import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Gamepad2, Globe, Mail, ArrowLeft, Building2 } from 'lucide-react';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';

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
      <Header />

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
              <GameCard 
                key={game.id} 
                game={game} 
                studioName={developer.studio_name || 'Unknown'} 
              />
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

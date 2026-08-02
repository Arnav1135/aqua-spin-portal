import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Gamepad2, LogOut, Upload, LayoutDashboard, BarChart3 } from 'lucide-react';

export default async function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if they have a developer profile
  const { data: profile } = await supabase
    .from('developers')
    .select('id, studio_name')
    .eq('id', user.id)
    .single();

  // Check their role
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-cyan-500/30 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/10 bg-neutral-900/30 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 group">
            <Gamepad2 className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="font-bold tracking-tight">Aqua Spin</span>
          </Link>
        </div>
        
        <div className="flex-1 py-6 px-4 flex flex-col gap-2">
          {profile ? (
            <>
              <Link href="/developer" className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/developer/submit" className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors">
                <Upload className="w-4 h-4" /> Submit Game
              </Link>
              <Link href="/developer/analytics" className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors">
                <BarChart3 className="w-4 h-4" /> Analytics
              </Link>
            </>
          ) : (
            <div className="px-4 py-3 text-sm text-neutral-500">
              Complete onboarding to unlock dashboard.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          {userProfile?.role === 'admin' && (
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left font-medium">
              Admin Portal
            </Link>
          )}
          <form action="/auth/signout" method="POST">
            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-16 border-b border-white/10 bg-neutral-900/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 md:hidden">
           <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <span className="font-bold tracking-tight">Aqua Spin</span>
          </Link>
        </header>
        
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

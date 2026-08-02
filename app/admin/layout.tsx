import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, LogOut, LayoutList, CheckCircle } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if they are an admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    // If they aren't an admin, pretend this route doesn't exist to prevent enumeration
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-cyan-500/30 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-red-500/20 bg-neutral-900/30 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-red-500/20">
          <Link href="/" className="flex items-center gap-2 group">
            <ShieldCheck className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-tight text-red-100">Admin Control</span>
          </Link>
        </div>
        
        <div className="flex-1 py-6 px-4 flex flex-col gap-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-300 hover:text-white hover:bg-red-500/10 transition-colors">
            <LayoutList className="w-4 h-4" /> Review Queue
          </Link>
          <Link href="/developer" className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors mt-auto">
            <CheckCircle className="w-4 h-4" /> Back to Portal
          </Link>
        </div>

        <div className="p-4 border-t border-red-500/20">
          <form action="/auth/signout" method="POST">
            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <header className="h-16 border-b border-red-500/20 bg-neutral-900/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 md:hidden">
           <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <span className="font-bold tracking-tight">Admin</span>
          </Link>
        </header>
        
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { SearchBar } from './SearchBar';

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="border-b border-white/10 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <Gamepad2 className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span className="font-bold tracking-tight hidden sm:block">Aqua Spin</span>
        </Link>
        
        <div className="flex-1 flex justify-center">
          <SearchBar />
        </div>

        <nav className="flex items-center gap-4 text-sm font-medium">
          {user ? (
            <>
              <Link href="/favorites" className="text-neutral-400 hover:text-white transition-colors">
                Favorites
              </Link>
              <Link href="/developer" className="text-neutral-400 hover:text-white transition-colors">
                Developer Portal
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-neutral-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/login" className="bg-white text-black px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors">
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

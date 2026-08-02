import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Gamepad2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return redirect('/developer');
  }

  const signIn = async (formData: FormData) => {
    'use server';
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return redirect('/login?message=Could not authenticate user');
    }
    return redirect('/developer');
  };

  const signUp = async (formData: FormData) => {
    'use server';
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      return redirect('/login?message=Could not sign up user');
    }
    return redirect('/login?message=Check email to continue sign in process');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <Gamepad2 className="w-8 h-8 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="font-bold tracking-tight text-2xl">Aqua Spin</span>
          </Link>
          <h1 className="text-2xl font-semibold">Developer Portal</h1>
          <p className="text-neutral-400 text-sm mt-2">Sign in to manage your games</p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 backdrop-blur-md">
          <form className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1" htmlFor="email">
                Email
              </label>
              <input
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1" htmlFor="password">
                Password
              </label>
              <input
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <button
                formAction={signIn}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg px-4 py-2 transition-colors"
              >
                Sign In
              </button>
              <button
                formAction={signUp}
                className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg px-4 py-2 transition-colors border border-neutral-700"
              >
                Sign Up
              </button>
            </div>

            {searchParams?.message && (
              <div className="mt-4 p-3 bg-red-950/30 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{searchParams.message}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Building2, Save } from 'lucide-react';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // If they already have a profile, skip onboarding
  const { data: profile } = await supabase
    .from('developers')
    .select('id')
    .eq('id', user.id)
    .single();

  if (profile) {
    redirect('/developer');
  }

  const createProfile = async (formData: FormData) => {
    'use server';
    const studio_name = formData.get('studio_name') as string;
    const website_url = formData.get('website_url') as string;
    const contact_email = formData.get('contact_email') as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from('developers').insert({
      id: user.id, // Explicitly linking the profile to the auth.uid
      studio_name,
      website_url,
      contact_email
    });

    if (error) {
      console.error(error);
      return redirect('/developer/onboarding?error=creation_failed');
    }

    redirect('/developer');
  };

  return (
    <div className="max-w-xl mx-auto mt-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-cyan-400" />
          Setup Developer Profile
        </h1>
        <p className="text-neutral-400">
          Create your studio profile before submitting games to Aqua Spin.
        </p>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 backdrop-blur-md">
        <form action={createProfile} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Studio Name <span className="text-red-500">*</span></label>
            <input
              name="studio_name"
              required
              placeholder="e.g. Pixel Pioneers"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Contact Email <span className="text-red-500">*</span></label>
            <input
              name="contact_email"
              type="email"
              defaultValue={user.email}
              required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Website URL</label>
            <input
              name="website_url"
              type="url"
              placeholder="https://yourstudio.com"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          
          <button className="mt-4 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg px-4 py-3 transition-colors flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
}

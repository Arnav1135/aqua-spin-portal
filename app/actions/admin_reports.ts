'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function dismissReport(reportId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('takedown_requests')
    .update({ status: 'dismissed' })
    .eq('id', reportId);

  if (error) {
    console.error('Error dismissing report:', error);
    return { error: 'Failed to dismiss report.' };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function suspendGame(reportId: string, gameId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  // 1. Suspend the game
  const { error: gameError } = await supabase
    .from('games')
    .update({ status: 'suspended' })
    .eq('id', gameId);

  if (gameError) {
    console.error('Error suspending game:', gameError);
    return { error: 'Failed to suspend game.' };
  }

  // 2. Mark report as resolved
  const { error: reportError } = await supabase
    .from('takedown_requests')
    .update({ status: 'resolved' })
    .eq('id', reportId);

  if (reportError) {
    console.error('Error updating report status:', reportError);
  }

  revalidatePath('/admin');
  return { success: true };
}

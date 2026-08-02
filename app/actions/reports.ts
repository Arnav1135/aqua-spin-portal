'use server';

import { createClient } from '@/utils/supabase/server';

export async function submitReport(gameId: string, email: string, reason: string, description: string) {
  const supabase = await createClient();

  if (!email || !reason) {
    return { error: 'Email and Reason are required.' };
  }

  const { error } = await supabase
    .from('takedown_requests')
    .insert({
      game_id: gameId,
      reporter_email: email,
      reason,
      description: description || null
    });

  if (error) {
    console.error('Error submitting report:', error);
    return { error: 'Failed to submit report. Please try again later.' };
  }

  return { success: true };
}

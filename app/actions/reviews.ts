'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitReview(gameId: string, rating: number, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to leave a review.' };
  }

  if (rating < 1 || rating > 5) {
    return { error: 'Invalid rating.' };
  }

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single();

  if (existingReview) {
    // Update existing
    const { error } = await supabase
      .from('reviews')
      .update({ rating, content: content.trim() })
      .eq('id', existingReview.id);

    if (error) {
      console.error('Error updating review:', error);
      return { error: 'Failed to update review.' };
    }
  } else {
    // Insert new
    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        game_id: gameId,
        rating,
        content: content.trim()
      });

    if (error) {
      console.error('Error inserting review:', error);
      return { error: 'Failed to submit review.' };
    }
  }

  // Find the game slug to revalidate the page
  const { data: game } = await supabase
    .from('games')
    .select('slug')
    .eq('id', gameId)
    .single();

  if (game) {
    revalidatePath(`/game/${game.slug}`);
  }

  return { success: true };
}

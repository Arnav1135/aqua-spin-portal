'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { submitReview } from '@/app/actions/reviews';

type Props = {
  gameId: string;
  initialRating?: number;
  initialContent?: string;
};

export function ReviewForm({ gameId, initialRating = 0, initialContent = '' }: Props) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setMessage('Please select a star rating.');
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const result = await submitReview(gameId, rating, content);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage('Review submitted successfully!');
      }
    } catch (err) {
      setMessage('An error occurred while submitting your review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6 mt-8">
      <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
      
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-neutral-600'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-neutral-400">
          {rating > 0 ? `${rating} out of 5 stars` : 'Select a rating'}
        </span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What did you think of this game? (Optional)"
        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-neutral-600 min-h-[100px] mb-4"
        maxLength={500}
      />

      <div className="flex items-center justify-between">
        <span className={`text-sm ${message.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </span>
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="bg-cyan-500 hover:bg-cyan-400 text-neutral-950 px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}

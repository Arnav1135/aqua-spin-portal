import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';

type Game = {
  id: string;
  title: string;
  slug: string;
  thumbnail_url?: string | null;
  category: string;
  reviews?: { rating: number }[];
};

export function GameCard({ game, studioName }: { game: Game, studioName: string }) {
  let averageRating = null;
  if (game.reviews && game.reviews.length > 0) {
    const total = game.reviews.reduce((sum, r) => sum + r.rating, 0);
    averageRating = (total / game.reviews.length).toFixed(1);
  }

  return (
    <Link href={`/game/${game.slug}`} className="group">
      <div className="aspect-[4/3] rounded-2xl bg-neutral-900 overflow-hidden relative border border-white/5 group-hover:border-cyan-500/30 transition-all shadow-lg group-hover:shadow-cyan-500/10">
        {game.thumbnail_url ? (
          <img 
            src={game.thumbnail_url} 
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-800">
            <Gamepad2 className="w-12 h-12 text-neutral-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h2 className="font-semibold text-lg leading-tight mb-1 truncate">{game.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full uppercase tracking-wider">
              {game.category}
            </span>
            {averageRating && (
              <span className="flex items-center gap-1 text-xs font-medium text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {averageRating}
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-400 truncate max-w-[120px] block mt-2">
            By {studioName}
          </span>
        </div>
      </div>
    </Link>
  );
}

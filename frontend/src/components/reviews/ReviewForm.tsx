import * as React from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Review } from '@/types';

interface ReviewFormProps {
    productId: string;
    onSubmit: (review: Omit<Review, 'id' | 'date'>) => void;
    onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSubmit, onCancel }) => {
    const [rating, setRating] = React.useState(5);
    const [name, setName] = React.useState('');
    const [comment, setComment] = React.useState('');
    const [hoveredStar, setHoveredStar] = React.useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !comment.trim()) return;

        onSubmit({
            productId,
            userName: name,
            rating,
            comment
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Write a Review</h4>

            <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Rating</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(null)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star
                                size={24}
                                className={`transition-colors ${star <= (hoveredStar ?? rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground/30"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-muted/50 border border-border rounded p-2 text-sm focus:border-secondary outline-none transition-colors"
                    placeholder="Your name"
                />
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Review</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-muted/50 border border-border rounded p-2 text-sm focus:border-secondary outline-none transition-colors resize-none"
                    placeholder="Share your experience..."
                />
            </div>

            <div className="flex gap-3 pt-2">
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="outline"
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="flex-1 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-widest text-xs"
                >
                    Submit Review
                </Button>
            </div>
        </form>
    );
};

export default ReviewForm;

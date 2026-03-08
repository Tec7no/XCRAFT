import * as React from 'react';
import { Review } from '@/types';
import { Star, User } from 'lucide-react';

interface ReviewListProps {
    reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
                <p className="text-muted-foreground text-sm">No reviews yet. Be the first to share your thoughts!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0 animate-in fade-in">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                <User size={14} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">{review.userName}</p>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={10}
                                            className={star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.comment}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;

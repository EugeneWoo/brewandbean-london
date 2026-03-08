import type { RedditReview } from "@/data/coffeeShops";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, ArrowUpRight } from "lucide-react";

interface ShopRedditReviewsProps {
  reviews: RedditReview[];
  sentiment?: { summary: string; sources: string[] };
}

export function ShopRedditReviews({ reviews, sentiment }: ShopRedditReviewsProps) {
  if (reviews.length === 0 && !sentiment) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="font-heading text-xl">From Reddit</h2>
      </div>
      <div className="space-y-3">
        {reviews.map((review, i) => (
          <Card key={i} className="p-4 space-y-2.5 border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  {review.subreddit}
                </Badge>
                <span className="text-xs text-muted-foreground">u/{review.author}</span>
              </div>
              <span className="text-[11px] text-muted-foreground">{review.date}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground italic">
              "{review.quote}"
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ThumbsUp className="h-3 w-3" />
                <span>{review.score} upvotes</span>
              </div>
              <a
                href={review.threadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View thread
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </Card>
        ))}

        {sentiment && (
          <Card className="p-4 space-y-2.5 border-dashed border-border/60 bg-muted/20">
            <Badge variant="secondary" className="text-[10px]">
              Community sentiment
            </Badge>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {sentiment.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {sentiment.sources.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                  Source {i + 1}
                  <ArrowUpRight className="h-2.5 w-2.5" />
                </a>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

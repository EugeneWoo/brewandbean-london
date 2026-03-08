import { Badge } from "@/components/ui/badge";

interface ShopCommunityProps {
  communityReview: string;
  sentimentTags: string[];
}

export function ShopCommunity({ communityReview, sentimentTags }: ShopCommunityProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-xl">Community Insights</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{communityReview}</p>
      <div className="flex flex-wrap gap-1.5">
        {sentimentTags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs font-normal">
            {tag}
          </Badge>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground/70 italic">
        Based on community reviews from Google, Reddit, and local recommendations
      </p>
    </div>
  );
}

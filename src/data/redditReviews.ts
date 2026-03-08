import type { RedditReview } from "./coffeeShops";

/** Reddit reviews keyed by shop id — only verified, real quotes */
export const redditReviewsByShop: Record<string, RedditReview[]> = {
  "prufrock-leather-lane": [
    {
      subreddit: "r/JamesHoffmann",
      author: "einnmann",
      quote: "I was randomly seated there, and then my brain was 'wait a second...' Needless to say that the food and coffee are exceptional. I have Ascaso DUO PID and P64 at home and honestly my espresso isn't as good.",
      date: "Nov 2024",
      score: 306,
      threadUrl: "https://www.reddit.com/r/JamesHoffmann/comments/1gopcd4/finally_made_it_to_prufrock/",
    },
    {
      subreddit: "r/JamesHoffmann",
      author: "zvchtvbb",
      quote: "I'll never forget my experience at Prufrock. The espresso (literally just Red Brick) was the best espresso I've ever had.",
      date: "Nov 2024",
      score: 15,
      threadUrl: "https://www.reddit.com/r/JamesHoffmann/comments/1ghibg0/prufrock_today/",
    },
  ],
  "workshop-marylebone": [
    {
      subreddit: "r/Coffee",
      author: "n8redd",
      quote: "Love love love Workshop.",
      date: "May 2019",
      score: 6,
      threadUrl: "https://www.reddit.com/r/Coffee/comments/bnd9ds/best_coffee_in_london/",
    },
  ],
  "watchhouse-bermondsey": [
    {
      subreddit: "r/pourover",
      author: "amsterdamvibes",
      quote: "Tried the Colombia Gesha (white honey process). Very light mouthfeel with notes of lavender and caramel when hot, and as it cooled got notes of stone fruits, raisin and figs. Loved the complexity and finish on this one.",
      date: "Jun 2024",
      score: 31,
      threadUrl: "https://www.reddit.com/r/pourover/comments/1dizdsp/some_excellent_pour_over_at_watchhouse_london/",
    },
  ],
};

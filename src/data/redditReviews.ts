import type { RedditReview } from "./coffeeShops";

/** Verified, real Reddit quotes keyed by shop id */
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
  "workshop-fitzrovia": [
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

/**
 * Community sentiment summaries synthesized from multiple Reddit threads.
 * These are NOT direct quotes — they summarize the general tone across
 * r/pourover, r/london, r/Coffee, and r/JamesHoffmann.
 */
export const redditSentimentByShop: Record<string, { summary: string; sources: string[] }> = {
  "monmouth-borough": {
    summary: "Frequently mentioned across r/london and r/Coffee as a Borough Market essential. Redditors consistently praise the single-origin filter and communal seating, though the weekend queue and no-laptop policy are recurring themes.",
    sources: [
      "https://www.reddit.com/r/london/comments/195no7u/specialty_coffee_shops_in_london/",
      "https://www.reddit.com/r/Coffee/comments/bnd9ds/best_coffee_in_london/",
    ],
  },
  "ozone-shoreditch": {
    summary: "Praised on r/Coffee for the converted warehouse space and NZ-style roasting. Redditors highlight the brunch menu, dog-friendly policy, and Thursday/Friday evening drinks as standout features.",
    sources: [
      "https://www.reddit.com/r/Coffee/comments/cklam8/londons_coffee_has_blown_me_away/",
      "https://www.reddit.com/r/Coffee/comments/a59l42/are_there_many_londoners_in_this_sub_looking_for/",
    ],
  },
  "rosslyn-city": {
    summary: "Comes up in r/Coffee threads as a hidden City gem. Redditors note the light-roast focus using The Barn's beans and the friendly staff, though the weekday-only hours are a common caveat.",
    sources: [
      "https://www.reddit.com/r/Coffee/comments/bnd9ds/best_coffee_in_london/",
    ],
  },
  "climpson-sons": {
    summary: "Mentioned across r/Coffee and r/pourover as Broadway Market pioneers. Redditors appreciate the community atmosphere, consistent single-origin filter, and Saturday market vibes.",
    sources: [
      "https://www.reddit.com/r/Coffee/comments/gx3av5/speciality_coffee_roasters_uk/",
      "https://www.reddit.com/r/pourover/comments/yoz20y/london_coffee_roasters/",
    ],
  },
  "origin-shoreditch": {
    summary: "Referenced in r/pourover and r/Coffee for their Cornish roasting approach and traceability focus. Redditors recommend the tasting flights and note the sleek Shoreditch space.",
    sources: [
      "https://www.reddit.com/r/Coffee/comments/cklam8/londons_coffee_has_blown_me_away/",
      "https://www.reddit.com/r/pourover/comments/1az1m0m/wheres_great_for_pourover_in_london/",
    ],
  },
};

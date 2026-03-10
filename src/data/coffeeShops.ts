export { coffeeShops } from "./shops";

/** Chains that are excluded from "Independent Verified" status */
const EXCLUDED_CHAINS = [
  "costa", "caffe nero", "nero", "starbucks", "gails", "gail's",
  "blank street", "black sheep", "pret", "pret a manger", "greggs",
  "caffè nero", "coffee republic", "wild bean cafe",
];

/** Chain bakery/pastry shops excluded (indie bakery-cafés with specialty coffee are allowed) */
const EXCLUDED_BAKERIES = [
  "ole & steen", "ole and steen", "paul", "cornish bakehouse",
];

export interface RedditReview {
  subreddit: string;
  author: string;
  quote: string;
  date: string;
  score: number;
  threadUrl: string;
}

export interface VerificationInfo {
  totalLocations: number;
  googleRating: number;
  hasFullInfo: boolean;
}

export interface CoffeeShop {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  image: string;
  photos: string[];
  roaster: string;
  phone: string;
  website: string;
  instagram: string;
  isOpen: boolean;
  nextOpenTime?: string;
  hours: Record<string, string>;
  attributes: {
    kidsFriendly: boolean;
    laptopFriendly: boolean;
    sitIn: boolean;
    foodMenu: boolean;
    opensEarly: boolean;
    opensLate: boolean;
    specialtyCoffee: boolean;
    dogFriendly: boolean;
  };
  communityReview: string;
  sentimentTags: string[];
  nearestTransport: string[];
  verification: VerificationInfo;
  redditReviews?: RedditReview[];
}

export function isIndependentVerified(shop: CoffeeShop): boolean {
  const nameLower = shop.name.toLowerCase();
  const isChain = EXCLUDED_CHAINS.some((chain) => nameLower.includes(chain));
  const isBakery = EXCLUDED_BAKERIES.some((b) => nameLower.includes(b));
  if (isChain || isBakery) return false;
  if (shop.verification.totalLocations > 5) return false;
  if (shop.verification.googleRating < 4.0) return false;
  return true;
}

/** Chains that are excluded from "Independent Verified" status */
const EXCLUDED_CHAINS = [
  "costa", "caffe nero", "nero", "starbucks", "gails", "gail's",
  "blank street", "black sheep", "pret", "pret a manger", "greggs",
  "caffè nero", "coffee republic", "wild bean cafe",
];

export interface VerificationInfo {
  /** Total number of locations this brand operates */
  totalLocations: number;
  /** Average Google Places star rating (1–5) */
  googleRating: number;
  /** Whether sufficient attribute info is available (hours, wifi, food, pet/kids/laptop) */
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
}

/**
 * Determines whether a shop qualifies as "Independent Verified":
 * 1. Not a national chain
 * 2. Has ≤ 5 locations
 * 3. Google Places rating ≥ 4.0
 * 4. Sufficient info about the location
 */
export function isIndependentVerified(shop: CoffeeShop): boolean {
  const nameLower = shop.name.toLowerCase();
  const isChain = EXCLUDED_CHAINS.some(
    (chain) => nameLower.includes(chain)
  );
  if (isChain) return false;
  if (shop.verification.totalLocations > 5) return false;
  if (shop.verification.googleRating < 4.0) return false;
  if (!shop.verification.hasFullInfo) return false;
  return true;
}

export const coffeeShops: CoffeeShop[] = [
  {
    id: "monmouth-bermondsey",
    name: "Monmouth Coffee Company",
    address: "2 Park Street, SE1 9AB",
    neighborhood: "Borough",
    lat: 51.5055,
    lng: -0.0910,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
    ],
    roaster: "Monmouth (own roast)",
    phone: "+44 20 7232 3010",
    website: "https://monmouthcoffee.co.uk",
    instagram: "@monmouthcoffee",
    isOpen: true,
    hours: { Mon: "7:30–18:00", Tue: "7:30–18:00", Wed: "7:30–18:00", Thu: "7:30–18:00", Fri: "7:30–18:00", Sat: "9:00–17:30", Sun: "Closed" },
    attributes: { kidsFriendly: false, laptopFriendly: false, sitIn: true, foodMenu: true, opensEarly: true, opensLate: false, specialtyCoffee: true, dogFriendly: false },
    communityReview: "A Borough Market institution. Locals and coffee pilgrims alike queue patiently for what many consider London's finest flat white. The beans are roasted in-house and the single-origin filter options rotate seasonally. Reddit users frequently mention the communal wooden tables as a unique touch, though laptop use is discouraged. Expect a queue on weekends—regulars say it's absolutely worth the wait.",
    sentimentTags: ["Exceptional espresso", "Worth the queue", "Communal seating", "Single-origin gems"],
    nearestTransport: ["London Bridge (2 min)", "Borough (5 min)"],
    verification: { totalLocations: 3, googleRating: 4.5, hasFullInfo: true },
  },
  {
    id: "prufrock-leather-lane",
    name: "Prufrock Coffee",
    address: "23-25 Leather Lane, EC1N 7TE",
    neighborhood: "Clerkenwell",
    lat: 51.5210,
    lng: -0.1090,
    image: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=600&h=400&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop",
    ],
    roaster: "Square Mile Coffee Roasters",
    phone: "+44 20 7242 0467",
    website: "https://prufrockcoffee.com",
    instagram: "@prufrockcoffee",
    isOpen: true,
    hours: { Mon: "8:00–17:00", Tue: "8:00–17:00", Wed: "8:00–17:00", Thu: "8:00–17:00", Fri: "8:00–17:00", Sat: "10:00–17:00", Sun: "10:00–16:00" },
    attributes: { kidsFriendly: true, laptopFriendly: true, sitIn: true, foodMenu: true, opensEarly: true, opensLate: false, specialtyCoffee: true, dogFriendly: false },
    communityReview: "Founded by a World Barista Champion, Prufrock is where London's specialty coffee movement truly flourished. The spacious Leather Lane location offers excellent natural light and a welcoming atmosphere for both quick espressos and longer laptop sessions. Google reviewers consistently praise the exceptional pour-over menu and knowledgeable staff who genuinely love coffee.",
    sentimentTags: ["World-class baristas", "Pour-over excellence", "Laptop friendly", "Great natural light"],
    nearestTransport: ["Chancery Lane (3 min)", "Farringdon (5 min)"],
    verification: { totalLocations: 1, googleRating: 4.6, hasFullInfo: true },
  },
  {
    id: "ozone-shoreditch",
    name: "Ozone Coffee Roasters",
    address: "11 Leonard Street, EC2A 4AQ",
    neighborhood: "Shoreditch",
    lat: 51.5265,
    lng: -0.0838,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600&h=400&fit=crop",
    ],
    roaster: "Ozone (own roast)",
    phone: "+44 20 7490 1039",
    website: "https://ozonecoffee.co.uk",
    instagram: "@ozonecoffeeuk",
    isOpen: true,
    hours: { Mon: "7:00–17:00", Tue: "7:00–17:00", Wed: "7:00–17:00", Thu: "7:00–21:00", Fri: "7:00–21:00", Sat: "8:30–17:00", Sun: "9:00–17:00" },
    attributes: { kidsFriendly: true, laptopFriendly: true, sitIn: true, foodMenu: true, opensEarly: true, opensLate: true, specialtyCoffee: true, dogFriendly: true },
    communityReview: "A New Zealand import that has become a Shoreditch cornerstone. The converted warehouse space is stunning—exposed brick, industrial beams, and the roaster visible through glass. The brunch menu is destination-worthy, and Reddit users rave about the cold brew and seasonal espresso blends. Evenings bring a wine list and relaxed atmosphere. Dog owners particularly love the welcoming policy.",
    sentimentTags: ["Stunning space", "Brunch destination", "Dog friendly", "Evening drinks"],
    nearestTransport: ["Old Street (4 min)", "Shoreditch High Street (6 min)"],
    verification: { totalLocations: 2, googleRating: 4.4, hasFullInfo: true },
  },
  {
    id: "workshop-marylebone",
    name: "Workshop Coffee",
    address: "80A Mortimer Street, W1W 7FE",
    neighborhood: "Fitzrovia",
    lat: 51.5185,
    lng: -0.1395,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&h=400&fit=crop",
    ],
    roaster: "Workshop (own roast)",
    phone: "+44 20 7253 5754",
    website: "https://workshopcoffee.com",
    instagram: "@workshopcoffee",
    isOpen: false,
    nextOpenTime: "Tomorrow at 7:00",
    hours: { Mon: "7:00–19:00", Tue: "7:00–19:00", Wed: "7:00–19:00", Thu: "7:00–19:00", Fri: "7:00–19:00", Sat: "9:00–18:00", Sun: "Closed" },
    attributes: { kidsFriendly: false, laptopFriendly: true, sitIn: true, foodMenu: true, opensEarly: true, opensLate: false, specialtyCoffee: true, dogFriendly: false },
    communityReview: "Workshop's Fitzrovia outpost is a masterclass in minimalist café design. The focus here is squarely on the coffee—direct trade beans roasted at their Bethnal Green facility with meticulous care. Reviewers on Google praise the consistently excellent espresso and the calm, focused atmosphere perfect for work. The pastry selection from local bakeries is a lovely complement.",
    sentimentTags: ["Minimalist design", "Direct trade", "Great for work", "Exceptional pastries"],
    nearestTransport: ["Goodge Street (2 min)", "Oxford Circus (5 min)"],
    verification: { totalLocations: 5, googleRating: 4.3, hasFullInfo: true },
  },
  {
    id: "rosslyn-city",
    name: "Rosslyn Coffee",
    address: "78 Queen Victoria Street, EC4N 4SJ",
    neighborhood: "City of London",
    lat: 51.5120,
    lng: -0.0945,
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&h=400&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=600&h=400&fit=crop",
    ],
    roaster: "The Barn Berlin",
    phone: "+44 20 7248 5535",
    website: "https://rosslyncoffee.com",
    instagram: "@rosslyncoffee",
    isOpen: true,
    hours: { Mon: "7:00–17:00", Tue: "7:00–17:00", Wed: "7:00–17:00", Thu: "7:00–17:00", Fri: "7:00–17:00", Sat: "Closed", Sun: "Closed" },
    attributes: { kidsFriendly: false, laptopFriendly: false, sitIn: true, foodMenu: true, opensEarly: true, opensLate: false, specialtyCoffee: true, dogFriendly: false },
    communityReview: "A City oasis tucked away from the financial district chaos. Rosslyn sources beans from The Barn in Berlin, producing some of the most refined light-roast espresso in London. Google reviewers consistently mention the exceptionally friendly staff and the compact but beautifully designed interior. Perfect for a quick, excellent coffee between meetings.",
    sentimentTags: ["Light roast specialists", "Friendly staff", "City escape", "Beautiful interior"],
    nearestTransport: ["Mansion House (2 min)", "Cannon Street (3 min)"],
    verification: { totalLocations: 3, googleRating: 4.5, hasFullInfo: true },
  },
  {
    id: "watchhouse-bermondsey",
    name: "WatchHouse",
    address: "199 Bermondsey Street, SE1 3UW",
    neighborhood: "Bermondsey",
    lat: 51.4988,
    lng: -0.0818,
    image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&h=400&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    ],
    roaster: "WatchHouse (own roast)",
    phone: "+44 20 7234 9622",
    website: "https://watchhouse.com",
    instagram: "@watchhousecoffee",
    isOpen: true,
    hours: { Mon: "7:00–17:00", Tue: "7:00–17:00", Wed: "7:00–17:00", Thu: "7:00–17:00", Fri: "7:00–17:00", Sat: "8:00–17:00", Sun: "8:00–17:00" },
    attributes: { kidsFriendly: true, laptopFriendly: true, sitIn: true, foodMenu: true, opensEarly: true, opensLate: false, specialtyCoffee: true, dogFriendly: true },
    communityReview: "Set in a converted 19th-century watch house, this Bermondsey gem is as much about the architecture as the coffee. The original building has been lovingly restored with floor-to-ceiling windows flooding the space with light. Their house roast is smooth and approachable, making it a favorite for both specialty aficionados and those newer to good coffee. Locals on Reddit describe it as their living room away from home.",
    sentimentTags: ["Stunning architecture", "Great light", "Welcoming to all", "Bermondsey gem"],
    nearestTransport: ["London Bridge (7 min)", "Bermondsey (5 min)"],
    verification: { totalLocations: 5, googleRating: 4.3, hasFullInfo: true },
  },
  {
    id: "climpson-sons",
    name: "Climpson & Sons",
    address: "67 Broadway Market, E8 4PH",
    neighborhood: "Hackney",
    lat: 51.5352,
    lng: -0.0613,
    image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&h=400&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1511081692775-05d0f180a065?w=600&h=400&fit=crop",
    ],
    roaster: "Climpson & Sons (own roast)",
    phone: "+44 20 7254 7199",
    website: "https://climpsonandsons.com",
    instagram: "@climpsonandsons",
    isOpen: true,
    hours: { Mon: "7:30–17:00", Tue: "7:30–17:00", Wed: "7:30–17:00", Thu: "7:30–17:00", Fri: "7:30–17:00", Sat: "8:30–17:00", Sun: "9:00–17:00" },
    attributes: { kidsFriendly: true, laptopFriendly: true, sitIn: true, foodMenu: true, opensEarly: true, opensLate: false, specialtyCoffee: true, dogFriendly: true },
    communityReview: "Broadway Market's original specialty coffee pioneers, Climpson & Sons helped put Hackney on the coffee map over a decade ago. Their single-origin filter coffee is consistently outstanding, and Saturday mornings during the market are a vibrant community experience. Google reviewers love the relaxed atmosphere and the way staff remember regulars' orders. The outdoor seating is prime people-watching territory.",
    sentimentTags: ["Broadway Market icon", "Community hub", "Outdoor seating", "Single-origin filter"],
    nearestTransport: ["London Fields (5 min)", "Haggerston (8 min)"],
    verification: { totalLocations: 1, googleRating: 4.4, hasFullInfo: true },
  },
  {
    id: "origin-shoreditch",
    name: "Origin Coffee",
    address: "65 Charlotte Road, EC2A 3PE",
    neighborhood: "Shoreditch",
    lat: 51.5270,
    lng: -0.0810,
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=600&h=400&fit=crop",
    ],
    roaster: "Origin (Cornwall roast)",
    phone: "+44 20 7739 4649",
    website: "https://origincoffee.co.uk",
    instagram: "@origincoffee",
    isOpen: true,
    hours: { Mon: "7:30–17:00", Tue: "7:30–17:00", Wed: "7:30–17:00", Thu: "7:30–17:00", Fri: "7:30–17:00", Sat: "9:00–17:00", Sun: "10:00–16:00" },
    attributes: { kidsFriendly: false, laptopFriendly: true, sitIn: true, foodMenu: true, opensEarly: true, opensLate: false, specialtyCoffee: true, dogFriendly: false },
    communityReview: "Cornwall's finest export to London's coffee scene. Origin brings a distinct approach—beans roasted at their Cornish HQ with a focus on traceability and direct farmer relationships. The Shoreditch space is sleek and modern with excellent coffee equipment on full display. Reddit users particularly recommend the tasting flights for exploring different origins side by side.",
    sentimentTags: ["Cornwall roasted", "Tasting flights", "Direct trade", "Sleek space"],
    nearestTransport: ["Old Street (5 min)", "Shoreditch High Street (4 min)"],
  },
];

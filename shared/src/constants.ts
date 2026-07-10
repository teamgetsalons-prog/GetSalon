export const SITE = {
  name: "GetSalons",
  shortName: "GetSalons",
  tagline: "Pakistan's #1 Salon Discovery & Booking Platform",
  description:
    "Discover and book the best salons, barbers, spas and beauty parlours across Pakistan. Compare prices, read verified reviews and book appointments online — free.",
  url: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  locale: "en_PK",
  twitter: "@getsalonsPK",
} as const;

export const ROLES = {
  CUSTOMER: "customer",
  OWNER: "owner",
  STAFF: "staff",
  ADMIN: "admin",
} as const;

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const SLOT_INTERVAL = 30;
export const MAX_BOOKING_DAYS_AHEAD = 30;
export const MIN_BOOKING_LEAD_MINUTES = 60;
export const PAGE_SIZE = 12;

export const GENDER_OPTIONS = [
  { value: "men", label: "Men Only" },
  { value: "women", label: "Women Only" },
  { value: "unisex", label: "Unisex" },
] as const;

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviewed" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
] as const;

export const SITE_FAQS = [
  {
    question: "Is booking through GetSalons free?",
    answer:
      "Yes! Booking appointments through GetSalons is completely free for customers. You only pay the salon for the services you receive.",
  },
  {
    question: "How do I cancel or reschedule my appointment?",
    answer:
      "Go to your dashboard, open the booking and choose Cancel or Reschedule. Please respect each salon's cancellation policy — most require at least 2 hours notice.",
  },
  {
    question: "Are the reviews on GetSalons genuine?",
    answer:
      "Every review on GetSalons is a verified review — only customers who completed a booking through the platform can rate and review that salon.",
  },
  {
    question: "How do I list my salon on GetSalons?",
    answer:
      "Click 'Become a Partner', create an owner account and submit your salon profile. Our team reviews and approves new salons within 24–48 hours.",
  },
  {
    question: "Which cities does GetSalons cover?",
    answer:
      "We are live in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad and Multan — with more cities being added every month.",
  },
  {
    question: "Do salons offer home service?",
    answer:
      "Many of our partner salons offer home service. Use the 'Home Service' filter while searching to find beauticians who come to you.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Ayesha Khan",
    city: "Lahore",
    text: "Booked my bridal makeup trial through GetSalons — saw real reviews and prices before choosing. Absolutely seamless experience!",
    rating: 5,
  },
  {
    name: "Hassan Raza",
    city: "Karachi",
    text: "No more waiting at the barber. I book my slot on the way and walk straight into the chair. Game changer.",
    rating: 5,
  },
  {
    name: "Fatima Noor",
    city: "Islamabad",
    text: "I found an amazing home-service beautician for my mother through GetSalons. Verified reviews made all the difference.",
    rating: 5,
  },
];

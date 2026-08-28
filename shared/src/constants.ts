export const SITE = {
  name: "GetSalons",
  shortName: "GetSalons",
  tagline: "Pakistan's #1 Salon Discovery & Booking Platform",
  description:
    "Find and book the best beauty salons, hair salons, barbers, spas and beauty parlours near you in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad and Multan. Compare prices, read verified reviews and book appointments online — free for customers.",
  url: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.getsalons.com",
  locale: "en_PK",
  twitter: "@getsalonsPK",
  socials: {
    facebook: "https://www.facebook.com/share/1Liozhqjxp/",
    instagram: "https://www.instagram.com/getsalons",
  },
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

export const MAX_GALLERY_IMAGES = 10;
export const SLOT_INTERVAL = 30;
export const MAX_BOOKING_DAYS_AHEAD = 30;
export const MIN_BOOKING_LEAD_MINUTES = 60;
export const PAGE_SIZE = 12;

/** Owner-selectable salon highlights, shown as a checklist below the hero image */
export const SALON_AMENITIES = [
  { key: "femaleStaff", label: "Female Staff" },
  { key: "parking", label: "Parking" },
  { key: "ac", label: "Air Conditioned" },
  { key: "wifi", label: "WiFi" },
  { key: "cardAccepted", label: "Card Accepted" },
  { key: "bridalSpecialist", label: "Bridal Specialist" },
] as const;

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
  {
    question: "How much does a haircut cost in Pakistan?",
    answer:
      "Haircut prices in Pakistan range from Rs 200 for a basic cut to Rs 2,000+ at premium salons. You can compare exact prices from different salons on GetSalons before booking.",
  },
  {
    question: "How much does bridal makeup cost in Pakistan?",
    answer:
      "Bridal makeup in Pakistan typically ranges from Rs 15,000 to Rs 80,000 depending on the salon, makeup artist experience, and products used. Browse salon profiles on GetSalons to see exact bridal packages.",
  },
  {
    question: "What is the best salon near me?",
    answer:
      "GetSalons helps you find the best salons near you based on verified reviews, ratings and proximity. Simply search for salons in your city and use filters to narrow down by service, price and rating.",
  },
  {
    question: "Can I compare salon prices before booking?",
    answer:
      "Yes! Every salon on GetSalons displays their service prices. You can compare prices from multiple salons side by side to find the best option for your budget.",
  },
  {
    question: "Do I need to create an account to book?",
    answer:
      "Yes, you need a free customer account to book appointments. This helps us send you booking confirmations, reminders and keeps your booking history organized.",
  },
  {
    question: "How do I find ladies parlours near me?",
    answer:
      "Search for salons in your city on GetSalons and use the 'Women Only' filter to find ladies-only parlours. You can also filter by specific services like bridal makeup, facials or hair styling.",
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

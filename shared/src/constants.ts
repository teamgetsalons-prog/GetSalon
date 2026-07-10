export const SITE = {
  name: "GetSalons",
  shortName: "SH",
  tagline: "Your salon, connected",
  description:
    "Discover and book the best salons near you. Manage your salon business with powerful tools.",
  url: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  locale: "en-PK",
  twitter: "@getsalons",
} as const;

export const ROLES = {
  OWNER: "OWNER",
  STAFF: "STAFF",
  CUSTOMER: "CUSTOMER",
} as const;

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const SLOT_INTERVAL = 30;
export const MAX_BOOKING_DAYS_AHEAD = 30;
export const MIN_BOOKING_LEAD_MINUTES = 60;
export const PAGE_SIZE = 12;

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Men" },
  { value: "FEMALE", label: "Women" },
  { value: "UNISEX", label: "Unisex" },
] as const;

export const SORT_OPTIONS = [
  { value: "rating_desc", label: "Highest Rated" },
  { value: "rating_asc", label: "Lowest Rated" },
  { value: "reviews_desc", label: "Most Reviewed" },
  { value: "distance_asc", label: "Nearest" },
  { value: "name_asc", label: "Name A-Z" },
] as const;

export const SITE_FAQS = [
  {
    question: "What is GetSalons?",
    answer:
      "GetSalons is a platform that connects customers with salons, allowing easy booking and salon management.",
  },
  {
    question: "How do I book an appointment?",
    answer:
      "Simply search for a salon, select a service and time slot, and confirm your booking. You'll receive a confirmation notification.",
  },
  {
    question: "Can salon owners manage their business on GetSalons?",
    answer:
      "Yes! Salon owners can manage services, staff, bookings, and view analytics through our comprehensive dashboard.",
  },
  {
    question: "Is GetSalons free to use?",
    answer:
      "GetSalons offers a free trial for salon owners. Various subscription plans are available based on your needs.",
  },
  {
    question: "How do I cancel a booking?",
    answer:
      "You can cancel a booking from your bookings page. Please note that cancellations within 1 hour of the appointment may not be eligible for a refund.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept all major credit/debit cards, JazzCash, EasyPaisa, and bank transfers.",
  },
] as const;

export const TESTIMONIALS = [
  {
    id: "1",
    name: "Ayesha Khan",
    role: "Salon Owner",
    avatar: null,
    content:
      "GetSalons has transformed how I manage my salon. Bookings are up 40% since I joined!",
    rating: 5,
  },
  {
    id: "2",
    name: "Fatima Ahmed",
    role: "Customer",
    avatar: null,
    content:
      "So easy to find and book appointments. I love being able to see real reviews from other customers.",
    rating: 5,
  },
  {
    id: "3",
    name: "Sara Malik",
    role: "Salon Owner",
    avatar: null,
    content:
      "The analytics dashboard gives me insights I never had before. Highly recommend for salon owners!",
    rating: 5,
  },
] as const;

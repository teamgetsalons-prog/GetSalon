import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { Footer } from "@/components/layout/footer";
import { Analytics } from "@/components/analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE } from "@getsalons/shared/constants";
import "./globals.css";

// Lazy-load the navbar (client component) to reduce initial JS bundle
const Navbar = dynamic(
  () => import("@/components/layout/navbar").then((m) => ({ default: m.Navbar })),
  { ssr: true }
);

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Book Salons, Barbers & Spas Online`,
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.description,
  keywords: [
    "salon near me",
    "beauty salon near me",
    "beauty parlour near me",
    "ladies parlour near me",
    "gents salon near me",
    "hair salon near me",
    "nail salon near me",
    "facial near me",
    "waxing near me",
    "barber shop near me",
    "salon booking online",
    "salon booking Pakistan",
    "book salon online Pakistan",
    "bridal makeup salon",
    "bridal makeup packages Pakistan",
    "manicure pedicure near me",
    "hair cut price Pakistan",
    "hair color price Pakistan",
    "keratin treatment Pakistan",
    "beauty salon Lahore",
    "salon Karachi",
    "beauty parlour Islamabad",
    "ladies salon Rawalpindi",
    "gents salon Faisalabad",
    "best salon Multan",
    "home service salon",
    "unisex salon near me",
    "affordable salon near me",
    "top rated salon Pakistan",
    "verified salon Pakistan",
    "salon deals Pakistan",
    "best beauty salon near me",
    "parlour near me",
    "ladies parlour near me with price list",
    "gents saloon near me",
    "beauty salon near me for ladies",
    "salon near me with price list",
    "best salon in Lahore",
    "best salon in Karachi",
    "best salon in Islamabad",
    "luxury salon Pakistan",
    "party makeup price Pakistan",
    "mehndi artist near me",
    "hair treatment near me",
    "skin care salon near me",
    "threading near me",
    "beauty services Pakistan",
  ],
  openGraph: {
    siteName: SITE.name,
    locale: SITE.locale,
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external image CDN */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <meta name="google-site-verification" content="1nI22epoy5iX741Zlh2Z5kDJIzDsiEYOe3IaXNFXpWY" />
        {/* Google Identity Services — client ID exposed via public env */}
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <meta
            name="google-client-id"
            content={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
          />
        )}
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Analytics />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Providers>
          <Navbar />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

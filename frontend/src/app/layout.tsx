import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { Footer } from "@/components/layout/footer";
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
    "salon booking Pakistan",
    "beauty parlour near me",
    "barber shop Lahore",
    "salon Karachi",
    "bridal makeup Islamabad",
    "book salon online",
  ],
  openGraph: {
    siteName: SITE.name,
    locale: SITE.locale,
    type: "website",
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
        {/* Google Identity Services — client ID exposed via public env */}
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <meta
            name="google-client-id"
            content={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
          />
        )}
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
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

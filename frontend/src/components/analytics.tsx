import Script from "next/script";

/**
 * Google Analytics 4 — only renders when NEXT_PUBLIC_GA_ID is set (e.g.
 * "G-XXXXXXXXXX" in Vercel env). Until then it's a no-op, so the site ships
 * analytics-ready without hardcoding any account. Loaded after interactive so
 * it never blocks page rendering.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}

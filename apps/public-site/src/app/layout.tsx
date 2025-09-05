// --- apps/public-site/src/app/layout.tsx (FINAL with SEO & Pixel) ---
import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script"; // Import the optimized Script component

// This is the correct Next.js way to import our Google Fonts
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], variable: '--font-heading', weight: '700', display: 'swap' });

// --- NEW: The definitive, SEO-optimized metadata object ---
export const metadata: Metadata = {
  title: "Property Pasalo | Your Shortcut to Homeownership in the Philippines",
  description: "Discover verified, ready-for-occupancy Pasalo (Assumed Balance) properties. Secure your dream home faster with a lower cash-out and no developer downpayment. Your trusted guide to safe Pasalo deals.",
  // Open Graph tags for beautiful Facebook/Messenger sharing
  openGraph: {
    title: "Property Pasalo | The Smarter Path to Homeownership",
    description: "Stop renting and start owning. Find your dream home today with our verified Pasalo listings.",
    url: 'https://propertypasalo.com', // This should be your final main domain
    siteName: 'Property Pasalo',
    images: [
      {
        url: 'https://propertypasalo.com/og-image.jpg', // The public URL to your sharing image
        width: 1200,
        height: 630,
        alt: 'A happy family in front of their new home.',
      },
    ],
    locale: 'en_PH',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable}`}>
        {children}

        {/* --- NEW: Meta Pixel Code using Next.js Script component --- */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '778521148139639');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{display:'none'}} alt=""
               src="https://www.facebook.com/tr?id=778521148139639&ev=PageView&noscript=1" />
        </noscript>
        {/* --- End Meta Pixel Code --- */}
      </body>
    </html>
  );
}
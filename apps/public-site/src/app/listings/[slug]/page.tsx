// --- apps/public-site/src/app/listings/[slug]/page.tsx (FINAL ASSEMBLY) ---
import { database } from "@/firebase";
import { ref, get, query, orderByChild, equalTo, child } from "firebase/database";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';

// Import all our new components
import PhotoGallery from "@/components/PhotoGallery";
import StickyCtaSidebar from "@/components/StickyCtaSidebar";
import TabbedInfo from "@/components/TabbedInfo";
import EmbeddedVideo from "@/components/EmbeddedVideo";
// AgentProfileStrip and Footer are rendered in the root layout now
import { ImageTestimonialsCarousel, VideoTestimonialsCarousel } from '@repo/ui';

// Import the new layout stylesheet
import './listing-page.css';

// Enable ISR for SEO + freshness
export const revalidate = 300; // seconds

// (Removed unused local interfaces)

import type { Listing as ListingType, Testimonial as TestimonialType, AgentProfile as AgentProfileType } from "@repo/types";

// --- This function runs at BUILD TIME ---
// It fetches all listings and tells Next.js which pages to pre-build
// For now, we'll return an empty array to avoid build-time Firebase connection issues
export async function generateStaticParams() {
    return []; // We'll make pages dynamic for now
}

// --- This function fetches the data for a SINGLE page ---
type ListingWithId = ListingType & { id: string };

async function getListingData(slug: string): Promise<ListingWithId | null> {
    const listingsRef = ref(database, 'listings');
    // Create a query to find the listing where 'urlSlug' matches our page slug
    const q = query(listingsRef, orderByChild('urlSlug'), equalTo(slug));
    const snapshot = await get(q);

    if (!snapshot.exists()) {
        return null;
    }
    // The result is an object with a unique key, so we get the first (and only) value
    const data = snapshot.val();
    const listingKey = Object.keys(data)[0];
    return { id: listingKey, ...data[listingKey] } as ListingWithId;
}

async function getTestimonials(ids: string[]): Promise<TestimonialType[]> {
    if (!ids?.length) return [];
    const snaps = await Promise.all(ids.map(id => get(child(ref(database), `testimonials/${id}`))));
    return snaps
      .filter(s => s.exists())
      .map(s => ({ id: s.key!, ...s.val() } as TestimonialType));
}

async function getAgentProfile(): Promise<AgentProfileType | null> {
    const snap = await get(ref(database, 'siteContent/agentProfile'));
    if (!snap.exists()) return null;
    return snap.val() as AgentProfileType;
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const listing = await getListingData(slug);
    if (!listing) { notFound(); }
    const [imageTestimonials, videoTestimonials, agentProfile] = await Promise.all([
        getTestimonials(listing.featuredImageTestimonials || []),
        getTestimonials(listing.featuredVideoTestimonials || []),
        getAgentProfile(),
    ]);

    return (
        <div className="container listing-page-container">
            {/* --- HEADER SECTION --- */}
            <div className="listing-header">
                <div>
                    <h1>{listing.propertyName}</h1>
                    <p className="location-subtitle">{listing.location}</p>
                </div>
                <div className="price-tag">
                    <span>₱{listing.cashOutPrice.toLocaleString()}</span>
                    <small>Cash-Out</small>
                </div>
            </div>

            {/* --- PHOTO GALLERY --- */}
            <PhotoGallery 
                thumbnailUrl={listing.thumbnailImageUrl}
                galleryUrls={listing.galleryImageUrls}
                videoUrl={listing.youtubeTourUrl}
                propertyName={listing.propertyName}
            />

            {/* --- JSON-LD Breadcrumbs --- */}
            {(() => {
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
                const breadcrumb = {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    itemListElement: [
                        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl || "/" },
                        { "@type": "ListItem", position: 2, name: "Listings", item: siteUrl ? `${siteUrl}/listings` : "/listings" },
                        { "@type": "ListItem", position: 3, name: listing.propertyName, item: siteUrl ? `${siteUrl}/listings/${slug}` : `/listings/${slug}` }
                    ]
                };
                return (
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
                );
            })()}

            {/* --- JSON-LD Product schema for SEO --- */}
            {(() => {
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
                const url = siteUrl ? `${siteUrl}/listings/${slug}` : undefined;
                const product = {
                    "@context": "https://schema.org",
                    "@type": "Product",
                    name: listing.propertyName,
                    description: listing.overviewDescription,
                    image: listing.thumbnailImageUrl || undefined,
                    url,
                    brand: {
                        "@type": "Brand",
                        name: "Property Pasalo"
                    },
                    offers: {
                        "@type": "Offer",
                        priceCurrency: "PHP",
                        price: listing.cashOutPrice,
                        availability: listing.status === 'AVAILABLE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
                    }
                } as const;
                return (
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />
                );
            })()}

            {/* --- TWO-COLUMN LAYOUT --- */}
            <div className="main-layout-grid">
                <div className="main-content-col">
                    <h2>Property Overview</h2>
                    <p>{listing.overviewDescription}</p>
                    <TabbedInfo tabs={listing.tabbedInfo || []} />
                    {listing.faqVideoUrl && (
                        <EmbeddedVideo 
                            title={listing.faqVideoHeadline || 'Property FAQ'}
                            videoUrl={listing.faqVideoUrl}
                        />
                    )}
                    {imageTestimonials.length > 0 && (
                                            <>
                                                <h3>What Homeowners Say</h3>
                        <ImageTestimonialsCarousel testimonials={imageTestimonials} />
                                            </>
                                        )}
                    {videoTestimonials.length > 0 && (
                                            <>
                                                <h3>Video Testimonials</h3>
                        <VideoTestimonialsCarousel testimonials={videoTestimonials} />
                                            </>
                                        )}
                </div>
                <div className="sidebar-col">
                    <StickyCtaSidebar listingName={listing.propertyName} listingId={listing.id} />
                </div>
            </div>
            {/* AgentProfileStrip and Footer are rendered globally in layout */}
        </div>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const listing = await getListingData(slug);
    if (!listing) {
        return { title: 'Listing not found' };
    }
    const title = `${listing.propertyName} – ${listing.location}`;
    const description = (listing.overviewDescription || '').slice(0, 155);
    const ogImage = listing.thumbnailImageUrl || undefined;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const url = siteUrl ? `${siteUrl}/listings/${slug}` : undefined;
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            images: ogImage ? [{ url: ogImage }] : undefined,
        },
        alternates: { canonical: url },
    };
}
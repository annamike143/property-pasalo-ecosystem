// --- apps/public-site/src/app/listings/[slug]/page.tsx (FINAL ASSEMBLY) ---
import { database } from "@/firebase";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { notFound } from "next/navigation";

// Import all our new components
import PhotoGallery from "@/components/PhotoGallery";
import StickyCtaSidebar from "@/components/StickyCtaSidebar";
import TabbedInfo from "@/components/TabbedInfo";
import EmbeddedVideo from "@/components/EmbeddedVideo";
// import { Testimonials } from "@repo/ui"; // We'll add this later when workspace is properly configured
import AgentProfile from "@/components/AgentProfile";

// Import the new layout stylesheet
import './listing-page.css';

// Make this page dynamic since we're connecting to Firebase
export const dynamic = 'force-dynamic';

// Expanded interface to match our full data structure
interface Listing {
    propertyName: string;
    location: string;
    cashOutPrice: number;
    thumbnailImageUrl: string | null;
    galleryImageUrls: string[];
    youtubeTourUrl: string;
    overviewDescription: string;
}

// --- This function runs at BUILD TIME ---
// It fetches all listings and tells Next.js which pages to pre-build
// For now, we'll return an empty array to avoid build-time Firebase connection issues
export async function generateStaticParams() {
    return []; // We'll make pages dynamic for now
}

// --- This function fetches the data for a SINGLE page ---
async function getListingData(slug: string): Promise<Listing | null> {
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
    return data[listingKey];
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const listing = await getListingData(slug);
    if (!listing) { notFound(); }

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

            {/* --- TWO-COLUMN LAYOUT --- */}
            <div className="main-layout-grid">
                <div className="main-content-col">
                    <h2>Property Overview</h2>
                    <p>{listing.overviewDescription}</p>
                    <TabbedInfo />
                    <EmbeddedVideo />
                    {/* <Testimonials /> We'll add this later */}
                </div>
                <div className="sidebar-col">
                    <StickyCtaSidebar />
                </div>
            </div>

            <AgentProfile />
        </div>
    );
}
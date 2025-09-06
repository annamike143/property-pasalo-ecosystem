// --- apps/status-page/src/app/page.tsx (FINAL) ---
import React from 'react';
import { database } from '@/firebase';
import { ref, get, query, limitToLast, child } from 'firebase/database';
import { ImageTestimonialsCarousel, VideoTestimonialsCarousel } from '@repo/ui';
import type { Testimonial as TestimonialType, Listing as ListingType } from '@repo/types';
import FeaturedListingsRotator from '../components/FeaturedListingsRotator';
import DataPod from '../components/DataPod';
import './status-page.css';
import '../components/DataPod.css'; // Import styles

export const dynamic = 'force-dynamic';

// --- Data Fetching (runs on the server) ---
type Listing = { status?: string };
type Client = { status?: string };
type EventItem = { message: string; timestamp: number };
type FeaturedListing = {
    id: string;
    propertyName: string;
    urlSlug: string;
    thumbnailImageUrl: string | null;
    location: string;
    cashOutPrice: number;
};

async function getStatusData() {
    try {
        const listingsRef = ref(database, 'listings');
        const homeownersRef = ref(database, 'clients');
        const eventsRef = query(ref(database, 'events'), limitToLast(10));
        const viewingsRef = ref(database, 'liveStatus/viewingsBookedCount');
        const statusContentRef = ref(database, 'siteContent/statusPage');

        const [listingsSnap, homeownersSnap, eventsSnap, viewingsSnap, statusContentSnap] = await Promise.all([
            get(listingsRef),
            get(homeownersRef),
            get(eventsRef),
            get(viewingsRef),
            get(statusContentRef)
        ]);

        const allListings: Listing[] = listingsSnap.exists() ? Object.values(listingsSnap.val() as Record<string, Listing>) : [];
        const availableCount = allListings.filter((l) => l.status === 'AVAILABLE').length;

        const allClients: Client[] = homeownersSnap.exists() ? Object.values(homeownersSnap.val() as Record<string, Client>) : [];
        const homeownerCount = allClients.filter((c) => c.status === 'HOMEOWNER').length;
        
        const events: EventItem[] = eventsSnap.exists() 
            ? Object.values(eventsSnap.val() as Record<string, EventItem>)
                .sort((a, b) => b.timestamp - a.timestamp)
            : [];

        const viewingsCount = viewingsSnap.exists() ? viewingsSnap.val() as number : 0;

        // Curated testimonial IDs from site content
        let imageTestimonialIds: string[] = [];
        let videoTestimonialIds: string[] = [];
        let featuredListingIds: string[] = [];
        if (statusContentSnap.exists()) {
            const content = statusContentSnap.val() as { featuredImageTestimonials?: string[]; featuredVideoTestimonials?: string[]; featuredListingIds?: string[] };
            imageTestimonialIds = content.featuredImageTestimonials || [];
            videoTestimonialIds = content.featuredVideoTestimonials || [];
            featuredListingIds = content.featuredListingIds || [];
        }

        // Helper to fetch testimonial docs by id list
        const getTestimonials = async (ids: string[]): Promise<TestimonialType[]> => {
            if (!ids?.length) return [];
            const snaps = await Promise.all(ids.map(id => get(child(ref(database), `testimonials/${id}`))));
            return snaps.filter(s => s.exists()).map(s => ({ id: s.key!, ...s.val() } as TestimonialType));
        };

        const [imageTestimonials, videoTestimonials] = await Promise.all([
            getTestimonials(imageTestimonialIds),
            getTestimonials(videoTestimonialIds)
        ]);

        // Fetch featured listings data
        const getListingById = async (id: string): Promise<FeaturedListing | null> => {
            const snap = await get(child(ref(database), `listings/${id}`));
            if (!snap.exists()) return null;
            const v = snap.val() as ListingType;
            return {
                id,
                propertyName: v.propertyName,
                urlSlug: v.urlSlug,
                thumbnailImageUrl: v.thumbnailImageUrl,
                location: v.location,
                cashOutPrice: v.cashOutPrice,
            };
        };
        const featuredListingsAll = await Promise.all(featuredListingIds.map(getListingById));
        const featuredListings = featuredListingsAll.filter((x): x is FeaturedListing => Boolean(x));

        return { availableCount, homeownerCount, viewingsCount, events, imageTestimonials, videoTestimonials, featuredListings };
    } catch (error) {
        console.error("Error fetching status data:", error);
        return { availableCount: 0, homeownerCount: 0, viewingsCount: 0, events: [], imageTestimonials: [], videoTestimonials: [], featuredListings: [] };
    }
}

// --- The Main Page (Server Component) ---
export default async function StatusPage() {
    const { availableCount, homeownerCount, viewingsCount, events, imageTestimonials, videoTestimonials, featuredListings } = await getStatusData();

    return (
        <div className="container">
            <section className="hero-status">
                <h1>Property Pasalo Community Hub</h1>
                <p>See the live, real-time momentum of our growing community of homeowners.</p>
            </section>

            <section className="pods-grid">
                <DataPod title="Available Units Left" value={availableCount} />
                <DataPod title="Total New Homeowners" value={homeownerCount} />
                <DataPod title="Live Site Viewings Booked" value={viewingsCount} />
            </section>

            <section className="feed-section">
                <h2>Live Activity Feed</h2>
                <div className="activity-feed">
                    {events.length > 0 ? events.map((event: EventItem, index) => (
                        <div key={index} className="feed-item">
                            <p>{event.message}</p>
                            <small>{new Date(event.timestamp).toLocaleString()}</small>
                        </div>
                    )) : (
                        <p>No recent activity.</p>
                    )}
                </div>
            </section>

            {(imageTestimonials.length > 0 || videoTestimonials.length > 0) && (
                <section className="feed-section" style={{ marginTop: '3rem' }}>
                    {imageTestimonials.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h2>What Our Clients Say</h2>
                            <ImageTestimonialsCarousel testimonials={imageTestimonials} />
                        </div>
                    )}
                    {videoTestimonials.length > 0 && (
                        <div>
                            <h2>Video Testimonials</h2>
                            <VideoTestimonialsCarousel testimonials={videoTestimonials} />
                        </div>
                    )}
                </section>
            )}

            {featuredListings.length > 0 && (
                <section className="feed-section" style={{ marginTop: '3rem' }}>
                    <h2>Featured Listings</h2>
                    <FeaturedListingsRotator listings={featuredListings} />
                </section>
            )}
        </div>
    );
}
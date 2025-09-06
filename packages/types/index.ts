// Canonical shared types and helpers

export type TestimonialType = 'IMAGE' | 'VIDEO';

export interface Testimonial {
  id: string;
  type: TestimonialType;
  clientId: string;
  clientName: string;
  clientPhotoUrl: string;
  clientTitle?: string; // e.g., "OFW", "10-year renter"
  quote: string; // required for both; short statement
  rating?: number; // 1-5 (required for IMAGE)
  badge?: string;
  videoTitle?: string; // VIDEO
  youtubeUrl?: string; // VIDEO
  youtubeId?: string; // derived
  createdAt?: number;
  updatedAt?: number;
}

export interface Listing {
  id?: string;
  propertyName: string;
  urlSlug: string;
  status: 'AVAILABLE' | 'SOLD' | 'DRAFT';
  tags: string[];
  cashOutPrice: number;
  location: string;
  thumbnailImageUrl: string | null;
  galleryImageUrls: string[];
  youtubeTourUrl: string;
  overviewDescription: string;
  tabbedInfo: Array<{ id: string; title: string; data: Array<{ id: string; key: string; value: string }> }>;
  faqVideoHeadline: string;
  faqVideoUrl: string;
  featuredImageTestimonials: string[];
  featuredVideoTestimonials: string[];
}

export interface AgentProfile {
  name: string;
  title: string;
  portraitImageUrl: string;
  philosophy: string;
  contact?: {
    phone?: string;
    email?: string;
  };
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: 'ACTIVE_CLIENT' | 'HOMEOWNER';
  profilePictureUrl?: string;
  notes?: string;
}

// Validators
export function parseYouTubeId(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const patterns = [
      /(?:v=)([\w-]{11})/,
      /youtu\.be\/(\w{11})/,
      /youtube\.com\/embed\/([\w-]{11})/
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m && m[1]) return m[1];
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function validateTestimonial(t: Partial<Testimonial>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!t.type) errors.push('type is required');
  if (!t.clientId) errors.push('clientId is required');
  if (!t.clientName) errors.push('clientName is required');
  if (!t.clientPhotoUrl) errors.push('clientPhotoUrl is required');
  if (!t.quote || !t.quote.trim()) errors.push('quote is required');
  if (t.type === 'IMAGE' && (t.rating === undefined || t.rating === null)) errors.push('rating is required for IMAGE testimonials');
  if (t.type === 'VIDEO') {
    if (!t.videoTitle) errors.push('videoTitle is required for VIDEO testimonials');
    if (!t.youtubeUrl) errors.push('youtubeUrl is required for VIDEO testimonials');
  }
  return { valid: errors.length === 0, errors };
}

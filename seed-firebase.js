// --- Firebase Database Seeder for Development ---
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyDAzZRk4uDoRry8d_KG6YieWPedPHGac2g",
  authDomain: "property-pasalo-main.firebaseapp.com",
  databaseURL: "https://property-pasalo-main-default-rtdb.firebaseio.com",
  projectId: "property-pasalo-main",
  storageBucket: "property-pasalo-main.firebasestorage.app",
  messagingSenderId: "1069057040040",
  appId: "1:1069057040040:web:3852d73c65854ba96b6c9d"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function seedDatabase() {
  try {
  // --- (Legacy) Seed landing page sections/content (kept for compatibility) ---
    const sections = {
      hero_section: { type: 'Hero', contentId: 'hero_content', order: 0 },
      pain_section: { type: 'PainAgitation', contentId: 'pain_content', order: 1 },
      solution_section: { type: 'Solution', contentId: 'solution_content', order: 2 },
      benefits_section: { type: 'Benefits', contentId: 'benefits_content', order: 3 },
      testimonials_section: { type: 'Testimonials', contentId: 'testimonials_content', order: 4 },
      valueStack_section: { type: 'ValueStack', contentId: 'valueStack_content', order: 5 },
      scarcity_section: { type: 'Scarcity', contentId: 'scarcity_content', order: 6 },
      guarantee_section: { type: 'Guarantee', contentId: 'guarantee_content', order: 7 },
      reminder_section: { type: 'Reminder', contentId: 'reminder_content', order: 8 }
    };

  await set(ref(database, 'siteContent/landingPage/sections'), sections);

    // Seed landing page content
    const content = {
      hero_content: {
        attentionMessage: "ATTENTION: FILIPINO ENTREPRENEURS, COACHES & MARKETERS",
        mainHeadline: "How To Get A \"Superhuman\" AI Sales Assistant That Clones You, Closes Sales 24/7, and Turns Your FB/IG Comments Into Customers... For FREE.",
        subHeadline: "This is the Sub-Headline. Edit me in the Admin Portal!",
        benefitBullets: [
          { id: "1", text: "The #1 reason \"robotic\" chatbots kill your sales..." },
          { id: "2", text: "How to ethically \"steal\" my proven sales closing script..." },
          { id: "3", text: "The secret to turning a simple Facebook comment into a customer..." }
        ]
      },
      pain_content: {
        mainHeadline: "Does This Sound Familiar?",
        painPoints: [
          { 
            id: "1", 
            headline: "You're tired of chasing rental payments every month",
            description: "Constant stress dealing with tenants, repairs, and collecting rent that should be automatic.",
            image: "/pain-rent.svg"
          },
          { 
            id: "2", 
            headline: "You want to sell but don't know where to start",
            description: "Overwhelmed by the pre-selling process, legal requirements, and finding qualified buyers.",
            image: "/pain-presell.svg"
          }
        ]
      },
      solution_content: {
        headline: "Discover The Property Pasalo Solution",
        portraitImage: "/founder-portrait.svg",
        storyText: "Hi, I'm [Your Name], and after helping hundreds of Filipino property owners transition from rental stress to financial freedom through our proven pasalo system, I've created the ultimate platform that handles everything for you."
      },
      benefits_content: {
        mainHeadline: "Why Choose Property Pasalo?",
        benefits: [
          {
            id: "1",
            icon: "⏰",
            headline: "Save Time",
            description: "Streamlined process saves months of work"
          },
          {
            id: "2", 
            icon: "🎯",
            headline: "Secure a Lower Price",
            description: "Acquire your property based on its original, lower contract price"
          },
          {
            id: "3",
            icon: "🤝",
            headline: "Simplified Requirements", 
            description: "Avoid the strict and lengthy process of a new developer or bank loan"
          },
          {
            id: "4",
            icon: "📈",
            headline: "Instant Value",
            description: "Lock in instant value and appreciation potential"
          }
        ]
      },
      testimonials_content: {
        headline: "Success Stories From Our Clients",
        testimonialIds: ["testimonial_1"]
      },
      valueStack_content: {
        mainHeadline: "Become a Founding Pioneer & Get The \"Unfair Advantage\" Stack",
        valueItems: [
          {
            id: "1",
            name: "Lifetime Access to the Property Pasalo Core Engine",
            value: "₱35,000"
          },
          {
            id: "2", 
            name: "My Personal \"Human-Touch\" Sales Framework",
            value: "₱10,000"
          }
        ],
        totalValueText: "TOTAL VALUE:",
        totalValueAmount: "₱50,000+"
      },
      scarcity_content: {
        strikethroughPrice: "₱50,000+",
        yourPriceText: "Your Price Today: Your Feedback & Your Success Story",
        mainText: "Warning: This is a limited invitation for only 100 founding pioneers. Slots are filling fast."
      },
      guarantee_content: {
        headline: "100% Satisfaction Guarantee",
        text: "If you're not completely satisfied with our service, we'll refund your deposit within 30 days.",
        ctaText: "SECURE MY FREE LIFETIME ACCOUNT NOW"
      },
      reminder_content: {
        warningText: "Warning: You can ignore this invitation and continue the daily grind... or you can claim your spot and become one of the 100 entrepreneurs who get to shape the future of automation.",
        psText: "P.S. Remember, you're getting lifetime access to a tool valued at over ₱50,000. All we ask in return is your feedback."
      }
    };

    await set(ref(database, 'siteContent/landingPage/content'), content);

    // --- New schema seeds ---
    // 1) Testimonials (IMAGE + VIDEO)
    const testimonialImageId = 't_img_1';
    const testimonialVideoId = 't_vid_1';
    const testimonialsNew = {
      [testimonialImageId]: {
        id: testimonialImageId,
        type: 'IMAGE',
        clientId: 'c1',
        clientName: 'Maria Santos',
        clientPhotoUrl: '/testimonial-maria.svg',
        clientTitle: 'OFW',
        quote: 'Property Pasalo made my transition from renter to owner seamless. Highly recommended!',
        rating: 5,
        badge: 'Verified Buyer',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      [testimonialVideoId]: {
        id: testimonialVideoId,
        type: 'VIDEO',
        clientId: 'c2',
        clientName: 'Juan Dela Cruz',
        clientPhotoUrl: '/testimonial-maria.svg',
        clientTitle: 'Small Business Owner',
        quote: 'The walkthrough answered all my questions. The process was smooth.',
        videoTitle: 'Juan’s Homeowner Story',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtubeId: 'dQw4w9WgXcQ',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    };

    await set(ref(database, 'testimonials'), testimonialsNew);

    // 2) Listings (with curated testimonial IDs)
    const listingId = 'listing_demo_1';
    const listing = {
      id: listingId,
      propertyName: 'Sunny Villas Phase 2 - Unit A1',
      urlSlug: 'sunny-villas-phase-2-unit-a1',
      status: 'AVAILABLE',
      tags: ['New', 'Corner Lot'],
      cashOutPrice: 350000,
      location: 'Bacoor, Cavite',
      thumbnailImageUrl: '/og-image.jpg',
      galleryImageUrls: ['/og-image.jpg'],
      youtubeTourUrl: '',
      overviewDescription: 'A bright, well-ventilated unit near key establishments with flexible terms.',
      tabbedInfo: [
        { id: 'tab1', title: 'Details', data: [
          { id: 'k1', key: 'Floor Area', value: '45 sqm' },
          { id: 'k2', key: 'Lot Area', value: '60 sqm' },
        ]},
        { id: 'tab2', title: 'Nearby', data: [
          { id: 'k3', key: 'School', value: '2 km' },
          { id: 'k4', key: 'Market', value: '1.5 km' },
        ]},
      ],
      faqVideoHeadline: 'Common Questions',
      faqVideoUrl: '',
      featuredImageTestimonials: [testimonialImageId],
      featuredVideoTestimonials: [testimonialVideoId],
    };

    await set(ref(database, `listings/${listingId}`), listing);

    // 3) siteContent curated arrays (homepage + statusPage)
    await set(ref(database, 'siteContent/homepage'), {
      featuredImageTestimonials: [testimonialImageId],
      featuredVideoTestimonials: [testimonialVideoId]
    });

    await set(ref(database, 'siteContent/statusPage'), {
      featuredImageTestimonials: [testimonialImageId],
      featuredVideoTestimonials: [testimonialVideoId],
      featuredListingIds: [listingId]
    });

    // 4) Agent Profile
    await set(ref(database, 'siteContent/agentProfile'), {
      name: 'Alex Reyes',
      title: 'Lead Property Specialist',
      portraitImageUrl: '/founder-portrait.svg',
      philosophy: 'Hands-on guidance, transparent terms, and a human-first approach to home ownership.',
      contact: { phone: '+63 912 345 6789', email: 'alex@propertypasalo.ph' }
    });

    // 5) Live status counter
    await set(ref(database, 'liveStatus'), {
      viewingsBookedCount: 0
    });

    console.log('Firebase database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

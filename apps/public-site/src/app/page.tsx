// --- apps/public-site/src/app/page.tsx (DEFINITIVE FINAL ASSEMBLY) ---
import React from 'react';
import { database } from '@/firebase';
import { ref, get, set } from 'firebase/database';

// Import the Client Wrapper and all modular page components
import { PageClientWrapper } from '@/components/PageClientWrapper';
import Hero from '@/components/Hero';
import PainAgitation from '@/components/PainAgitation';
import Solution from '@/components/Solution';
import Benefits from '@/components/Benefits';
import Testimonials from '@/components/Testimonials';
import ValueStack from '@/components/ValueStack';
import Scarcity from '@/components/Scarcity';
import Guarantee from '@/components/Guarantee';
import Reminder from '@/components/Reminder';

// Import All Stylesheets
import './globals.css';
// NOTE: In a real mono repo, these CSS imports would be handled by the shared components themselves.
// We are importing them here for simplicity in this build phase.
import '@/components/Header.css';
import '@/components/Hero.css';
import '@/components/LiveSlots.css';
import '@/components/PainAgitation.css';
import '@/components/Solution.css';
import '@/components/Benefits.css';
import '@/components/Testimonials.css';
import '@/components/ValueStack.css';
import '@/components/Scarcity.css';
import '@/components/Guarantee.css';
import '@/components/Reminder.css';
import '@/components/SignupModal.css';

// Default content structure for when Firebase is empty
function getDefaultContent() {
  return {
    sections: [
      { id: 'hero_section', type: 'Hero', contentId: 'hero_content', order: 1 },
      { id: 'pain_section', type: 'PainAgitation', contentId: 'pain_content', order: 2 },
      { id: 'solution_section', type: 'Solution', contentId: 'solution_content', order: 3 },
      { id: 'benefits_section', type: 'Benefits', contentId: 'benefits_content', order: 4 },
      { id: 'testimonials_section', type: 'Testimonials', contentId: 'testimonials_content', order: 5 },
      { id: 'valueStack_section', type: 'ValueStack', contentId: 'valueStack_content', order: 6 },
      { id: 'scarcity_section', type: 'Scarcity', contentId: 'scarcity_content', order: 7 },
      { id: 'guarantee_section', type: 'Guarantee', contentId: 'guarantee_content', order: 8 },
      { id: 'reminder_section', type: 'Reminder', contentId: 'reminder_content', order: 9 }
    ],
    content: {
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
        testimonials: [
          {
            id: "1",
            clientName: "Maria Santos",
            title: "Property Investor",
            quote: "Property Pasalo made my transition from renter to owner seamless. The process was clear and professional.",
            clientImage: "/testimonial-maria.svg"
          }
        ]
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
    }
  };
}

// Data Fetching Function (runs on the server)
type SectionDef = { id: string; type: string; contentId: string; order: number };
type FooterData = {
  copyrightText?: string;
  poweredByText?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
};
type LandingPageBlueprint = {
  sections: SectionDef[];
  content: Record<string, unknown>;
  footer: FooterData;
};

async function getLandingPageBlueprint(): Promise<LandingPageBlueprint> {
  try {
    const sectionsRef = ref(database, 'siteContent/landingPage/sections');
    const contentRef = ref(database, 'siteContent/landingPage/content');
    const testimonialsRef = ref(database, 'testimonials');
    const footerRef = ref(database, 'siteContent/footer');

    const [sectionsSnapshot, contentSnapshot, testimonialsSnapshot, footerSnapshot] = await Promise.all([
      get(sectionsRef), 
      get(contentRef),
      get(testimonialsRef),
      get(footerRef)
    ]);

    // If no data exists in Firebase, create default structure
    if (!sectionsSnapshot.exists() || !contentSnapshot.exists()) { 
      console.log("No Firebase data found, using default content");
      
      // In development, try to seed the database (this will fail if rules are strict)
      if (process.env.NODE_ENV === 'development') {
        try {
          const defaultData = getDefaultContent();
          
          // Try to seed the database
          await Promise.all([
            set(ref(database, 'siteContent/landingPage/sections'), 
              Object.fromEntries(defaultData.sections.map((section: {id: string, type: string, contentId: string, order: number}) => [
                section.id, 
                { type: section.type, contentId: section.contentId, order: section.order }
              ]))
            ),
            set(ref(database, 'siteContent/landingPage/content'), defaultData.content),
            set(ref(database, 'testimonials'), {
              testimonial_1: {
                clientName: "Maria Santos",
                title: "Property Investor", 
                quote: "Property Pasalo made my transition from renter to owner seamless. The process was clear and professional.",
                clientImage: "/testimonial-maria.svg"
              }
            }),
            set(ref(database, 'liveStatus'), { totalPioneers: 100 })
          ]);
          
          console.log("Database seeded successfully!");
        } catch (seedError) {
          console.warn("Could not seed database (this is expected if security rules are strict):", seedError);
        }
      }
      
  const defaults = getDefaultContent();
  return { sections: defaults.sections as SectionDef[], content: defaults.content as Record<string, unknown>, footer: {} };
    }
    
  const contentData = contentSnapshot.val();
  const footerData: FooterData = footerSnapshot.exists() ? footerSnapshot.val() : {};
    const testimonialsData = testimonialsSnapshot.exists() ? testimonialsSnapshot.val() : {};

    // Pre-fetch and inject full testimonial data
    if (contentData.testimonials_content && contentData.testimonials_content.testimonialIds) {
      const fetchedTestimonials = contentData.testimonials_content.testimonialIds
        .map((id: string) => testimonialsData[id] ? { id, ...testimonialsData[id] } : null)
        .filter(Boolean);
      contentData.testimonials_content.testimonials = fetchedTestimonials;
    }

    const sectionsData = sectionsSnapshot.val();
    const sectionsArray = Object.keys(sectionsData).map(key => ({ id: key, ...sectionsData[key] })).sort((a, b) => a.order - b.order);
    
  return { sections: sectionsArray, content: contentData, footer: footerData };
  } catch (error) {
    console.error("Error fetching landing page blueprint:", error);
  return { sections: [], content: {}, footer: {} };
  }
}

// The Main Page: A Server Component
export default async function HomePage() {
  const { sections, content, footer } = await getLandingPageBlueprint();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ComponentMap: { [key: string]: React.ComponentType<any> } = {
    Hero, PainAgitation, Solution, Benefits, Testimonials, ValueStack, Scarcity, Guarantee, Reminder,
  };  const pageContent = (
      <main>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {sections.map((section: any) => {
          const Component = ComponentMap[section.type];
          const sectionContent = content[section.contentId];
          if (!Component || !sectionContent) return null;
          return <Component key={section.id} content={sectionContent} />;
        })}
      </main>
  );

  return (
    <PageClientWrapper>
      {pageContent}
    </PageClientWrapper>
  );
}
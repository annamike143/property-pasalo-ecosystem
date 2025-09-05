// --- apps/public-site/src/app/page.tsx (DEFINITIVE FINAL ASSEMBLY) ---
import React from 'react';
import { database } from '@/firebase';
import { ref, get } from 'firebase/database';
import { Footer } from '@repo/ui/footer';

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
import '@/components/Header.css'; // Using path alias for consistency
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

// Data Fetching Function (runs on the server) - unchanged
async function getLandingPageBlueprint() {
  try {
    const sectionsRef = ref(database, 'siteContent/landingPage/sections');
    const contentRef = ref(database, 'siteContent/landingPage/content');
    const [sectionsSnapshot, contentSnapshot] = await Promise.all([get(sectionsRef), get(contentRef)]);
    if (!sectionsSnapshot.exists() || !contentSnapshot.exists()) { return { sections: [], content: {} }; }
    const sectionsData = sectionsSnapshot.val();
    const sectionsArray = Object.keys(sectionsData).map(key => ({ id: key, ...sectionsData[key] })).sort((a, b) => a.order - b.order);
    return { sections: sectionsArray, content: contentSnapshot.val() };
  } catch (error) {
    console.error("Error fetching landing page blueprint:", error);
    return { sections: [], content: {} };
  }
}

// The Main Page: A Server Component
export default async function HomePage() {
  const { sections, content } = await getLandingPageBlueprint();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ComponentMap: { [key: string]: React.ComponentType<any> } = {
    Hero, PainAgitation, Solution, Benefits, Testimonials, ValueStack, Scarcity, Guarantee, Reminder,
  };

  return (
    <PageClientWrapper>
      <main>
        {sections.map(section => {
          const Component = ComponentMap[section.type];
          const sectionContent = content[section.contentId];
          if (!Component) return <div key={section.id}>Error: Component &quot;{section.type}&quot; not found.</div>;
          return <Component key={section.id} content={sectionContent} />;
        })}
      </main>
      <Footer />
    </PageClientWrapper>
  );
}
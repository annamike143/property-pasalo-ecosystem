// --- apps/status-page/src/app/layout.tsx ---
import type { Metadata } from "next";
import "./globals.css";

// Importing our shared components from the UI package
import { Footer } from "@repo/ui/footer";
import { AgentProfileStrip } from "@repo/ui";
import PageClientWrapper from "../components/PageClientWrapper";
import { database } from "@/firebase";
import { ref, get } from "firebase/database";

export const metadata: Metadata = {
  title: "Community Hub | Property Pasalo",
  description: "See the live status of the Property Pasalo community, including available units and new homeowners.",
};

type FooterContent = {
  copyrightText?: string;
  poweredByText?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  customLinks?: { label: string; url: string; iconKey?: string }[];
};

async function getFooterContent(): Promise<FooterContent> {
  try {
    const snap = await get(ref(database, 'siteContent/footer'));
    return snap.exists() ? (snap.val() as FooterContent) : {};
  } catch {
    return {} as FooterContent;
  }
}

async function getAgentProfile() {
  try {
    const snap = await get(ref(database, 'siteContent/agentProfile'));
    return snap.exists() ? snap.val() : null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [footer, agentProfile] = await Promise.all([
    getFooterContent(),
    getAgentProfile(),
  ]);
  return (
    <html lang="en">
      <body>
        <PageClientWrapper>
          <main>{children}</main>
          {agentProfile && <AgentProfileStrip {...agentProfile} />}
          <Footer
            copyrightText={footer?.copyrightText}
            poweredByText={footer?.poweredByText}
            facebookUrl={footer?.facebookUrl}
            youtubeUrl={footer?.youtubeUrl}
            tiktokUrl={footer?.tiktokUrl}
            linkedinUrl={footer?.linkedinUrl}
            instagramUrl={footer?.instagramUrl}
            xUrl={footer?.xUrl}
            customLinks={footer?.customLinks}
          />
        </PageClientWrapper>
      </body>
    </html>
  );
}
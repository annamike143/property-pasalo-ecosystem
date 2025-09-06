// --- apps/public-site/src/app/api/submit-lead/route.ts ---
import { NextRequest, NextResponse } from 'next/server';

interface LeadData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  businessPage?: string;
  type: 'LEAD' | 'SELLER_INQUIRY';
  interestedProperty?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: LeadData = await request.json();
    
    // 1. Validate the incoming data
    if (!data.firstName || !data.lastName || !data.type) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, and type are required." },
        { status: 400 }
      );
    }

    // 2. Call the Firebase function from server-side (no CORS issues)
    const response = await fetch(
      'https://us-central1-property-pasalo-main.cloudfunctions.net/writeLeadToDbV2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firebase function error:', errorText);
      throw new Error('Failed to submit to Firebase function');
    }

    const result = await response.json();
    
    return NextResponse.json(result);

  } catch (error) {
    console.error("Error submitting lead:", error);
    return NextResponse.json(
      { error: "An error occurred while saving the inquiry. Please try again." },
      { status: 500 }
    );
  }
}

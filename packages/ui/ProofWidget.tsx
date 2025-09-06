// --- packages/ui/ProofWidget.tsx (Real-time Firebase Version) ---
'use client';
import React, { useState, useEffect } from 'react';
import type { Database } from 'firebase/database';

interface Event {
  message: string;
  timestamp: number;
  type?: string;
  clientId?: string;
}

interface ProofWidgetProps {
  firebaseDatabase?: Database;
}

const widgetStyles: React.CSSProperties = {
  position: 'fixed',
  bottom: '20px',
  left: '20px',
  maxWidth: '320px',
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  zIndex: 1000,
  fontSize: '14px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  transition: 'all 0.3s ease',
  transform: 'translateY(0)',
  opacity: 1,
};

const avatarStyles: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#0A2540',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '16px',
  marginRight: '12px',
  flexShrink: 0,
};

const contentStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
};

const textStyles: React.CSSProperties = {
  flex: 1,
};

const messageStyles: React.CSSProperties = {
  margin: '0 0 4px 0',
  fontWeight: '500',
  color: '#1a1a1a',
  lineHeight: '1.3',
};

const timeStyles: React.CSSProperties = {
  margin: 0,
  color: '#666',
  fontSize: '12px',
};

const pulseKeyframes = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const pulseStyles: React.CSSProperties = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  width: '8px',
  height: '8px',
  backgroundColor: '#22c55e',
  borderRadius: '50%',
  animation: 'pulse 2s infinite',
};

export const ProofWidget: React.FC<ProofWidgetProps> = ({ firebaseDatabase }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Fallback mock events if Firebase is not available or no events exist
  const mockEvents: Event[] = [
    {
      message: "Maria S. just inquired about selling her property.",
      timestamp: Date.now() - 5 * 60 * 1000, // 5 minutes ago
      type: "SELLER_INQUIRY"
    },
    {
      message: "John D. just booked a viewing!",
      timestamp: Date.now() - 12 * 60 * 1000, // 12 minutes ago
      type: "LEAD"
    },
    {
      message: "Anna R. just inquired about selling.",
      timestamp: Date.now() - 18 * 60 * 1000, // 18 minutes ago
      type: "SELLER_INQUIRY"
    },
    {
      message: "Carlos M. just booked a viewing!",
      timestamp: Date.now() - 25 * 60 * 1000, // 25 minutes ago
      type: "LEAD"
    },
  ];

  useEffect(() => {
    // Try to fetch real events from Firebase
    const fetchEvents = async () => {
      if (firebaseDatabase) {
        try {
          const { ref, query, orderByChild, limitToLast, onValue } = await import('firebase/database');
          const eventsRef = ref(firebaseDatabase, 'events');
          const recentEventsQuery = query(eventsRef, orderByChild('timestamp'), limitToLast(10));
          
          onValue(recentEventsQuery, (snapshot) => {
            if (snapshot.exists()) {
              const eventData: Event[] = [];
              snapshot.forEach((child) => {
                eventData.push({
                  ...child.val(),
                  id: child.key,
                });
              });
              // Reverse to show most recent first
              setEvents(eventData.reverse());
            } else {
              // Use mock events if no real events exist
              setEvents(mockEvents);
            }
          });
        } catch (error) {
          console.warn("Failed to fetch Firebase events, using mock data:", error);
          setEvents(mockEvents);
        }
      } else {
        // Use mock events if no Firebase available
        setEvents(mockEvents);
      }
    };

    fetchEvents();
  }, [firebaseDatabase]);

  useEffect(() => {
    if (events.length === 0) return;

    let showTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;
    let cycleTimeout: NodeJS.Timeout;

    // Show widget after initial delay
    showTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 5000); // Show after 5 seconds

    // Hide widget after display time
    hideTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 10000); // Hide after 10 seconds (5 seconds visible)

    // Cycle to next event
    cycleTimeout = setTimeout(() => {
      setCurrentEventIndex(prev => (prev + 1) % events.length);
    }, 15000); // Cycle every 15 seconds

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      clearTimeout(cycleTimeout);
    };
  }, [events, currentEventIndex]);

  if (!isVisible || !events[currentEventIndex]) {
    return null;
  }

  const currentEvent = events[currentEventIndex];
  const timeAgo = Math.round((Date.now() - currentEvent.timestamp) / 60000);
  const displayTime = timeAgo < 1 ? "just now" : `${timeAgo} minute${timeAgo !== 1 ? 's' : ''} ago`;

  // Get first letter for avatar
  const firstLetter = currentEvent.message.charAt(0).toUpperCase();

  return (
    <div style={widgetStyles}>
      <style>
        {pulseKeyframes}
      </style>
      <div style={pulseStyles}></div>
      <div style={contentStyles}>
        <div style={avatarStyles}>
          {firstLetter}
        </div>
        <div style={textStyles}>
          <p style={messageStyles}>{currentEvent.message}</p>
          <small style={timeStyles}>{displayTime}</small>
        </div>
      </div>
    </div>
  );
};
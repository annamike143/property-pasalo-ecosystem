// --- apps/public-site/src/components/Reminder.tsx ---
'use client';
import React from 'react';
import './Reminder.css';

interface ReminderProps {
  content: {
    warningText: string;
    psText: string;
  };
}

const Reminder: React.FC<ReminderProps> = ({ content }) => {
  const displayContent = content || {
    warningText: 'Loading warning...',
    psText: 'Loading reminder...'
  };

  return (
    <div className="reminder-section">
      <div className="container reminder-container">
        <p>
          <strong>Warning:</strong> {displayContent.warningText}
        </p>
        <p>
          <strong>P.S.</strong> {displayContent.psText}
        </p>
      </div>
    </div>
  );
};

export default Reminder;
// --- apps/admin-portal/src/components/IconSelector.tsx ---
'use client';
import React, { useState } from 'react';
import './IconSelector.css';

interface IconSelectorProps {
  selectedIcon?: string;
  onIconSelect: (icon: string) => void;
}

const AVAILABLE_ICONS = [
  { icon: '⏰', name: 'Clock' },
  { icon: '🎯', name: 'Target' },
  { icon: '🤝', name: 'Handshake' },
  { icon: '📈', name: 'Chart' },
  { icon: '💰', name: 'Money' },
  { icon: '🏠', name: 'House' },
  { icon: '⚡', name: 'Lightning' },
  { icon: '🔐', name: 'Security' },
  { icon: '🎉', name: 'Celebration' },
  { icon: '✨', name: 'Sparkles' },
  { icon: '💎', name: 'Diamond' },
  { icon: '🚀', name: 'Rocket' },
  { icon: '🎪', name: 'Tent' },
  { icon: '🔑', name: 'Key' },
  { icon: '💡', name: 'Lightbulb' },
  { icon: '🏆', name: 'Trophy' },
  { icon: '🎊', name: 'Confetti' },
  { icon: '⭐', name: 'Star' },
  { icon: '🌟', name: 'Star2' },
  { icon: '💪', name: 'Strong' },
  { icon: '👑', name: 'Crown' },
  { icon: '🎖️', name: 'Medal' },
  { icon: '🔥', name: 'Fire' },
  { icon: '⚙️', name: 'Gear' },
  { icon: '📊', name: 'Graph' },
  { icon: '🎁', name: 'Gift' },
  { icon: '🏅', name: 'Medal2' },
  { icon: '💯', name: 'Hundred' },
];

const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onIconSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (icon: string) => {
    onIconSelect(icon);
    setIsOpen(false);
  };

  return (
    <div className="icon-selector">
      <button 
        type="button"
        className="icon-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedIcon ? (
          <span className="selected-icon">{selectedIcon}</span>
        ) : (
          <span className="placeholder">Choose Icon</span>
        )}
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="icon-dropdown">
          <div className="icon-grid">
            {AVAILABLE_ICONS.map((iconItem) => (
              <button
                key={iconItem.icon}
                type="button"
                className={`icon-option ${selectedIcon === iconItem.icon ? 'selected' : ''}`}
                onClick={() => handleSelect(iconItem.icon)}
                title={iconItem.name}
              >
                {iconItem.icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconSelector;

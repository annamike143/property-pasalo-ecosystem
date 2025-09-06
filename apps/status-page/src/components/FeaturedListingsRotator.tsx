// --- apps/status-page/src/components/FeaturedListingsRotator.tsx ---
'use client';
import React from 'react';
import Image from 'next/image';
import './FeaturedListingsRotator.css';

export type RotatorListing = {
  id: string;
  propertyName: string;
  urlSlug: string;
  thumbnailImageUrl: string | null;
  location: string;
  cashOutPrice: number;
};

interface Props {
  listings: RotatorListing[];
}

const FeaturedListingsRotator: React.FC<Props> = ({ listings }) => {
  const [index, setIndex] = React.useState(0);
  const total = listings.length;

  React.useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    if (!mql.matches) return; // mobile only
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(interval);
  }, [total]);

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  const item = listings[index];
  if (!item) return null;

  return (
    <div className="rotator">
      <div className="rotator-card">
        {item.thumbnailImageUrl ? (
          <Image src={item.thumbnailImageUrl} alt={item.propertyName} className="rotator-thumb" width={400} height={280} />
        ) : (
          <div className="rotator-thumb placeholder" />
        )}
        <div className="rotator-body">
          <h3 className="rotator-title">{item.propertyName}</h3>
          <p className="rotator-location">{item.location}</p>
          <p className="rotator-price">₱{item.cashOutPrice.toLocaleString()}</p>
          <a className="rotator-link" href={`/listings/${item.urlSlug}`}>View details</a>
        </div>
      </div>
      {total > 1 && (
        <div className="rotator-controls">
          <button onClick={prev} aria-label="Previous listing">‹</button>
          <span className="rotator-indicator">{index + 1} / {total}</span>
          <button onClick={next} aria-label="Next listing">›</button>
        </div>
      )}
    </div>
  );
};

export default FeaturedListingsRotator;

// --- apps/public-site/src/components/ListingCard.tsx ---
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './ListingCard.css';

interface ListingCardProps {
  slug: string;
  thumbnailUrl: string | null;
  propertyName: string;
  cashOutPrice: number;
  status: 'AVAILABLE' | 'SOLD';
}

const ListingCard: React.FC<ListingCardProps> = ({ slug, thumbnailUrl, propertyName, cashOutPrice, status }) => {
  const isSold = status === 'SOLD';
  
  return (
    <Link href={`/listings/${slug}`} className={`listing-card ${isSold ? 'sold' : ''}`}>
      <div className="card-image-container">
        {thumbnailUrl ? (
          <Image 
            src={thumbnailUrl} 
            alt={`Thumbnail of ${propertyName}`} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }} 
          />
        ) : (
          <div className="card-image-placeholder">No Image</div>
        )}
        {isSold && <div className="sold-badge">SOLD</div>}
      </div>
      <div className="card-content">
        <h3>{propertyName}</h3>
        {!isSold && (
          <p className="price">₱{cashOutPrice.toLocaleString()} Cash-Out</p>
        )}
        <div className="card-cta">
          {isSold ? <span>This property is sold</span> : 'See Full Details →'}
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
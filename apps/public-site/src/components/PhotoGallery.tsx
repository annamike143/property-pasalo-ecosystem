// --- apps/public-site/src/components/PhotoGallery.tsx ---
'use client';
import React from 'react';
import Image from 'next/image';
import './PhotoGallery.css';

interface PhotoGalleryProps {
  thumbnailUrl: string | null;
  galleryUrls: string[];
  videoUrl: string;
  propertyName: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ thumbnailUrl, galleryUrls, videoUrl, propertyName }) => {
  // Create a full list of images for the gallery display
  const displayImages = [thumbnailUrl, ...galleryUrls].filter(Boolean) as string[];

  return (
    <div className="gallery-container">
      {displayImages[0] && (
        <div className="hero-image-wrapper">
          <Image src={displayImages[0]} alt={`Main photo of ${propertyName}`} fill style={{ objectFit: 'cover' }} />
        </div>
      )}
      
      <div className="side-images-wrapper">
        {displayImages[1] && <Image src={displayImages[1]} alt={`Gallery photo 2 of ${propertyName}`} fill style={{ objectFit: 'cover' }} />}
        {displayImages[2] && <Image src={displayImages[2]} alt={`Gallery photo 3 of ${propertyName}`} fill style={{ objectFit: 'cover' }} />}
      </div>

      <div className="video-wrapper">
        {videoUrl ? (
          <iframe
            src={`https://www.youtube.com/embed/${new URL(videoUrl).searchParams.get('v') || videoUrl.split('/').pop()}`}
            title={`${propertyName} Video Tour`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
            <div className="video-placeholder">No Video Tour Available</div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;
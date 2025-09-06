// --- apps/public-site/src/components/PhotoGallery.tsx (Enhanced Real Estate Gallery) ---
'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import './PhotoGallery.css';
import './PhotoGallery-Enhanced.css';

interface PhotoGalleryProps {
  thumbnailUrl: string | null;
  galleryUrls: string[];
  videoUrl: string;
  propertyName: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ thumbnailUrl, galleryUrls, videoUrl, propertyName }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVideoTour, setShowVideoTour] = useState(false);
  
  // Combine all images with thumbnail first
  const allImages = [thumbnailUrl, ...(galleryUrls || [])].filter(Boolean) as string[];
  const hasMultipleImages = allImages.length > 1;
  const hasVideoTour = videoUrl && videoUrl.trim() !== '';

  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return url; // Return original if not a YouTube URL
  };

  return (
    <div className="enhanced-gallery-container">
      {/* Main Display Area */}
      <div className="main-display">
        {!showVideoTour ? (
          <div className="main-image-wrapper">
            <Image 
              src={allImages[activeImageIndex]} 
              alt={`${propertyName} - Photo ${activeImageIndex + 1}`} 
              fill 
              sizes="(max-width: 768px) 100vw, 70vw"
              style={{ objectFit: 'cover' }} 
            />
            
            {/* Image Navigation */}
            {hasMultipleImages && (
              <>
                <button 
                  className="nav-btn prev-btn"
                  onClick={() => setActiveImageIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1)}
                  aria-label="Previous image"
                >
                  &#8249;
                </button>
                <button 
                  className="nav-btn next-btn"
                  onClick={() => setActiveImageIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0)}
                  aria-label="Next image"
                >
                  &#8250;
                </button>
              </>
            )}

            {/* Image Counter */}
            {hasMultipleImages && (
              <div className="image-counter">
                {activeImageIndex + 1} of {allImages.length}
              </div>
            )}
          </div>
        ) : (
          <div className="video-wrapper">
            <iframe
              src={getEmbedUrl(videoUrl)}
              title={`${propertyName} Video Tour`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
      </div>

      {/* Gallery Controls */}
      <div className="gallery-controls">
        {/* Thumbnail Strip */}
        {hasMultipleImages && (
          <div className="thumbnail-strip">
            {allImages.map((imageUrl, index) => (
              <button
                key={index}
                className={`thumbnail ${!showVideoTour && activeImageIndex === index ? 'active' : ''}`}
                onClick={() => {
                  setActiveImageIndex(index);
                  setShowVideoTour(false);
                }}
              >
                <Image 
                  src={imageUrl} 
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Video Tour Button */}
        {hasVideoTour && (
          <div className="video-control">
            <button
              className={`video-tour-btn ${showVideoTour ? 'active' : ''}`}
              onClick={() => setShowVideoTour(!showVideoTour)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              {showVideoTour ? 'Show Photos' : 'Video Tour'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;
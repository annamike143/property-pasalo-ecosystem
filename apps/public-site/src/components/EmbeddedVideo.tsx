// --- apps/public-site/src/components/EmbeddedVideo.tsx ---
'use client';
import React from 'react';

interface EmbeddedVideoProps {
    title: string;
    videoUrl: string;
}

const EmbeddedVideo: React.FC<EmbeddedVideoProps> = ({ title, videoUrl }) => {
    // Extract video ID from YouTube URL
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeId(videoUrl);

    if (!videoId) {
        return null;
    }

    return (
        <div className="embedded-video-container">
            <h3>{title}</h3>
            <div className="video-wrapper">
                <iframe
                    width="100%"
                    height="315"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>

            <style jsx>{`
                .embedded-video-container {
                    margin: 2rem 0;
                }
                
                .embedded-video-container h3 {
                    color: #374151;
                    margin-bottom: 1rem;
                    font-size: 1.5rem;
                    font-weight: 600;
                }
                
                .video-wrapper {
                    position: relative;
                    padding-bottom: 56.25%; /* 16:9 aspect ratio */
                    height: 0;
                    overflow: hidden;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                
                .video-wrapper iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 8px;
                }
            `}</style>
        </div>
    );
};

export default EmbeddedVideo;
// --- apps/admin-portal/src/components/ImageUploader.tsx ---
'use client';
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import './ImageUploader.css';

// TypeScript Interface for our component's props
interface ImageUploaderProps {
    onUploadComplete: (url: string) => void;
    currentImageUrl?: string | null;
    uploadId?: string; // Add unique ID prop
    resize?: { method?: 'fit' | 'cover' | 'thumb' | 'scale'; width?: number; height?: number };
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadComplete, currentImageUrl, uploadId, resize }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    
    // Generate a unique ID if one isn't provided
    const uniqueId = uploadId || `imageUpload-${Math.random().toString(36).substr(2, 9)}`;

    const onFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const selectedFile = files[0];
        
        // Basic validation
        if (!selectedFile.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            return;
        }
        
        if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
            setError('File size should be less than 5MB.');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64Data = (reader.result as string).split(',')[1]; // Remove data:image/jpeg;base64, part
                    
                    // Use V2 HTTP function instead of callable for better authentication
                    const authToken = await user?.getIdToken();
                    
                    const response = await fetch(
                        'https://us-central1-property-pasalo-main.cloudfunctions.net/compressAndUploadImageV2',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${authToken}`
                            },
                            body: JSON.stringify({
                                fileBuffer: base64Data,
                                fileName: selectedFile.name,
                                contentType: selectedFile.type,
                                resize: resize ? { method: resize.method || 'cover', width: resize.width, height: resize.height } : undefined
                            })
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    
                    if (data.success && data.url) {
                        onUploadComplete(data.url);
                        console.log('Image uploaded successfully:', data.url);
                    } else {
                        setError(data.error || 'Upload failed. Please try again.');
                    }
                } catch (uploadError: unknown) {
                    console.error('Upload error:', uploadError);
                    
                    if (uploadError instanceof Error) {
                        if (uploadError.message.includes('unauthenticated')) {
                            setError('You must be logged in to upload images.');
                        } else if (uploadError.message.includes('permission-denied')) {
                            setError('You do not have permission to upload images.');
                        } else {
                            setError(`Upload failed: ${uploadError.message}`);
                        }
                    } else {
                        setError('An unknown error occurred during upload.');
                    }
                } finally {
                    setUploading(false);
                }
            };
            
            reader.onerror = () => {
                setError('Error reading file. Please try again.');
                setUploading(false);
            };
            
            reader.readAsDataURL(selectedFile);
        } catch (error) {
            console.error('File reading error:', error);
            setError('Error processing file. Please try again.');
            setUploading(false);
        }
    }, [onUploadComplete, user]);

    return (
        <div className="image-uploader">
            <div className="current-image">
                {currentImageUrl ? (
                    <img 
                        src={currentImageUrl} 
                        alt="Current" 
                        style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                ) : (
                    <div style={{ 
                        width: '150px', 
                        height: '100px', 
                        backgroundColor: '#f0f0f0', 
                        border: '2px dashed #ccc',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666'
                    }}>
                        <span>No Image</span>
                    </div>
                )}
            </div>
            <div className="uploader-controls">
                <input
                    type="file"
                    id={uniqueId}
                    accept="image/png, image/jpeg"
                    onChange={onFileChange}
                    style={{ display: 'none' }}
                    disabled={uploading}
                />
                <label htmlFor={uniqueId} className={`upload-button ${uploading ? 'disabled' : ''}`}>
                    {uploading ? 'Uploading...' : 'Choose Image'}
                </label>
                {error && <p className="error-text">{error}</p>}
            </div>
        </div>
    );
};

export default ImageUploader;

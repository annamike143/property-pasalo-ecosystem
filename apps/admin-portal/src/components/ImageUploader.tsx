// --- apps/admin-portal/src/components/ImageUploader.tsx ---
'use client';
import React, { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import './ImageUploader.css';

// TypeScript Interface for our component's props
interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadComplete, currentImageUrl }) => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

    const handleUpload = useCallback(async (file: File) => {
        if (!file) return;

        // Check if user is authenticated
        if (!user) {
            setError('You must be logged in to upload images.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('File is too large. Max 5MB.');
            return;
        }

        setUploading(true);
        setError(null);

        // Create a temporary preview URL
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        // Read the file as a Base64 string to send to the function
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64String = (reader.result as string).split(',')[1];
            
            try {
                // Add more detailed logging to debug the issue
                console.log('Starting upload process...');
                console.log('File details:', { name: file.name, type: file.type, size: file.size });
                
                const compressAndUploadImage = httpsCallable(functions, 'compressAndUploadImage');
                
                console.log('Calling Firebase function...');
                const result = await compressAndUploadImage({
                    fileBuffer: base64String,
                    fileName: file.name,
                    contentType: file.type,
                });
                
                console.log('Function result:', result);
                
                const data = result.data as { success: boolean, url: string };
                if (data.success && data.url) {
                    onUploadComplete(data.url);
                    setPreview(data.url); // Update preview to the final URL
                } else {
                    throw new Error('Upload failed on the server.');
                }
            } catch (err) {
                console.error('Detailed error information:');
                console.error('Error object:', err);
                console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
                console.error('Error code:', (err as {code?: string})?.code);
                console.error('Error details:', (err as {details?: string})?.details);
                
                setError('Upload failed. Please try again. Check console for details.');
                setPreview(currentImageUrl || null); // Revert preview on error
            } finally {
                setUploading(false);
            }
        };
        reader.onerror = () => {
            setError('Failed to read file.');
            setUploading(false);
        };
    }, [onUploadComplete, currentImageUrl, user]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    return (
        <div className="uploader-container">
            <div className="preview-box">
                {preview ? (
                    <img src={preview} alt="Preview" className="image-preview" />
                ) : (
                    <span>No Image</span>
                )}
            </div>
            <div className="uploader-controls">
                <input
                    type="file"
                    id="imageUpload"
                    accept="image/png, image/jpeg"
                    onChange={onFileChange}
                    style={{ display: 'none' }}
                    disabled={uploading}
                />
                <label htmlFor="imageUpload" className={`upload-button ${uploading ? 'disabled' : ''}`}>
                    {uploading ? 'Uploading...' : 'Choose Image'}
                </label>
                {error && <p className="error-text">{error}</p>}
            </div>
        </div>
    );
};

export default ImageUploader;
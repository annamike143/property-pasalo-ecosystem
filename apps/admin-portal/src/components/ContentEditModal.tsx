// --- apps/admin-portal/src/components/ContentEditModal.tsx ---
'use client';
import React, { useState, useEffect } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '@/firebase';
import ImageUploader from './ImageUploader';
import IconSelector from './IconSelector';
import './ContentEditModal.css';

interface ContentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: string;
  contentId: string;
}

interface ContentData {
  // Hero content
  attentionMessage?: string;
  mainHeadline?: string;
  subHeadline?: string;
  benefitBullets?: BulletPoint[];
  
  // Pain content
  painPoints?: PainPoint[];
  
  // Solution content
  headline?: string;
  portraitImage?: string;
  storyText?: string;
  
  // Benefits content
  benefits?: Benefit[];
  
  // Testimonials content
  testimonials?: Testimonial[];
  
  // Value Stack content
  valueItems?: ValueItem[];
  totalValueText?: string;
  totalValueAmount?: string;
  
  // Scarcity content
  strikethroughPrice?: string;
  yourPriceText?: string;
  mainText?: string;
  
  // Guarantee content
  text?: string;
  ctaText?: string;
  
  // Reminder content
  warningText?: string;
  psText?: string;
  
  // Generic fields
  [key: string]: string | number | boolean | ContentArrayItem[] | undefined;
}

interface ContentArrayItem {
  id?: string;
  [key: string]: string | number | boolean | undefined;
}

interface BulletPoint extends ContentArrayItem {
  text: string;
}

interface PainPoint extends ContentArrayItem {
  headline: string;
  description: string;
  image: string;
}

interface Benefit extends ContentArrayItem {
  icon: string;
  headline: string;
  description: string;
}

interface Testimonial extends ContentArrayItem {
  clientName: string;
  title: string;
  quote: string;
  clientImage: string;
}

interface ValueItem extends ContentArrayItem {
  name: string;
  value: string;
}

const ContentEditModal: React.FC<ContentEditModalProps> = ({ 
  isOpen, 
  onClose, 
  sectionType, 
  contentId 
}) => {
  const [content, setContent] = useState<ContentData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !contentId) return;

    const loadContent = async () => {
      setLoading(true);
      try {
        const contentRef = ref(database, `siteContent/landingPage/content/${contentId}`);
        const snapshot = await get(contentRef);
        if (snapshot.exists()) {
          setContent(snapshot.val());
        }
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [isOpen, contentId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const contentRef = ref(database, `siteContent/landingPage/content/${contentId}`);
      await set(contentRef, content);
      alert('Content saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (field: string, value: string | number | boolean) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateArrayItem = (arrayField: string, index: number, field: string, value: string | number | boolean) => {
    console.log('updateArrayItem called:', { arrayField, index, field, value });
    setContent(prev => {
      const currentArray = prev[arrayField];
      if (Array.isArray(currentArray)) {
        const updatedArray = currentArray.map((item: ContentArrayItem, i: number) => {
          if (i === index) {
            console.log('Updating item at index', i, 'with', { [field]: value });
            return { ...item, [field]: value };
          }
          return item;
        });
        console.log('Updated array:', updatedArray);
        return {
          ...prev,
          [arrayField]: updatedArray
        };
      }
      return prev;
    });
  };

  const addArrayItem = (arrayField: string, newItem: ContentArrayItem) => {
    setContent(prev => {
      const currentArray = prev[arrayField];
      const arrayToUpdate = Array.isArray(currentArray) ? currentArray : [];
      return {
        ...prev,
        [arrayField]: [...arrayToUpdate, { ...newItem, id: Date.now().toString() }]
      };
    });
  };

  const removeArrayItem = (arrayField: string, index: number) => {
    setContent(prev => {
      const currentArray = prev[arrayField];
      if (Array.isArray(currentArray)) {
        return {
          ...prev,
          [arrayField]: currentArray.filter((_: ContentArrayItem, i: number) => i !== index)
        };
      }
      return prev;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit {sectionType} Content</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <p>Loading content...</p>
          ) : (
            <div className="content-form">
              {renderContentFields(sectionType, content, updateContent, updateArrayItem, addArrayItem, removeArrayItem)}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button 
            className="save-btn" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

function renderContentFields(
  sectionType: string, 
  content: ContentData, 
  updateContent: (field: string, value: string | number | boolean) => void,
  updateArrayItem: (arrayField: string, index: number, field: string, value: string | number | boolean) => void,
  addArrayItem: (arrayField: string, newItem: ContentArrayItem) => void,
  removeArrayItem: (arrayField: string, index: number) => void
) {
  switch (sectionType) {
    case 'Hero':
      return (
        <>
          <div className="form-group">
            <label>Attention Message</label>
            <input
              type="text"
              value={content.attentionMessage || ''}
              onChange={(e) => updateContent('attentionMessage', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Main Headline</label>
            <textarea
              value={content.mainHeadline || ''}
              onChange={(e) => updateContent('mainHeadline', e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Sub Headline</label>
            <input
              type="text"
              value={content.subHeadline || ''}
              onChange={(e) => updateContent('subHeadline', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Benefit Bullets</label>
            {Array.isArray(content.benefitBullets) && content.benefitBullets.map((bullet: BulletPoint, index: number) => (
              <div key={bullet.id} className="array-item">
                <textarea
                  value={bullet.text || ''}
                  onChange={(e) => updateArrayItem('benefitBullets', index, 'text', e.target.value)}
                  placeholder="Benefit bullet text"
                />
                <button 
                  className="remove-btn"
                  onClick={() => removeArrayItem('benefitBullets', index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      );

    case 'PainAgitation':
      return (
        <>
          <div className="form-group">
            <label>Main Headline</label>
            <input
              type="text"
              value={content.mainHeadline || ''}
              onChange={(e) => updateContent('mainHeadline', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Pain Points</label>
            {Array.isArray(content.painPoints) && content.painPoints.map((pain: PainPoint, index: number) => (
              <div key={pain.id} className="array-item pain-point">
                <input
                  type="text"
                  placeholder="Pain point headline"
                  value={pain.headline || ''}
                  onChange={(e) => updateArrayItem('painPoints', index, 'headline', e.target.value)}
                />
                <textarea
                  placeholder="Pain point description"
                  value={pain.description || ''}
                  onChange={(e) => updateArrayItem('painPoints', index, 'description', e.target.value)}
                />
                <div className="image-upload-container">
                  <label>Pain Point Image</label>
                  <ImageUploader
                    uploadId={`painPoints-${index}`}
                    onUploadComplete={(url: string) => updateArrayItem('painPoints', index, 'image', url)}
                    currentImageUrl={pain.image}
                  />
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeArrayItem('painPoints', index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              className="add-btn"
              onClick={() => addArrayItem('painPoints', { headline: '', description: '', image: '' })}
            >
              + Add Pain Point
            </button>
          </div>
        </>
      );

    case 'Solution':
      return (
        <>
          <div className="form-group">
            <label>Headline</label>
            <input
              type="text"
              value={content.headline || ''}
              onChange={(e) => updateContent('headline', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Portrait Image</label>
            <ImageUploader
              onUploadComplete={(url: string) => updateContent('portraitImage', url)}
              currentImageUrl={content.portraitImage}
            />
          </div>
          <div className="form-group">
            <label>Story Text</label>
            <textarea
              value={content.storyText || ''}
              onChange={(e) => updateContent('storyText', e.target.value)}
              rows={5}
            />
          </div>
        </>
      );

    case 'Benefits':
      return (
        <>
          <div className="form-group">
            <label>Main Headline</label>
            <input
              type="text"
              value={content.mainHeadline || ''}
              onChange={(e) => updateContent('mainHeadline', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Benefits</label>
            {Array.isArray(content.benefits) && content.benefits.map((benefit: Benefit, index: number) => (
              <div key={benefit.id} className="array-item benefit-item">
                <div className="icon-selector-container">
                  <label>Icon</label>
                  <IconSelector
                    selectedIcon={benefit.icon || ''}
                    onIconSelect={(selectedIcon: string) => updateArrayItem('benefits', index, 'icon', selectedIcon)}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Benefit headline"
                  value={benefit.headline || ''}
                  onChange={(e) => updateArrayItem('benefits', index, 'headline', e.target.value)}
                />
                <textarea
                  placeholder="Benefit description"
                  value={benefit.description || ''}
                  onChange={(e) => updateArrayItem('benefits', index, 'description', e.target.value)}
                />
                <button 
                  className="remove-btn"
                  onClick={() => removeArrayItem('benefits', index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              className="add-btn"
              onClick={() => addArrayItem('benefits', { icon: '', headline: '', description: '' })}
            >
              + Add Benefit
            </button>
          </div>
        </>
      );

    case 'Testimonials':
      return (
        <>
          <div className="form-group">
            <label>Headline</label>
            <input
              type="text"
              value={content.headline || ''}
              onChange={(e) => updateContent('headline', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Testimonials</label>
            {Array.isArray(content.testimonials) && content.testimonials.map((testimonial: Testimonial, index: number) => (
              <div key={testimonial.id} className="array-item testimonial-item">
                <input
                  type="text"
                  placeholder="Client name"
                  value={testimonial.clientName || ''}
                  onChange={(e) => updateArrayItem('testimonials', index, 'clientName', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Client title"
                  value={testimonial.title || ''}
                  onChange={(e) => updateArrayItem('testimonials', index, 'title', e.target.value)}
                />
                <textarea
                  placeholder="Testimonial quote"
                  value={testimonial.quote || ''}
                  onChange={(e) => updateArrayItem('testimonials', index, 'quote', e.target.value)}
                />
                <div className="image-upload-container">
                  <label>Client Image</label>
                  <ImageUploader
                    onUploadComplete={(url: string) => updateArrayItem('testimonials', index, 'clientImage', url)}
                    currentImageUrl={testimonial.clientImage}
                  />
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeArrayItem('testimonials', index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              className="add-btn"
              onClick={() => addArrayItem('testimonials', { 
                clientName: '', 
                title: '', 
                quote: '', 
                clientImage: '' 
              })}
            >
              + Add Testimonial
            </button>
          </div>
        </>
      );

    case 'ValueStack':
      return (
        <>
          <div className="form-group">
            <label>Main Headline</label>
            <input
              type="text"
              value={content.mainHeadline || ''}
              onChange={(e) => updateContent('mainHeadline', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Value Items</label>
            {Array.isArray(content.valueItems) && content.valueItems.map((item: ValueItem, index: number) => (
              <div key={item.id} className="array-item value-item">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name || ''}
                  onChange={(e) => updateArrayItem('valueItems', index, 'name', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Value (e.g., ₱35,000)"
                  value={item.value || ''}
                  onChange={(e) => updateArrayItem('valueItems', index, 'value', e.target.value)}
                />
                <button 
                  className="remove-btn"
                  onClick={() => removeArrayItem('valueItems', index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              className="add-btn"
              onClick={() => addArrayItem('valueItems', { name: '', value: '' })}
            >
              + Add Value Item
            </button>
          </div>
          <div className="form-group">
            <label>Total Value Text</label>
            <input
              type="text"
              value={content.totalValueText || ''}
              onChange={(e) => updateContent('totalValueText', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Total Value Amount</label>
            <input
              type="text"
              value={content.totalValueAmount || ''}
              onChange={(e) => updateContent('totalValueAmount', e.target.value)}
            />
          </div>
        </>
      );

    case 'Scarcity':
      return (
        <>
          <div className="form-group">
            <label>Strikethrough Price</label>
            <input
              type="text"
              value={content.strikethroughPrice || ''}
              onChange={(e) => updateContent('strikethroughPrice', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Your Price Text</label>
            <input
              type="text"
              value={content.yourPriceText || ''}
              onChange={(e) => updateContent('yourPriceText', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Main Text</label>
            <textarea
              value={content.mainText || ''}
              onChange={(e) => updateContent('mainText', e.target.value)}
              rows={3}
            />
          </div>
        </>
      );

    case 'Guarantee':
      return (
        <>
          <div className="form-group">
            <label>Headline</label>
            <input
              type="text"
              value={content.headline || ''}
              onChange={(e) => updateContent('headline', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Text</label>
            <textarea
              value={content.text || ''}
              onChange={(e) => updateContent('text', e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>CTA Text</label>
            <input
              type="text"
              value={content.ctaText || ''}
              onChange={(e) => updateContent('ctaText', e.target.value)}
            />
          </div>
        </>
      );

    case 'Reminder':
      return (
        <>
          <div className="form-group">
            <label>Warning Text</label>
            <textarea
              value={content.warningText || ''}
              onChange={(e) => updateContent('warningText', e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>P.S. Text</label>
            <textarea
              value={content.psText || ''}
              onChange={(e) => updateContent('psText', e.target.value)}
              rows={2}
            />
          </div>
        </>
      );

    default:
      return <p>Content editor for {sectionType} not implemented yet.</p>;
  }
}

export default ContentEditModal;

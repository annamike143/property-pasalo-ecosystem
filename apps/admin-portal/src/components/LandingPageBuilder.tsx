// --- apps/admin-portal/src/components/LandingPageBuilder.tsx ---
'use client';
import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ref, onValue, set } from 'firebase/database';
import { database } from '@/firebase';
import ContentEditModal from './ContentEditModal';
import './LandingPageBuilder.css';

interface Section {
    id: string;
    type: string;
    contentId: string;
    order: number;
}

const SortableItem = ({ section, onEdit, onDelete, onMove, index, totalSections }: { 
  section: Section; 
  onEdit: (section: Section) => void;
  onDelete: (sectionId: string) => void;
  onMove: (sectionId: string, direction: 'up' | 'down') => void;
  index: number;
  totalSections: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="section-card"
    >
      <div className="section-header">
        <span className="drag-handle" {...attributes} {...listeners}>⋮⋮</span>
        <span className="section-title">{section.type}</span>
        <div className="order-controls">
          <button
            type="button"
            className="move-btn up"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMove(section.id, 'up');
            }}
            disabled={index === 0}
            title="Move Up"
          >
            ↑
          </button>
          <button
            type="button"
            className="move-btn down"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMove(section.id, 'down');
            }}
            disabled={index === totalSections - 1}
            title="Move Down"
          >
            ↓
          </button>
        </div>
      </div>
      <div className="section-actions" onClick={(e) => e.stopPropagation()}>
        <button 
          type="button" 
          onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation(); 
            onEdit(section); 
          }}
        >
          Edit Content
        </button>
        <button 
          type="button" 
          className="delete" 
          onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation(); 
            onDelete(section.id); 
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const LandingPageBuilder = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    useEffect(() => {
        const sectionsRef = ref(database, 'siteContent/landingPage/sections');
        const unsubscribe = onValue(sectionsRef, (snapshot) => {
            const data = snapshot.val();
            const loadedSections: Section[] = data 
                ? Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a, b) => a.order - b.order) 
                : [];
            setSections(loadedSections);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const moveSection = async (sectionId: string, direction: 'up' | 'down') => {
        const currentIndex = sections.findIndex(section => section.id === sectionId);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        
        // Check bounds
        if (newIndex < 0 || newIndex >= sections.length) return;

        // Create new array with moved items
        const newSections = arrayMove(sections, currentIndex, newIndex);
        
        // Update order and save to Firebase
        const updatedSectionsWithOrder = newSections.map((item, index) => ({ ...item, order: index }));
        
        // Convert to Firebase format
        const sectionsToSave: { [key: string]: Omit<Section, 'id'> } = {};
        updatedSectionsWithOrder.forEach(section => {
            const { id, ...rest } = section;
            sectionsToSave[id] = rest;
        });

        try {
            const sectionsRef = ref(database, 'siteContent/landingPage/sections');
            await set(sectionsRef, sectionsToSave);
            console.log('Section moved successfully');
            
            // Update local state
            setSections(updatedSectionsWithOrder);
        } catch (error) {
            console.error('Error moving section:', error);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);
                
                // Update the order property and save to Firebase immediately
                const updatedSectionsWithOrder = newItems.map((item, index) => ({ ...item, order: index }));
                
                // Convert back to the object structure Firebase expects
                const sectionsToSave: { [key: string]: Omit<Section, 'id'> } = {};
                updatedSectionsWithOrder.forEach(section => {
                    const { id, ...rest } = section;
                    sectionsToSave[id] = rest;
                });

                // Save to Firebase immediately after reordering
                const sectionsRef = ref(database, 'siteContent/landingPage/sections');
                set(sectionsRef, sectionsToSave)
                    .then(() => {
                        console.log('Section order updated successfully');
                    })
                    .catch((error) => {
                        console.error('Error updating section order:', error);
                        alert('Failed to save section order. Please try again.');
                    });

                return newItems;
            });
        }
    };

    const handleEdit = (section: Section) => {
        console.log('Editing section:', section);
        setSelectedSection(section);
        setEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditModalOpen(false);
        setSelectedSection(null);
    };

    const handleDelete = async (sectionId: string) => {
        if (!confirm('Are you sure you want to delete this section?')) return;
        
        try {
            // Remove from local state
            const newSections = sections.filter(s => s.id !== sectionId);
            setSections(newSections);
            
            // Update Firebase - remove the section
            const sectionsToSave: { [key: string]: Omit<Section, 'id'> } = {};
            newSections.forEach((section, index) => {
                const updatedSection = { ...section, order: index };
                const { id, ...rest } = updatedSection;
                sectionsToSave[id] = rest;
            });

            const sectionsRef = ref(database, 'siteContent/landingPage/sections');
            await set(sectionsRef, sectionsToSave);
            
            console.log('Section deleted successfully');
        } catch (error) {
            console.error('Error deleting section:', error);
            alert('Failed to delete section. Please try again.');
        }
    };

    const handleAddSection = async () => {
        const availableSections = [
            { type: 'Hero', contentId: 'hero_content' },
            { type: 'PainAgitation', contentId: 'pain_content' },
            { type: 'Solution', contentId: 'solution_content' },
            { type: 'Benefits', contentId: 'benefits_content' },
            { type: 'Testimonials', contentId: 'testimonials_content' },
            { type: 'ValueStack', contentId: 'valueStack_content' },
            { type: 'Scarcity', contentId: 'scarcity_content' },
            { type: 'Guarantee', contentId: 'guarantee_content' },
            { type: 'Reminder', contentId: 'reminder_content' }
        ];

        // Find sections that aren't already used
        const usedTypes = sections.map(s => s.type);
        const availableOptions = availableSections.filter(s => !usedTypes.includes(s.type));
        
        if (availableOptions.length === 0) {
            alert('All available section types are already in use.');
            return;
        }

        // For now, let's add the first available section
        // In a more advanced implementation, we could show a dropdown to select
        const sectionToAdd = availableOptions[0];
        const newSectionId = `${sectionToAdd.type.toLowerCase()}_section_${Date.now()}`;
        
        try {
            const newSection: Section = {
                id: newSectionId,
                type: sectionToAdd.type,
                contentId: sectionToAdd.contentId,
                order: sections.length
            };

            // Add to local state
            const updatedSections = [...sections, newSection];
            setSections(updatedSections);

            // Update Firebase
            const sectionsToSave: { [key: string]: Omit<Section, 'id'> } = {};
            updatedSections.forEach(section => {
                const { id, ...rest } = section;
                sectionsToSave[id] = rest;
            });

            const sectionsRef = ref(database, 'siteContent/landingPage/sections');
            await set(sectionsRef, sectionsToSave);
            
            console.log('Section added successfully');
            alert(`${sectionToAdd.type} section added successfully!`);
        } catch (error) {
            console.error('Error adding section:', error);
            alert('Failed to add section. Please try again.');
        }
    };

    if (loading) return <p>Loading Page Builder...</p>;

    return (
        <>
            <div className="builder-container">
                <h2>Landing Page Builder</h2>
                <p>Drag and drop the sections to reorder the content on your main sales page.</p>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="section-list">
                            {sections.map((section, index) => (
                                <SortableItem 
                                    key={section.id} 
                                    section={section} 
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onMove={moveSection}
                                    index={index}
                                    totalSections={sections.length}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
                <div className="builder-actions">
                    <button onClick={handleAddSection}>+ Add New Section</button>
                </div>
            </div>
            
            {selectedSection && (
                <ContentEditModal
                    isOpen={editModalOpen}
                    onClose={handleCloseModal}
                    sectionType={selectedSection.type}
                    contentId={selectedSection.contentId}
                />
            )}
        </>
    );
};

export default LandingPageBuilder;
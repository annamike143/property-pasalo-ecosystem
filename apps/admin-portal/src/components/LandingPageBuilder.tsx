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
import './LandingPageBuilder.css';

interface Section {
    id: string;
    type: string;
    order: number;
}

const SortableItem = ({ section }: { section: Section }) => {
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
      {...attributes}
      {...listeners}
      className="section-card"
    >
      <span>{section.type}</span>
      <div className="section-actions">
        <button>Edit Content</button>
        <button className="delete">Delete</button>
      </div>
    </div>
  );
};

const LandingPageBuilder = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);
                
                // Update the order property and save to Firebase
                const updatedSectionsWithOrder = newItems.map((item, index) => ({ ...item, order: index }));
                
                // Convert back to the object structure Firebase expects
                const sectionsToSave: { [key: string]: Omit<Section, 'id'> } = {};
                updatedSectionsWithOrder.forEach(section => {
                    const { id, ...rest } = section;
                    sectionsToSave[id] = rest;
                });

                const sectionsRef = ref(database, 'siteContent/landingPage/sections');
                set(sectionsRef, sectionsToSave);

                return newItems;
            });
        }
    };

    if (loading) return <p>Loading Page Builder...</p>;

    return (
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
                        {sections.map((section) => (
                            <SortableItem key={section.id} section={section} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            <div className="builder-actions">
                <button>+ Add New Section</button>
            </div>
        </div>
    );
};

export default LandingPageBuilder;
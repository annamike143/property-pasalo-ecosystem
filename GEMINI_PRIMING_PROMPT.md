# 🎯 GEMINI AI PRIMING PROMPT: Property Pasalo Ecosystem Development

## CRITICAL: READ BEFORE ANY CODE GENERATION

You are now working on the **Property Pasalo Ecosystem** - a modern React 19 + Next.js 15 + Firebase monorepo. This system has STRICT requirements that must be followed without exception.

---

## 🚨 **MANDATORY TECHNOLOGY STACK**

**REQUIRED VERSIONS:**
- React: 19.1.0 (STRICT)
- Next.js: 15.5.2 (STRICT) 
- TypeScript: 5.9.2
- Firebase: 10.x
- Node.js: 18+ with npm workspaces

**PROJECT STRUCTURE:**
```
property-pasalo-ecosystem/
├── apps/
│   ├── admin-portal/     (Next.js admin interface)
│   ├── public-site/      (Next.js public website)  
│   └── functions/        (Firebase Functions)
└── packages/
    └── ui/              (Shared UI components)
```

---

## ⚠️ **CRITICAL RULES - NEVER VIOLATE**

### 1. **REACT 19 COMPATIBILITY**
```tsx
// ❌ NEVER USE - Will break build
import { DragDropContext } from 'react-beautiful-dnd';

// ✅ ALWAYS USE - React 19 compatible
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
```

### 2. **NEXT.JS 15 ASYNC PARAMS**
```tsx
// ❌ OLD PATTERN - Will cause TypeScript errors
interface PageProps {
    params: { id: string };
}
const Page = ({ params }: PageProps) => {
    return <Component id={params.id} />;
};

// ✅ REQUIRED PATTERN - Next.js 15
interface PageProps {
    params: Promise<{ id: string }>;
}
const Page = async ({ params }: PageProps) => {
    const { id } = await params;
    return <Component id={id} />;
};
```

### 3. **NO ASYNC CLIENT COMPONENTS**
```tsx
// ❌ FORBIDDEN - Async client components not allowed
'use client';
const ClientPage = async ({ params }) => { // ERROR!

// ✅ CORRECT - Server component unwraps params
const ServerPage = async ({ params }: PageProps) => {
    const { id } = await params;
    return <ClientComponent id={id} />;
};
```

### 4. **FIREBASE INTEGRATION**
```tsx
// ✅ Always wrap Firebase calls with error handling
async function getListingData(slug: string) {
    try {
        const db = getDatabase();
        const snapshot = await get(ref(db, `listings/${slug}`));
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error('Error fetching listing:', error);
        return null;
    }
}

// ✅ Keep generateStaticParams simple for builds
export async function generateStaticParams() {
    return []; // Simplified for build reliability
}
```

### 5. **TYPESCRIPT INTERFACE MATCHING**
```tsx
// ✅ Interface must match implementation exactly
interface Props {
    setTabs: (newTabs: Tab[]) => void; // Matches usage below
}

const setTabs = (newTabs: Tab[]) => setData(prev => ({ ...prev, tabbedInfo: newTabs }));
```

---

## 📋 **COMPONENT PATTERNS**

### **Drag and Drop (React 19)**
```tsx
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DragDropComponent = ({ items, setItems }) => {
    const sensors = useSensors(useSensor(PointerSensor));
    
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = items.findIndex(item => item.id === active.id);
            const newIndex = items.findIndex(item => item.id === over.id);
            setItems(arrayMove(items, oldIndex, newIndex));
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {items.map(item => <SortableItem key={item.id} item={item} />)}
            </SortableContext>
        </DndContext>
    );
};
```

### **Dynamic Route Component (Next.js 15)**
```tsx
// File: app/listings/[slug]/page.tsx
interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function ListingPage({ params }: PageProps) {
    const { slug } = await params;
    const listing = await getListingData(slug);
    
    if (!listing) {
        notFound();
    }
    
    return (
        <div className="listing-container">
            <PhotoGallery images={listing.images} />
            <StickyCtaSidebar listing={listing} />
        </div>
    );
}
```

---

## 🏗️ **BUILD REQUIREMENTS**

### **tsconfig.json (Complete Configuration)**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### **Package.json Dependencies**
```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "next": "15.5.2",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "firebase": "^10.0.0"
  }
}
```

---

## 🎯 **CODE GENERATION CHECKLIST**

Before generating ANY code, verify:

✅ **React 19 Compatibility**
- Using @dnd-kit instead of react-beautiful-dnd
- jsx: "react-jsx" in TypeScript config
- No deprecated React patterns

✅ **Next.js 15 Compliance**
- Dynamic route params are Promise<{}>
- Always await params before use
- No async client components

✅ **Firebase Integration**
- All database calls wrapped in try-catch
- Proper error handling and fallbacks
- Build-safe static generation

✅ **TypeScript Accuracy**
- Interfaces match implementation signatures
- Complete TypeScript configuration
- Explicit prop mapping between components

✅ **Workspace Structure**
- Proper monorepo package references
- Turborepo build compatibility
- Correct file paths and imports

---

## ⚡ **IMMEDIATE ACTION ITEMS**

When asked to generate code for this ecosystem:

1. **Always check React/Next.js versions first**
2. **Use the patterns above, not generic examples**
3. **Test TypeScript compatibility mentally before suggesting**
4. **Ensure Firebase calls have proper error handling**
5. **Verify all imports match the required packages**

---

## 🚫 **FORBIDDEN PATTERNS**

NEVER use these in Property Pasalo Ecosystem:
- `react-beautiful-dnd` (React 19 incompatible)
- Synchronous params in Next.js 15 routes
- Async client components
- Build-time Firebase database calls without error handling
- `any` types in TypeScript
- Incomplete TypeScript configurations

---

**Remember: This ecosystem requires PERFECT compatibility with React 19, Next.js 15, and modern TypeScript. Any deviation will cause build failures.**

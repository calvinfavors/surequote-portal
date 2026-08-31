import type { Industry, MaterialConfig, AddonConfig } from './types';

export const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2FsdmluZmF2b3JzMTgiLCJhIjoiY204amd0cmllMGJnZDJqb2ljaHdkdnZsayJ9.XZkrK7ovhWopcFIkubFtaw';

export const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'quoted', label: 'Quoted', color: 'bg-brand-100 text-brand-800' },
  { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-800' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' },
] as const;

export const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'gutters', label: 'Gutters' },
  { value: 'roofs', label: 'Roofing' },
  { value: 'decks', label: 'Decks' },
  { value: 'fences', label: 'Fencing' },
  { value: 'landscaping', label: 'Landscaping' },
];

export const DEFAULT_MATERIALS: Record<Industry, MaterialConfig[]> = {
  gutters: [
    { name: '5" Aluminum', pricePerFoot: 8 },
    { name: '6" Aluminum', pricePerFoot: 10 },
    { name: '5" Copper', pricePerFoot: 25 },
    { name: '6" Copper', pricePerFoot: 30 },
    { name: '5" Steel', pricePerFoot: 12 },
    { name: '6" Steel', pricePerFoot: 15 },
  ],
  roofs: [
    { name: 'Asphalt Shingles', pricePerFoot: 4 },
    { name: 'Metal Roofing', pricePerFoot: 8 },
    { name: 'Tile Roofing', pricePerFoot: 12 },
    { name: 'Slate', pricePerFoot: 18 },
    { name: 'Flat/TPO', pricePerFoot: 6 },
  ],
  decks: [
    { name: 'Pressure-Treated Wood', pricePerFoot: 15 },
    { name: 'Cedar', pricePerFoot: 22 },
    { name: 'Composite (Trex)', pricePerFoot: 28 },
    { name: 'PVC Decking', pricePerFoot: 32 },
  ],
  fences: [
    { name: 'Wood (Pine)', pricePerFoot: 18 },
    { name: 'Cedar', pricePerFoot: 25 },
    { name: 'Vinyl', pricePerFoot: 28 },
    { name: 'Chain Link', pricePerFoot: 12 },
    { name: 'Aluminum', pricePerFoot: 30 },
    { name: 'Wrought Iron', pricePerFoot: 35 },
  ],
  landscaping: [
    { name: 'Basic Package', pricePerFoot: 5 },
    { name: 'Standard Package', pricePerFoot: 10 },
    { name: 'Premium Package', pricePerFoot: 18 },
    { name: 'Custom Design', pricePerFoot: 25 },
  ],
};

export const DEFAULT_ADDONS: Record<Industry, AddonConfig[]> = {
  gutters: [
    { name: 'Gutter Guards', pricePerFoot: 6 },
    { name: 'Downspout Extensions', priceEach: 45 },
    { name: 'Splash Blocks', priceEach: 25 },
    { name: 'Fascia Repair', pricePerFoot: 8 },
    { name: 'Soffit Repair', pricePerFoot: 10 },
  ],
  roofs: [
    { name: 'Ridge Vent Installation', pricePerFoot: 6 },
    { name: 'Skylight Flashing', priceEach: 250 },
    { name: 'Ice & Water Shield', pricePerFoot: 3 },
    { name: 'Tear-Off Old Roof', pricePerFoot: 2 },
  ],
  decks: [
    { name: 'Railing System', pricePerFoot: 12 },
    { name: 'Built-in Seating', pricePerFoot: 20 },
    { name: 'Stair Addition', priceEach: 350 },
    { name: 'Deck Staining/Sealing', pricePerFoot: 3 },
  ],
  fences: [
    { name: 'Gate (Walk)', priceEach: 250 },
    { name: 'Gate (Driveway)', priceEach: 650 },
    { name: 'Post Caps', priceEach: 8 },
    { name: 'Privacy Slats', pricePerFoot: 4 },
    { name: 'Staining/Painting', pricePerFoot: 3 },
  ],
  landscaping: [
    { name: 'Irrigation System', pricePerFoot: 4 },
    { name: 'Landscape Lighting', pricePerFoot: 6 },
    { name: 'Retaining Wall', pricePerFoot: 25 },
    { name: 'Sod Installation', pricePerFoot: 2 },
  ],
};

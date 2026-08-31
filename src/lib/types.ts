export type Industry = 'gutters' | 'roofs' | 'decks' | 'fences' | 'landscaping';

export interface Profile {
  id: string;
  email: string;
  company_name: string;
  phone: string;
  logo_url: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  timezone: string;
  default_industry: Industry;
  notification_email: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  theme_mode: 'dark' | 'light' | 'system';
  accent_color: string;
  dashboard_layout: 'grid' | 'list';
  stripe_customer_id: string;
  stripe_subscription_id: string;
  subscription_status: string;
  subscription_current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaterialConfig {
  name: string;
  pricePerFoot: number;
}

export interface AddonConfig {
  name: string;
  pricePerFoot?: number;
  priceEach?: number;
}

export interface QuoterConfig {
  materials: MaterialConfig[];
  price_per_linear_foot: number;
  add_ons: AddonConfig[];
  minimum_charge: number;
  measurement_unit: string;
  measurement_label: string;
  material_label: string;
  options_description: string;
}

export interface QuoterBranding {
  primary_color: string;
  secondary_color: string;
  text_color: string;
  font_family: string;
  logo_url: string;
  company_name: string;
  company_phone: string;
  company_email: string;
  button_radius: string;
  show_powered_by: boolean;
}

export interface Quoter {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  industry: Industry;
  status: string;
  config: QuoterConfig;
  branding: QuoterBranding;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  quoter_id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  estimated_linear_feet: number;
  quoted_price: number;
  selected_material: string;
  selected_addons: string[];
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  quoter?: Quoter;
}

export interface QuoterEvent {
  id: string;
  quoter_id: string;
  user_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const INDUSTRY_META: Record<Industry, {
  label: string;
  color: string;
  measurementUnit: string;
  measurementLabel: string;
  materialLabel: string;
  optionsDescription: string;
  addressSubtext: string;
  measureTitle: string;
  autoMeasure: boolean;
  drawInstructions: string;
}> = {
  gutters: {
    label: 'Gutters',
    color: 'bg-emerald-500/10 text-emerald-400',
    measurementUnit: 'linear feet',
    measurementLabel: 'Gutter Length',
    materialLabel: 'Gutter Material',
    optionsDescription: 'Select your gutter material and any additional services.',
    addressSubtext: "We'll use satellite imagery to measure your roof perimeter.",
    measureTitle: 'Roof Measurement',
    autoMeasure: true,
    drawInstructions: 'Click on the map to trace the roof edges where gutters will be installed.',
  },
  roofs: {
    label: 'Roofing',
    color: 'bg-blue-500/10 text-blue-400',
    measurementUnit: 'linear feet',
    measurementLabel: 'Roof Perimeter',
    materialLabel: 'Roofing Material',
    optionsDescription: 'Select your roofing material and any additional services.',
    addressSubtext: "We'll use satellite imagery to measure your roof.",
    measureTitle: 'Roof Measurement',
    autoMeasure: true,
    drawInstructions: 'Click on the map to trace the edges of the roof.',
  },
  decks: {
    label: 'Decks',
    color: 'bg-amber-500/10 text-amber-400',
    measurementUnit: 'linear feet',
    measurementLabel: 'Deck Perimeter',
    materialLabel: 'Decking Material',
    optionsDescription: 'Select your decking material and any additional features.',
    addressSubtext: "We'll show your property so you can outline the deck area.",
    measureTitle: 'Deck Measurement',
    autoMeasure: false,
    drawInstructions: 'Click on the map to outline the perimeter of the deck area.',
  },
  fences: {
    label: 'Fencing',
    color: 'bg-orange-500/10 text-orange-400',
    measurementUnit: 'linear feet',
    measurementLabel: 'Fence Length',
    materialLabel: 'Fence Material',
    optionsDescription: 'Select your fence material and any additional options.',
    addressSubtext: "We'll show your property so you can draw the fence line.",
    measureTitle: 'Fence Measurement',
    autoMeasure: false,
    drawInstructions: 'Click on the map to trace the fence line. Place at least 3 points.',
  },
  landscaping: {
    label: 'Landscaping',
    color: 'bg-green-500/10 text-green-400',
    measurementUnit: 'linear feet',
    measurementLabel: 'Area Perimeter',
    materialLabel: 'Service Type',
    optionsDescription: 'Select the landscaping services and any add-ons.',
    addressSubtext: "We'll show your property so you can outline the work area.",
    measureTitle: 'Area Measurement',
    autoMeasure: false,
    drawInstructions: 'Click on the map to outline the landscaping area.',
  },
};

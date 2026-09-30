/** Product catalog for the Kijani Hub marketplace (indicative pilot pricing) */
export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;      // TZS
  unit: string;
  category: 'feed' | 'fertilizer' | 'energy';
  emoji: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'larvae-dried',
    name: 'BSF Larvae Protein Feed (Dried)',
    tagline: 'Protein-rich alternative to fishmeal for poultry & aquaculture.',
    price: 3000,
    unit: 'kg',
    category: 'feed',
    emoji: '🐛',
  },
  {
    id: 'larvae-fresh',
    name: 'BSF Larvae (Fresh)',
    tagline: 'Live larvae for direct on-farm feeding.',
    price: 1800,
    unit: 'kg',
    category: 'feed',
    emoji: '🪱',
  },
  {
    id: 'frass',
    name: 'Frass Organic Fertilizer',
    tagline: 'Nutrient-rich soil conditioner for urban farms & nurseries.',
    price: 800,
    unit: 'kg',
    category: 'fertilizer',
    emoji: '🌱',
  },
  {
    id: 'compost',
    name: 'Mature Compost',
    tagline: 'Fully-composted organic matter, screened and bagged.',
    price: 600,
    unit: 'kg',
    category: 'fertilizer',
    emoji: '🍂',
  },
];

/** The supply-chain assurance steps shown to buyers */
export const ASSURANCE_STEPS = [
  { step: 'Sourced', text: 'Organic waste collected from tracked, mapped points across Dar es Salaam.' },
  { step: 'Processed', text: 'Converted under monitored temperature & humidity via KijaniSense IoT.' },
  { step: 'Quality-checked', text: 'Each batch inspected for moisture, purity and consistency before bagging.' },
  { step: 'Traceable', text: 'Every order carries a batch reference linked to its processing data.' },
  { step: 'Delivered', text: 'Dispatched with delivery confirmation and top handling assurance.' },
];

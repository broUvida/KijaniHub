/**
 * conversionFactors.ts
 * ────────────────────────────────────────────────────────────────────────
 * The calculation engine for Kijani Hub impact & production estimates.
 *
 * Instead of hardcoding output numbers, the platform stores a set of
 * CONVERSION FACTORS. Every impact figure on the dashboards is DERIVED by
 * multiplying the amount of organic waste processed by these factors.
 *
 * The Admin can edit every factor from the Admin → Conversion Factors screen.
 * Each factor carries its own `source` and `note` so the number shown on the
 * dashboard can always be traced back to a published reference.
 *
 * ⚠️ IMPORTANT: The default values below are drawn from widely-published
 * references (IPCC, EPA, peer-reviewed studies) and are provided as sensible
 * STARTING POINTS. They must be reviewed and, where needed, replaced with
 * values appropriate to Dar es Salaam conditions BEFORE using any figure in a
 * pitch, report, or public claim. Always keep the `source` field accurate.
 */

export interface ConversionFactor {
  key: string;
  label: string;
  value: number;
  unit: string;       // what one unit of waste (kg) produces / avoids
  source: string;     // citation — shown to admins and (optionally) on hover
  note?: string;      // assumptions / caveats
  editable: boolean;
}

/**
 * Default conversion factors, all expressed PER 1 KG of organic waste
 * processed by Kijani Hub (i.e. diverted from open dumping / landfill),
 * unless stated otherwise.
 */
export const DEFAULT_FACTORS: ConversionFactor[] = [
  // ─── Greenhouse gases ───
  {
    key: 'ch4_avoided_per_kg',
    label: 'Methane (CH₄) avoided',
    value: 0.07,
    unit: 'kg CH₄ / kg waste',
    source: 'Derived from IPCC 2019 landfill methodology & EPA food-waste studies (order-of-magnitude; site-specific)',
    note: 'Methane released when organic waste decomposes anaerobically in dumps. Actual value depends on waste type, climate and landfill conditions. VERIFY before publishing.',
    editable: true,
  },
  {
    key: 'gwp_ch4',
    label: 'Methane global warming potential (GWP-100)',
    value: 27,
    unit: 'kg CO₂e / kg CH₄',
    source: 'IPCC AR6 (2021), WG1 Table 7.SM.7 — biogenic methane, GWP-100 = 27 (27.9 without carbon-cycle feedbacks)',
    note: 'Waste-derived methane is biogenic, so use 27 — NOT the fossil value of 29.8. This is the value recommended for national GHG reporting.',
    editable: true,
  },
  {
    key: 'co2e_avoided_per_kg',
    label: 'CO₂-equivalent avoided (total)',
    value: 1.9,
    unit: 'kg CO₂e / kg waste',
    source: 'Calculated: CH₄ avoided × GWP (fallback when not auto-derived)',
    note: 'If left as a direct factor, this overrides the CH₄×GWP calculation. Handy for a single agreed headline number.',
    editable: true,
  },

  // ─── Product yields (Black Soldier Fly + composting) ───
  {
    key: 'larvae_yield_per_kg',
    label: 'BSF larvae feed yield',
    value: 0.18,
    unit: 'kg larvae / kg waste',
    source: 'Typical BSF bioconversion range 15–20% (industry & FAO reports)',
    note: 'Fresh/dried basis matters — confirm which you report.',
    editable: true,
  },
  {
    key: 'frass_yield_per_kg',
    label: 'Frass fertilizer yield',
    value: 0.25,
    unit: 'kg frass / kg waste',
    source: 'Typical BSF residue/frass fraction (industry reports)',
    editable: true,
  },
  {
    key: 'biogas_yield_per_kg',
    label: 'Biogas potential',
    value: 0.06,
    unit: 'm³ biogas / kg waste',
    source: 'Anaerobic digestion of food waste (literature range varies widely)',
    note: 'Only applies to the fraction routed to biogas digestion, not BSF.',
    editable: true,
  },

  // ─── Revenue (Tanzanian Shillings) ───
  {
    key: 'price_larvae',
    label: 'Larvae feed sale price',
    value: 3000,
    unit: 'TZS / kg',
    source: 'Kijani Hub indicative pilot pricing — set your own',
    editable: true,
  },
  {
    key: 'price_frass',
    label: 'Frass fertilizer sale price',
    value: 800,
    unit: 'TZS / kg',
    source: 'Kijani Hub indicative pilot pricing — set your own',
    editable: true,
  },
];

/** A live, editable factor set keyed for fast lookup */
export type FactorMap = Record<string, ConversionFactor>;

export const factorsToMap = (list: ConversionFactor[]): FactorMap =>
  list.reduce((m, f) => {
    m[f.key] = f;
    return m;
  }, {} as FactorMap);

/** Safe getter for a factor's numeric value */
export const fv = (map: FactorMap, key: string, fallback = 0): number =>
  map[key] ? map[key].value : fallback;

/**
 * The core engine: given kilograms of organic waste processed and the current
 * factor map, return every derived impact & production figure.
 */
export interface ImpactResult {
  wasteKg: number;
  larvaeKg: number;
  frassKg: number;
  biogasM3: number;
  ch4AvoidedKg: number;
  co2eAvoidedKg: number;
  revenueTzs: number;
}

export function computeImpact(wasteKg: number, map: FactorMap): ImpactResult {
  const larvaeKg = wasteKg * fv(map, 'larvae_yield_per_kg');
  const frassKg = wasteKg * fv(map, 'frass_yield_per_kg');
  const biogasM3 = wasteKg * fv(map, 'biogas_yield_per_kg');

  const ch4AvoidedKg = wasteKg * fv(map, 'ch4_avoided_per_kg');

  // Prefer the physically-derived CO2e (CH4 × GWP); fall back to the direct factor
  const derivedCo2e = ch4AvoidedKg * fv(map, 'gwp_ch4');
  const co2eAvoidedKg = derivedCo2e > 0 ? derivedCo2e : wasteKg * fv(map, 'co2e_avoided_per_kg');

  const revenueTzs =
    larvaeKg * fv(map, 'price_larvae') + frassKg * fv(map, 'price_frass');

  const round1 = (n: number) => Math.round(n * 10) / 10;
  return {
    wasteKg: round1(wasteKg),
    larvaeKg: round1(larvaeKg),
    frassKg: round1(frassKg),
    biogasM3: round1(biogasM3),
    ch4AvoidedKg: round1(ch4AvoidedKg),
    co2eAvoidedKg: Math.round(co2eAvoidedKg),
    revenueTzs: Math.round(revenueTzs),
  };
}

/**
 * Per-device throughput: each IoT device processes its own amount of waste
 * (kg), set by the admin. Every device output is then derived from this
 * number using the SAME factors — so one factor change updates every device.
 */
export type DeviceThroughput = Record<string, number>; // deviceId -> kg waste

/** Sensible starting throughput per device (kg), admin-editable */
export const DEFAULT_THROUGHPUT: DeviceThroughput = {
  'waste-001': 1200,
  'waste-002': 900,
  'bsf-001': 800,
  'bsf-002': 650,
  'compost-001': 500,
  'biogas-001': 400,
  'wash-001': 0,
  'wash-002': 0,
};

/** Total waste across all devices */
export const totalThroughput = (t: DeviceThroughput): number =>
  Object.values(t).reduce((sum, n) => sum + (Number(n) || 0), 0);

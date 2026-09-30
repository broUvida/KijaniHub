import { supabase } from './supabase';
import type { ConversionFactor, DeviceThroughput } from './conversionFactors';
import { DEFAULT_FACTORS, DEFAULT_THROUGHPUT } from './conversionFactors';

// ── Conversion factors ────────────────────────────────────────────────────────

interface FactorRow {
  key: string;
  value: number;
}

export async function fetchFactors(): Promise<ConversionFactor[]> {
  const { data, error } = await supabase
    .from('conversion_factors')
    .select('key, value');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return DEFAULT_FACTORS;
  const saved: Record<string, number> = {};
  (data as FactorRow[]).forEach((r) => { saved[r.key] = r.value; });
  return DEFAULT_FACTORS.map((f) =>
    saved[f.key] !== undefined ? { ...f, value: saved[f.key] } : f
  );
}

export async function upsertFactor(key: string, value: number): Promise<void> {
  const { error } = await supabase
    .from('conversion_factors')
    .upsert([{ key, value }], { onConflict: 'key' });
  if (error) throw new Error(error.message);
}

export async function resetAllFactors(): Promise<void> {
  const rows = DEFAULT_FACTORS.map((f) => ({ key: f.key, value: f.value }));
  const { error } = await supabase
    .from('conversion_factors')
    .upsert(rows, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}

// ── Device throughput ─────────────────────────────────────────────────────────

interface ThroughputRow {
  device_id: string;
  waste_kg: number;
}

export async function fetchThroughput(): Promise<DeviceThroughput> {
  const { data, error } = await supabase
    .from('device_throughput')
    .select('device_id, waste_kg');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return DEFAULT_THROUGHPUT;
  const result: DeviceThroughput = { ...DEFAULT_THROUGHPUT };
  (data as ThroughputRow[]).forEach((r) => { result[r.device_id] = r.waste_kg; });
  return result;
}

export async function upsertThroughput(deviceId: string, wasteKg: number): Promise<void> {
  const { error } = await supabase
    .from('device_throughput')
    .upsert([{ device_id: deviceId, waste_kg: wasteKg }], { onConflict: 'device_id' });
  if (error) throw new Error(error.message);
}

// ── Manual waste override ─────────────────────────────────────────────────────

interface SettingRow {
  key: string;
  value: string;
}

export async function fetchManualWaste(): Promise<number | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'manual_waste_kg')
    .single();
  if (error || !data) return null;
  const v = Number((data as SettingRow).value);
  return isNaN(v) ? null : v;
}

export async function upsertManualWaste(kg: number | null): Promise<void> {
  if (kg === null) {
    await supabase.from('app_settings').delete().eq('key', 'manual_waste_kg');
    return;
  }
  const { error } = await supabase
    .from('app_settings')
    .upsert([{ key: 'manual_waste_kg', value: String(kg) }], { onConflict: 'key' });
  if (error) throw new Error(error.message);
}

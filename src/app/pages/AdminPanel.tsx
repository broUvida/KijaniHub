import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { factorsToMap, computeImpact, totalThroughput } from '../lib/conversionFactors';
import {
  SlidersHorizontal, RotateCcw, Info, Calculator, AlertTriangle, Lock, Cpu,
} from 'lucide-react';

/**
 * AdminPanel - Admin-only control room for the calculation engine.
 * The admin sets the amount of waste processed and edits every conversion
 * factor; all dashboard impact figures are derived from these inputs.
 * Each factor shows its published source for traceability.
 */
export default function AdminPanel() {
  const {
    userRole, factors, updateFactor, resetFactors, manualWasteKg, setManualWasteKg,
    devices, deviceThroughput, setDeviceThroughput,
  } = useApp();

  const [wasteInput, setWasteInput] = useState<string>(
    manualWasteKg !== null ? String(manualWasteKg) : '1000'
  );

  // Gate the whole page to admins only
  if (userRole !== 'admin') {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-white rounded-2xl shadow-md p-8 text-center">
        <Lock className="mx-auto text-gray-400" size={40} />
        <h2 className="text-xl font-bold text-gray-800 mt-4">Admin access only</h2>
        <p className="text-gray-500 mt-2">
          The conversion engine and impact settings are restricted to administrator accounts.
        </p>
      </div>
    );
  }

  const map = factorsToMap(factors);
  const previewWaste = Number(wasteInput) || 0;
  const preview = computeImpact(previewWaste, map);

  const applyWaste = () => setManualWasteKg(Number(wasteInput) || 0);
  const clearWaste = () => { setManualWasteKg(null); setWasteInput('1000'); };

  const groups: { title: string; keys: string[] }[] = [
    { title: 'Greenhouse gas factors', keys: ['ch4_avoided_per_kg', 'gwp_ch4', 'co2e_avoided_per_kg'] },
    { title: 'Product yield factors', keys: ['larvae_yield_per_kg', 'frass_yield_per_kg', 'biogas_yield_per_kg'] },
    { title: 'Revenue factors (TZS)', keys: ['price_larvae', 'price_frass'] },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-emerald-600" size={24} />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Conversion Engine (Admin)</h1>
        </div>
        <p className="text-gray-600 mt-1">
          Set the waste amount and edit the conversion factors. Every impact figure across the platform is
          calculated from these values.
        </p>
      </div>

      {/* Caveat banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
        <p className="text-sm text-amber-800">
          Default factors are published starting points (IPCC, EPA, peer-reviewed studies). Review each one and
          adjust it to Dar es Salaam conditions <strong>before using any figure in a pitch or report</strong>.
          Keep the source note accurate so every number stays traceable.
        </p>
      </div>

      {/* Waste input */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="text-emerald-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Organic waste processed</h2>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Waste amount (kg)</label>
            <input
              type="number" min={0} value={wasteInput}
              onChange={(e) => setWasteInput(e.target.value)}
              className="w-48 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-mono"
            />
          </div>
          <button onClick={applyWaste}
            className="bg-emerald-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
            Apply to dashboards
          </button>
          <button onClick={clearWaste}
            className="text-gray-600 px-4 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Use sensor data instead
          </button>
          <span className="text-sm text-gray-500">
            {manualWasteKg !== null
              ? `Dashboards currently show a manual figure of ${manualWasteKg.toLocaleString()} kg.`
              : 'Dashboards currently use live/simulated sensor totals.'}
          </span>
        </div>
      </div>

      {/* Live preview */}
      <div className="bg-emerald-950 rounded-2xl p-6 text-emerald-50">
        <p className="font-mono text-xs uppercase tracking-widest text-emerald-300 mb-4">
          Live preview · {previewWaste.toLocaleString()} kg waste →
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Larvae feed', val: `${preview.larvaeKg.toLocaleString()} kg` },
            { label: 'Frass fertilizer', val: `${preview.frassKg.toLocaleString()} kg` },
            { label: 'Biogas', val: `${preview.biogasM3.toLocaleString()} m³` },
            { label: 'CO₂e avoided', val: `${preview.co2eAvoidedKg.toLocaleString()} kg` },
            { label: 'Revenue', val: `${preview.revenueTzs.toLocaleString()} TZS` },
          ].map((c) => (
            <div key={c.label}>
              <div className="font-mono text-lg font-semibold text-white">{c.val}</div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-emerald-100/60 mt-1">{c.label}</div>
            </div>
          ))}
        </div>
        <p className="font-mono text-[11px] text-emerald-100/50 mt-4">
          CO₂e avoided = methane avoided × methane GWP. Change any factor below to see this update instantly.
        </p>
      </div>

      {/* Per-device throughput */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-1">
          <Cpu className="text-emerald-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Per-device waste throughput</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Set how much organic waste (kg) each device processes. Every device's outputs are derived from this
          number using the same factors. The dashboard totals use the sum of all devices
          ({totalThroughput(deviceThroughput).toLocaleString()} kg) unless a manual override is set above.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 pr-4 font-medium">Device</th>
                <th className="py-2 px-3 font-medium">Waste (kg)</th>
                <th className="py-2 px-3 font-medium">Larvae</th>
                <th className="py-2 px-3 font-medium">Frass</th>
                <th className="py-2 px-3 font-medium">Biogas</th>
                <th className="py-2 px-3 font-medium">CO₂e avoided</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => {
                const kg = deviceThroughput[d.id] ?? 0;
                const out = computeImpact(kg, map);
                return (
                  <tr key={d.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4">
                      <span className="font-medium text-gray-800">{d.name}</span>
                      <span className="block text-xs text-gray-400">{d.type.replace('_', ' ')}</span>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number" min={0} value={kg}
                        onChange={(e) => setDeviceThroughput(d.id, Number(e.target.value) || 0)}
                        className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-right"
                      />
                    </td>
                    <td className="py-2 px-3 font-mono text-gray-600">{out.larvaeKg.toLocaleString()} kg</td>
                    <td className="py-2 px-3 font-mono text-gray-600">{out.frassKg.toLocaleString()} kg</td>
                    <td className="py-2 px-3 font-mono text-gray-600">{out.biogasM3.toLocaleString()} m³</td>
                    <td className="py-2 px-3 font-mono text-gray-600">{out.co2eAvoidedKg.toLocaleString()} kg</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Factor editor */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Conversion factors</h2>
          <button onClick={resetFactors}
            className="inline-flex items-center gap-2 text-sm text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <RotateCcw size={15} /> Reset to defaults
          </button>
        </div>

        <div className="space-y-8">
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3">{g.title}</h3>
              <div className="space-y-4">
                {g.keys.map((key) => {
                  const f = map[key];
                  if (!f) return null;
                  return (
                    <div key={key} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block font-medium text-gray-800 text-sm">{f.label}</label>
                          <p className="text-xs text-gray-400 mt-0.5">{f.unit}</p>
                        </div>
                        <input
                          type="number" step="any" value={f.value}
                          onChange={(e) => updateFactor(key, Number(e.target.value))}
                          className="w-36 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-right"
                        />
                      </div>
                      <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-100">
                        <Info className="text-gray-400 shrink-0 mt-0.5" size={14} />
                        <div className="text-xs text-gray-500">
                          <span className="font-medium text-gray-600">Source:</span> {f.source}
                          {f.note && <div className="mt-1 text-gray-400">{f.note}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

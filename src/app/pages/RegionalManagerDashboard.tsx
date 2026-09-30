import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import { Trash2, Leaf, CloudRain, Eye, Award } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell,
} from 'recharts';

/**
 * RegionalManagerDashboard - VIEW-ONLY dashboard for municipal council managers.
 * Managers see their own area's performance and how it compares with other
 * municipalities. They cannot edit factors or data (that stays admin-only).
 *
 * Comparison data = real signups where available + sample councils to fill
 * out the chart (clearly labelled as illustrative).
 */

// Illustrative baseline councils so comparison charts are always populated.
// These are clearly sample figures for the demo stage.
const SAMPLE_COUNCILS = [
  { name: 'Ilala MC', waste: 10300, co2: 4100, fertilizer: 980, sample: true },
  { name: 'Kinondoni MC', waste: 8600, co2: 3450, fertilizer: 820, sample: true },
  { name: 'Temeke MC', waste: 7200, co2: 2880, fertilizer: 690, sample: true },
  { name: 'Ubungo MC', waste: 6100, co2: 2440, fertilizer: 580, sample: true },
];

export default function RegionalManagerDashboard() {
  const { metrics, userName, members } = useApp();

  // "My" municipality = this manager's live metrics
  const myCouncil = {
    name: userName ? `${userName}` : 'My Municipality',
    waste: metrics.totalWasteCollected,
    co2: metrics.co2Reduced,
    fertilizer: metrics.fertilizerProduced,
    sample: false,
  };

  // Real councils that have actually signed up (excluding me), shown alongside samples
  const realCouncils = members
    .filter((m) => m.accountType === 'municipal_council')
    .map((m) => ({ name: m.name, waste: 0, co2: 0, fertilizer: 0, sample: false, pending: true }));

  // Build comparison set: me + real signups + sample fill
  const comparison = [myCouncil, ...realCouncils, ...SAMPLE_COUNCILS];

  // Rank my council by waste processed
  const ranked = [...comparison].filter(c => c.waste > 0).sort((a, b) => b.waste - a.waste);
  const myRank = ranked.findIndex((c) => c.name === myCouncil.name) + 1;

  // Radar: normalize my council vs the average of the sample councils
  const avg = (key: 'waste' | 'co2' | 'fertilizer') =>
    SAMPLE_COUNCILS.reduce((s, c) => s + c[key], 0) / SAMPLE_COUNCILS.length;
  const radarData = [
    { metric: 'Waste collected', mine: myCouncil.waste, average: Math.round(avg('waste')) },
    { metric: 'CO₂ avoided', mine: myCouncil.co2, average: Math.round(avg('co2')) },
    { metric: 'Fertilizer', mine: myCouncil.fertilizer, average: Math.round(avg('fertilizer')) },
  ];

  return (
    <div className="space-y-6">
      {/* Header with view-only badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Municipality Dashboard</h1>
          <p className="text-gray-600 mt-1">Performance overview for {myCouncil.name}</p>
        </div>
        <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full border border-blue-200">
          <Eye size={16} /> View-only access
        </span>
      </div>

      {/* My stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Waste Collected" value={`${metrics.totalWasteCollected.toLocaleString()} kg`} icon={Trash2} color="green" />
        <StatCard title="Fertilizer Produced" value={`${metrics.fertilizerProduced.toLocaleString()} kg`} icon={Leaf} color="green" />
        <StatCard title="CO₂ Avoided" value={`${metrics.co2Reduced.toLocaleString()} kg`} icon={CloudRain} color="blue" />
      </div>

      {/* Ranking banner */}
      {myRank > 0 && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-2xl p-5">
          <Award size={28} />
          <div>
            <p className="font-semibold text-lg">
              Ranked #{myRank} of {ranked.length} for waste processed
            </p>
            <p className="text-emerald-50 text-sm">Keep improving your collection coverage to climb the leaderboard.</p>
          </div>
        </div>
      )}

      {/* Comparison bar chart */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Waste processed vs other municipalities</h3>
        <p className="text-sm text-gray-500 mb-4">
          Your municipality highlighted. Sample councils are illustrative baselines for the demo stage.
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={comparison.filter(c => c.waste > 0)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="waste" name="Waste (kg)" radius={[6, 6, 0, 0]}>
              {comparison.filter(c => c.waste > 0).map((c, i) => (
                <Cell key={i} fill={c.name === myCouncil.name ? '#059669' : '#cbd5e1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar: me vs average */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your municipality vs network average</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fontSize: 10 }} />
              <Radar name={myCouncil.name} dataKey="mine" stroke="#059669" fill="#059669" fillOpacity={0.5} />
              <Radar name="Network average" dataKey="average" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* CO2 comparison */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">CO₂ avoided comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparison.filter(c => c.co2 > 0)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="co2" name="CO₂ avoided (kg)" radius={[0, 6, 6, 0]}>
                {comparison.filter(c => c.co2 > 0).map((c, i) => (
                  <Cell key={i} fill={c.name === myCouncil.name ? '#2563eb' : '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Signed-up councils note */}
      {realCouncils.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          {realCouncils.length} other council(s) have registered on the platform. Their live figures will appear
          here once a shared database connects everyone's data across devices.
        </div>
      )}

      <p className="text-xs text-gray-400">
        Sample council figures are illustrative baselines for the demo. Live cross-municipality comparison
        requires the shared database backend (a funded milestone).
      </p>
    </div>
  );
}

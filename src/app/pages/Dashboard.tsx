import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  Trash2, Leaf, Home, Wind, Droplets, Activity, ChevronRight, CheckCircle2,
  Bug, Flame, Sprout,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useApp, IoTDevice } from '../context/AppContext';
import VolunteerDashboard from './VolunteerDashboard';
import RegionalManagerDashboard from './RegionalManagerDashboard';

/**
 * Dashboard — Apple-style overview of Kijani Hub operations (admin view).
 * Volunteers and regional managers keep their own dashboards.
 */

// ── Design tokens (inspired by Apple's Human Interface Guidelines) ──
const C = {
  label: '#1D1D1F',
  secondary: '#6E6E73',
  tertiary: '#8E8E93',
  separator: '#E5E5EA',
  fill: '#F2F2F7',
  tint: '#1E8A5A', // Kijani green — the single accent colour
  red: '#FF3B30',
  orange: '#FF9500',
  green: '#34C759',
  blue: '#007AFF',
  teal: '#0E9AAD',
  brown: '#9A7A55',
};

// Illustrative pilot history (sensor readings are simulated during the pilot)
const weekValues = [320, 380, 420, 390, 450, 480, 520];
const monthValues = [
  { frass: 280, compost: 340 },
  { frass: 320, compost: 380 },
  { frass: 360, compost: 420 },
  { frass: 410, compost: 460 },
  { frass: 450, compost: 490 },
  { frass: 520, compost: 540 },
];

/** Chart labels relative to today, so the charts always read as current */
function lastSevenDays() {
  const out: { label: string; waste: number; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ label: d.toLocaleDateString('en-GB', { weekday: 'short' }), waste: weekValues[6 - i], isToday: i === 0 });
  }
  return out;
}
function lastSixMonths() {
  const out: { label: string; frass: number; compost: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    out.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), ...monthValues[5 - i] });
  }
  return out;
}

/** Where each device type's detail page lives */
const deviceRoute: Record<IoTDevice['type'], string> = {
  waste_bin: '/dashboard/waste',
  bsf_sensor: '/dashboard/bsf',
  compost_monitor: '/dashboard/compost',
  biogas_meter: '/dashboard/biogas',
  wash_station: '/dashboard/wash',
};
const deviceIcon: Record<IoTDevice['type'], typeof Trash2> = {
  waste_bin: Trash2,
  bsf_sensor: Bug,
  compost_monitor: Sprout,
  biogas_meter: Flame,
  wash_station: Droplets,
};

type Attention = { id: string; name: string; detail: string; action: string; to: string; urgent: boolean };

/** Turn live device readings into a short, actionable list */
function needsAttention(devices: IoTDevice[]): Attention[] {
  const items: Attention[] = [];
  devices.forEach((d) => {
    if (d.type === 'waste_bin' && d.data?.fillLevel >= 85) {
      const fill = Math.round(d.data.fillLevel);
      items.push({ id: d.id, name: d.name, detail: `${fill}% full`, action: 'Schedule pickup', to: deviceRoute.waste_bin, urgent: fill >= 95 });
    } else if (d.type === 'wash_station' && (d.data?.soapLevel < 20 || d.data?.waterLevel < 30)) {
      items.push({
        id: d.id, name: d.name,
        detail: `Soap ${Math.round(d.data.soapLevel)}%, water ${Math.round(d.data.waterLevel)}%`,
        action: 'Refill', to: deviceRoute.wash_station, urgent: d.data.soapLevel < 10 || d.data.waterLevel < 15,
      });
    } else if (d.status === 'offline') {
      items.push({ id: d.id, name: d.name, detail: 'Not reporting', action: 'Check device', to: '/dashboard/map', urgent: true });
    } else if (d.status === 'warning') {
      items.push({ id: d.id, name: d.name, detail: 'Reading out of range', action: 'Review', to: deviceRoute[d.type], urgent: false });
    }
  });
  return items.sort((a, b) => Number(b.urgent) - Number(a.urgent));
}

const timeOf = (d: Date) => new Date(d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const rowClass =
  'flex items-center gap-3 pl-4 pr-3 transition-colors hover:bg-black/[0.03] active:bg-black/[0.06] focus-visible:outline-none focus-visible:bg-black/[0.05]';

// ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { metrics, devices, userRole } = useApp();

  if (userRole === 'volunteer') return <VolunteerDashboard />;
  if (userRole === 'regional_manager') return <RegionalManagerDashboard />;

  return <AdminOverview metrics={metrics} devices={devices} />;
}

type Metrics = ReturnType<typeof useApp>['metrics'];

function AdminOverview({ metrics, devices }: { metrics: Metrics; devices: IoTDevice[] }) {
  const attention = useMemo(() => needsAttention(devices), [devices]);
  const recent = useMemo(
    () => [...devices].sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()).slice(0, 5),
    [devices]
  );
  const online = devices.filter((d) => d.status === 'online').length;
  const warning = devices.filter((d) => d.status === 'warning').length;
  const offline = devices.filter((d) => d.status === 'offline').length;
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-8">
      {/* Large title */}
      <header className="pt-2">
        <h1 className="text-[34px] leading-[41px] font-bold tracking-[-0.02em]" style={{ color: C.label }}>Overview</h1>
        <p className="text-[15px] mt-1" style={{ color: C.secondary }}>{today}</p>
      </header>

      {/* Needs attention */}
      <section aria-labelledby="attention-title">
        <GroupHeader id="attention-title">Needs attention</GroupHeader>
        <div className="bg-white rounded-2xl overflow-hidden">
          {attention.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <CheckCircle2 size={22} style={{ color: C.green }} />
              <div>
                <p className="text-[15px] font-medium" style={{ color: C.label }}>All clear</p>
                <p className="text-[13px]" style={{ color: C.secondary }}>Every device is reporting normally.</p>
              </div>
            </div>
          ) : (
            attention.map((a, i) => (
              <div key={a.id}>
                {i > 0 && <div className="ml-[38px] h-px" style={{ background: C.separator }} />}
                <Link to={a.to} className={`${rowClass} py-3`}>
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: a.urgent ? C.red : C.orange }}
                    title={a.urgent ? 'Urgent' : 'Soon'}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium truncate" style={{ color: C.label }}>{a.name}</p>
                    <p className="text-[13px] truncate" style={{ color: C.secondary }}>{a.detail}</p>
                  </div>
                  <span className="text-[15px] hidden sm:inline" style={{ color: C.tint }}>{a.action}</span>
                  <ChevronRight size={18} style={{ color: C.tertiary }} />
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Primary widgets */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WasteWidget total={metrics.totalWasteCollected} fertilizer={metrics.fertilizerProduced} />
        <DeviceRing online={online} warning={warning} offline={offline} total={devices.length} />
      </section>

      {/* Impact */}
      <section aria-labelledby="impact-title">
        <GroupHeader id="impact-title">Impact</GroupHeader>
        <div className="bg-white rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <ImpactTile index={0} icon={Leaf} color={C.brown} label="Frass fertiliser" value={metrics.fertilizerProduced} unit="kg" note="+8% vs last month" />
          <ImpactTile index={1} icon={Wind} color={C.teal} label="CO₂ avoided" value={metrics.co2Reduced} unit="kg" note="+15% vs last month" />
          <ImpactTile index={2} icon={Home} color={C.blue} label="Households served" value={metrics.householdsServed} note="Across Dar es Salaam" />
          <ImpactTile index={3} icon={Droplets} color={C.blue} label="Handwashing" value={metrics.hygieneUsage} unit="events" note="+22% vs last month" />
        </div>
      </section>

      {/* Recent activity */}
      <section aria-labelledby="recent-title">
        <GroupHeader id="recent-title">Recent device activity</GroupHeader>
        <div className="bg-white rounded-2xl overflow-hidden">
          {recent.map((d, i) => {
            const Icon = deviceIcon[d.type];
            const dot = d.status === 'online' ? C.green : d.status === 'warning' ? C.orange : C.red;
            return (
              <div key={d.id}>
                {i > 0 && <div className="ml-[60px] h-px" style={{ background: C.separator }} />}
                <Link to={deviceRoute[d.type]} className={`${rowClass} py-2.5`}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: C.fill }}>
                    <Icon size={17} style={{ color: C.secondary }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] truncate" style={{ color: C.label }}>{d.name}</p>
                    <p className="text-[13px] truncate" style={{ color: C.secondary }}>{d.location.address}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-[13px] tabular-nums" style={{ color: C.secondary }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: dot }} />
                    {timeOf(d.lastUpdate)}
                  </span>
                  <ChevronRight size={18} style={{ color: C.tertiary }} />
                </Link>
              </div>
            );
          })}
        </div>
        <p className="text-[13px] mt-2 px-4" style={{ color: C.tertiary }}>
          Sensor readings are simulated during the pilot and refresh every 10 seconds.
        </p>
      </section>
    </div>
  );
}

// ── Pieces ─────────────────────────────────────────────────────

function GroupHeader({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-[20px] font-semibold tracking-[-0.01em] mb-2.5 px-1" style={{ color: C.label }}>
      {children}
    </h2>
  );
}

function SegmentedControl<T extends string>({
  options, value, onChange, label,
}: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex p-0.5 rounded-[9px] flex-shrink-0" style={{ background: 'rgba(118,118,128,0.12)' }}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className="relative px-3 py-1 text-[13px] font-medium rounded-[7px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E8A5A]/40"
            style={{ color: C.label }}
          >
            {active && (
              <motion.span
                layoutId={`segment-${label}`}
                className="absolute inset-0 bg-white rounded-[7px]"
                style={{ boxShadow: '0 3px 8px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.04)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function WasteWidget({ total, fertilizer }: { total: number; fertilizer: number }) {
  const [range, setRange] = useState<'week' | 'months'>('week');
  const week = useMemo(lastSevenDays, []);
  const months = useMemo(lastSixMonths, []);
  const isWeek = range === 'week';

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[15px] font-semibold" style={{ color: C.tint }}>
            {isWeek ? <Trash2 size={16} strokeWidth={2.25} /> : <Leaf size={16} strokeWidth={2.25} />}
            {isWeek ? 'Waste collected' : 'Frass produced'}
          </p>
          <p className="mt-2 flex items-baseline gap-1.5">
            <span className="text-[34px] leading-none font-semibold tracking-[-0.02em] tabular-nums" style={{ color: C.label }}>
              {(isWeek ? total : fertilizer).toLocaleString()}
            </span>
            <span className="text-[17px] font-medium" style={{ color: C.secondary }}>kg</span>
          </p>
          <p className="text-[13px] mt-1" style={{ color: C.secondary }}>
            {isWeek ? 'All collection points' : 'From Black Soldier Fly units, with compost alongside'}
          </p>
        </div>
        <SegmentedControl
          label="Chart range"
          value={range}
          onChange={setRange}
          options={[{ id: 'week', label: 'Week' }, { id: 'months', label: '6 months' }]}
        />
      </div>

      <div className="h-[220px] mt-4 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          {isWeek ? (
            <BarChart data={week} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke={C.separator} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: C.secondary, fontSize: 12 }} />
              <YAxis orientation="right" axisLine={false} tickLine={false} tick={{ fill: C.tertiary, fontSize: 11 }} width={36} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} content={<ChartTip unit="kg" />} />
              <Bar dataKey="waste" name="Waste" radius={[6, 6, 6, 6]}>
                {week.map((d) => (
                  <Cell key={d.label} fill={d.isToday ? C.tint : 'rgba(30,138,90,0.35)'} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart data={months} barCategoryGap="30%" barGap={3}>
              <CartesianGrid vertical={false} stroke={C.separator} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: C.secondary, fontSize: 12 }} />
              <YAxis orientation="right" axisLine={false} tickLine={false} tick={{ fill: C.tertiary, fontSize: 11 }} width={36} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} content={<ChartTip unit="kg" />} />
              <Bar dataKey="frass" name="Frass" fill={C.brown} radius={[5, 5, 5, 5]} />
              <Bar dataKey="compost" name="Compost" fill={C.tint} radius={[5, 5, 5, 5]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {!isWeek && (
        <div className="flex gap-4 mt-2 text-[13px]" style={{ color: C.secondary }}>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.brown }} />Frass</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.tint }} />Compost</span>
        </div>
      )}
    </div>
  );
}

/** Minimal Apple-style chart tooltip */
function ChartTip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-[13px] bg-white/90 backdrop-blur-md" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)', color: C.label }}>
      <p className="font-semibold mb-0.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="tabular-nums" style={{ color: C.secondary }}>
          {p.name}: <span style={{ color: C.label }}>{Number(p.value).toLocaleString()} {unit}</span>
        </p>
      ))}
    </div>
  );
}

/** Activity-ring style device health */
function DeviceRing({ online, warning, offline, total }: { online: number; warning: number; offline: number; total: number }) {
  const reduce = useReducedMotion();
  const size = 150, stroke = 16, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const pct = total > 0 ? online / total : 0;

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col">
      <p className="flex items-center gap-1.5 text-[15px] font-semibold" style={{ color: C.tint }}>
        <Activity size={16} strokeWidth={2.25} /> Device health
      </p>

      <div className="flex-1 flex items-center justify-center py-4">
        <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`${online} of ${total} devices online`}>
          <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(30,138,90,0.15)" strokeWidth={stroke} />
            <motion.circle
              cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.tint} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: reduce ? circ * (1 - pct) : circ }}
              animate={{ strokeDashoffset: circ * (1 - pct) }}
              transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[28px] font-semibold tabular-nums leading-none" style={{ color: C.label }}>
              {online}<span className="text-[17px]" style={{ color: C.secondary }}>/{total}</span>
            </span>
            <span className="text-[13px] mt-1" style={{ color: C.secondary }}>online</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-[13px]">
        {[
          { label: 'Online', n: online, color: C.green },
          { label: 'Needs attention', n: warning, color: C.orange },
          { label: 'Offline', n: offline, color: C.red },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2" style={{ color: C.secondary }}>
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.label}
            </span>
            <span className="tabular-nums font-medium" style={{ color: C.label }}>{s.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Border layout for a 1 / 2 / 4-column tile grid with hairline dividers */
const tileBorders = [
  'border-b sm:border-r lg:border-b-0',
  'border-b lg:border-r lg:border-b-0',
  'border-b sm:border-b-0 sm:border-r',
  '',
];

/** Apple Health–style metric tile (category colour on the label only) */
function ImpactTile({
  index, icon: Icon, color, label, value, unit, note,
}: { index: number; icon: typeof Leaf; color: string; label: string; value: number; unit?: string; note: string }) {
  return (
    <div className={`p-5 ${tileBorders[index] ?? ''}`} style={{ borderColor: C.separator }}>
      <p className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color }}>
        <Icon size={15} strokeWidth={2.25} /> {label}
      </p>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-[28px] leading-none font-semibold tracking-[-0.02em] tabular-nums" style={{ color: C.label }}>
          {value.toLocaleString()}
        </span>
        {unit && <span className="text-[15px] font-medium" style={{ color: C.secondary }}>{unit}</span>}
      </p>
      <p className="text-[13px] mt-1.5" style={{ color: C.secondary }}>{note}</p>
    </div>
  );
}

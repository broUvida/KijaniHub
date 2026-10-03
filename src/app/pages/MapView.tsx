import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';
import { Trash2, Bug, Leaf, Flame, Droplets, LocateFixed } from 'lucide-react';
import type { Member } from '../context/AppContext';

/**
 * MapView - Interactive map showing all IoT device locations.
 * Uses plain Leaflet (no react-leaflet) so it works with React 18 in Figma Make.
 */

const MARKER_COLORS: Record<string, string> = {
  waste_bin: '#10b981',
  bsf_sensor: '#8b5cf6',
  compost_monitor: '#10b981',
  biogas_meter: '#f59e0b',
  wash_station: '#3b82f6',
};

const createCustomIcon = (color: string) =>
  L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path fill="${color}" stroke="#fff" stroke-width="2" d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24c0-8.837-7.163-16-16-16z"/>
        <circle cx="16" cy="16" r="6" fill="#fff"/>
      </svg>
    `)}`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });

const getDeviceTypeName = (type: string) => {
  switch (type) {
    case 'waste_bin': return 'Smart Waste Bin';
    case 'bsf_sensor': return 'BSF Sensor';
    case 'compost_monitor': return 'Compost Monitor';
    case 'biogas_meter': return 'Biogas Meter';
    case 'wash_station': return 'WASH Station';
    default: return 'Unknown Device';
  }
};

/** Builds the popup HTML for a device (plain HTML string for Leaflet popups) */
const buildPopupHtml = (device: any) => {
  const statusBg = device.status === 'online' ? '#d1fae5' : device.status === 'warning' ? '#fef3c7' : '#fee2e2';
  const statusColor = device.status === 'online' ? '#047857' : device.status === 'warning' ? '#92400e' : '#991b1b';
  const row = (label: string, value: string) =>
    `<div style="margin-bottom:4px">${label}: <span style="font-weight:500">${value}</span></div>`;

  let dataRows = '';
  const d = device.data;
  if (device.type === 'waste_bin') {
    dataRows = row('Fill Level', `${Math.round(d.fillLevel)}%`) + row('Temperature', `${d.temperature}°C`);
  } else if (device.type === 'bsf_sensor') {
    dataRows = row('Temperature', `${d.temperature}°C`) + row('Humidity', `${d.humidity}%`) + row('Larvae', `${d.larvaeWeight} kg`);
  } else if (device.type === 'compost_monitor') {
    dataRows = row('Temperature', `${d.temperature}°C`) + row('Moisture', `${d.moisture}%`) + row('pH', `${d.pH}`);
  } else if (device.type === 'biogas_meter') {
    dataRows = row('Gas Production', `${d.gasProduction} m³/day`) + row('Pressure', `${d.pressure} bar`) + row('Energy', `${Number(d.energyGenerated).toFixed(1)} kWh`);
  } else if (device.type === 'wash_station') {
    dataRows = row('Usage Today', `${d.handwashCount}`) + row('Soap Level', `${Math.round(d.soapLevel)}%`) + row('Water Level', `${Math.round(d.waterLevel)}%`);
  }

  return `
    <div style="padding:8px;min-width:230px;font-family:inherit">
      <h4 style="font-weight:600;color:#1f2937;margin:0 0 4px 0">${device.name}</h4>
      <p style="font-size:12px;color:#4b5563;margin:0 0 4px 0">${getDeviceTypeName(device.type)}</p>
      <p style="font-size:12px;color:#6b7280;margin:0 0 10px 0">${device.location.address}</p>
      <div style="border-top:1px solid #e5e7eb;padding-top:8px;margin-bottom:8px">
        <span style="display:inline-block;padding:3px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${statusBg};color:${statusColor}">
          ${String(device.status).toUpperCase()}
        </span>
      </div>
      <div style="border-top:1px solid #e5e7eb;padding-top:8px;font-size:12px;color:#4b5563">
        <p style="font-weight:500;color:#374151;margin:0 0 4px 0">Current Data:</p>
        ${dataRows}
      </div>
      <div style="border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px">
        <p style="font-size:11px;color:#9ca3af;margin:0">Updated: ${new Date(device.lastUpdate).toLocaleTimeString()}</p>
      </div>
    </div>
  `;
};

const MEMBER_COLORS: Record<string, string> = {
  municipal_council: '#6366f1',   // indigo
  volunteer_individual: '#14b8a6', // teal
  volunteer_group: '#ec4899',      // pink
};

const buildMemberPopupHtml = (m: Member) => {
  const typeLabel =
    m.accountType === 'municipal_council' ? 'Municipal Council'
    : m.accountType === 'volunteer_individual' ? 'Volunteer'
    : 'Volunteer Group (CSO/NGO)';
  return `
    <div style="padding:8px;min-width:220px;font-family:inherit">
      ${m.photo ? `<img src="${m.photo}" alt="" style="width:48px;height:48px;border-radius:50%;object-fit:cover;margin-bottom:8px;border:2px solid #e5e7eb"/>` : ''}
      <h4 style="font-weight:600;color:#1f2937;margin:0 0 2px 0">${m.name}</h4>
      <p style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;margin:0 0 6px 0">${typeLabel}</p>
      ${m.contactPerson ? `<p style="font-size:12px;color:#4b5563;margin:0 0 4px 0">Contact: ${m.contactPerson}</p>` : ''}
      <p style="font-size:12px;color:#4b5563;margin:0 0 4px 0">${m.location.address}${m.location.ward ? ` · ${m.location.ward}` : ''}</p>
      <p style="font-size:12px;color:#4b5563;margin:0 0 4px 0">📞 ${m.phone}</p>
      ${m.whatsapp ? `<p style="font-size:12px;color:#4b5563;margin:0 0 4px 0">WhatsApp: ${m.whatsapp}</p>` : ''}
      <p style="font-size:11px;color:#9ca3af;margin:6px 0 0 0">Joined: ${new Date(m.createdAt).toLocaleDateString()}</p>
    </div>
  `;
};

export default function MapView() {
  const { devices, members, currentMemberId, updateMemberLocation, authMode } = useApp();

  // ── "Update my location": signed-in members can move their own pin ──
  const me = authMode === 'real' ? members.find((m) => m.id === currentMemberId) : undefined;
  const [locating, setLocating] = useState(false);
  const [locMessage, setLocMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopWatching = () => {
    if (watchIdRef.current !== null) navigator.geolocation?.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
  };
  useEffect(() => stopWatching, []);

  /** Find a precise position (refining for up to 15 s), then save it once */
  const updateMyLocation = () => {
    if (!me) return;
    if (!('geolocation' in navigator) || !window.isSecureContext) {
      setLocMessage({ text: 'This browser can’t share your location here.', error: true });
      return;
    }
    stopWatching();
    setLocating(true);
    setLocMessage({ text: 'Finding your location…' });
    let best: { lat: number; lng: number; acc: number } | null = null;

    const finish = async () => {
      stopWatching();
      setLocating(false);
      if (!best) return;
      await updateMemberLocation(me.id, best.lat, best.lng);
      mapRef.current?.flyTo([best.lat, best.lng], 16);
      const acc = Math.round(best.acc);
      setLocMessage({ text: `Your pin moved here, accurate to about ${acc < 1000 ? `${acc} m` : `${(acc / 1000).toFixed(1)} km`}.` });
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (best && accuracy >= best.acc) return;
        best = { lat: latitude, lng: longitude, acc: accuracy };
        setLocMessage({ text: `Finding your location… within ${Math.round(accuracy)} m so far` });
        if (accuracy <= 25) finish();
      },
      (err) => {
        // A passing hiccup after a good reading: keep refining until the timer or a precise reading
        if (best && err.code !== 1) return;
        if (best) { finish(); return; }
        stopWatching();
        setLocating(false);
        const inPreview = window.self !== window.top;
        setLocMessage({
          error: true,
          text: err.code === 1
            ? inPreview
              ? 'Location is blocked inside this preview window. Open your published site to use it.'
              : 'Location access is off for this site. Allow it in your browser’s site settings and try again.'
            : err.code === 3
              ? 'Finding your location took too long. Try again near a window or outdoors.'
              : 'Your device couldn’t work out where it is right now.',
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    stopTimerRef.current = setTimeout(finish, 15000);
  };
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const memberMarkersRef = useRef<L.LayerGroup | null>(null);

  // Create the map once
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, { scrollWheelZoom: true }).setView(
      [-6.8, 39.25], // Dar es Salaam
      12
    );

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      // OpenStreetMap blocks map requests that don't say which site they come from
      referrerPolicy: 'strict-origin-when-cross-origin',
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    memberMarkersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Leaflet sometimes renders grey tiles if the container was hidden while mounting
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
      memberMarkersRef.current = null;
    };
  }, []);

  // Refresh IoT device markers whenever device data updates
  useEffect(() => {
    const layer = markersRef.current;
    if (!layer) return;
    layer.clearLayers();
    devices.forEach((device) => {
      const icon = createCustomIcon(MARKER_COLORS[device.type] ?? '#10b981');
      L.marker([device.location.lat, device.location.lng], { icon })
        .bindPopup(buildPopupHtml(device), { maxWidth: 300 })
        .addTo(layer);
    });
  }, [devices]);

  // Refresh network member markers whenever members list updates
  useEffect(() => {
    const layer = memberMarkersRef.current;
    if (!layer) return;
    layer.clearLayers();
    members.forEach((m) => {
      const color = MEMBER_COLORS[m.accountType] ?? '#6366f1';
      const icon = createCustomIcon(color);
      L.marker([m.location.lat, m.location.lng], { icon })
        .bindPopup(buildMemberPopupHtml(m), { maxWidth: 280 })
        .addTo(layer);
    });
  }, [members]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'waste_bin': return <Trash2 size={16} className="text-green-600" />;
      case 'bsf_sensor': return <Bug size={16} className="text-purple-600" />;
      case 'compost_monitor': return <Leaf size={16} className="text-green-600" />;
      case 'biogas_meter': return <Flame size={16} className="text-orange-600" />;
      case 'wash_station': return <Droplets size={16} className="text-blue-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Device Location Map</h1>
        <p className="text-gray-600 mt-1">View all IoT devices across Dar es Salaam</p>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Map Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Waste Bins & Compost</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600">BSF Production</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-600">Biogas Generation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">WASH Stations</span>
          </div>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
            <span className="text-sm text-gray-600">Municipal Councils</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-teal-500"></div>
            <span className="text-sm text-gray-600">Volunteers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-pink-500"></div>
            <span className="text-sm text-gray-600">Volunteer Groups</span>
          </div>
        </div>
      </div>

      {/* Your pin (signed-in members only) */}
      {me && (
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">Your pin: {me.name}</p>
            <p className={`text-sm ${locMessage?.error ? 'text-red-600' : 'text-gray-500'}`}>
              {locMessage?.text ?? `Last updated ${new Date(me.lastSeen).toLocaleString()}`}
            </p>
          </div>
          <button
            type="button"
            onClick={locating ? () => { stopWatching(); setLocating(false); setLocMessage(null); } : updateMyLocation}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
            style={{ background: '#1E8A5A' }}
          >
            <LocateFixed size={16} className={locating ? 'animate-pulse' : ''} />
            {locating ? 'Stop' : 'Update my location'}
          </button>
        </div>
      )}

      {/* Map */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
        <div ref={mapDivRef} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* Device List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Devices ({devices.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <div key={device.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">{getDeviceIcon(device.type)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm truncate">{device.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{device.location.address}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        device.status === 'online' ? 'bg-green-500' : device.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-xs text-gray-600 capitalize">{device.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

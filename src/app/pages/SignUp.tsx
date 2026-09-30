import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp, Member, MemberType } from '../context/AppContext';
import {
  Leaf, Landmark, User, Users, Mail, Phone, Lock, MapPin, Linkedin,
  MessageCircle, Camera, LocateFixed, AlertCircle, ArrowLeft, CheckCircle,
} from 'lucide-react';

/**
 * SignUp - Registration for Municipal Councils, Individual Volunteers,
 * and Volunteer Groups (CSOs / NGOs).
 * Location is MANDATORY: every member drops a pin on the map, and their
 * office / position immediately appears on the KijaniSense map view.
 */

const ACCOUNT_TYPES: { id: MemberType; icon: any; title: string; desc: string }[] = [
  {
    id: 'municipal_council',
    icon: Landmark,
    title: 'Municipal Council',
    desc: 'Register your council office. It will appear on the network map and gain access to ward-level waste data.',
  },
  {
    id: 'volunteer_individual',
    icon: User,
    title: 'Volunteer — Individual',
    desc: 'Join as an individual volunteer. Share your location, build your profile and take part in collections and campaigns.',
  },
  {
    id: 'volunteer_group',
    icon: Users,
    title: 'Volunteer — Group (CSO / NGO)',
    desc: 'Register your organization so your members can operate under one banner and partner with Kijani Hub.',
  },
];

/** Compress an uploaded image to a small square data URL for the profile */
const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 240;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function SignUp() {
  const navigate = useNavigate();
  const { addMember, setUserRole, setIsAuthenticated } = useApp();

  const [accountType, setAccountType] = useState<MemberType | null>(null);
  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    password: '',
    phone: '',
    whatsapp: '',
    linkedin: '',
    address: '',
    ward: '',
  });
  const [photo, setPhoto] = useState<string>('');
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Location picker map ──
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const pinIcon = L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path fill="#059669" stroke="#fff" stroke-width="2" d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24c0-8.837-7.163-16-16-16z"/>
        <circle cx="16" cy="16" r="6" fill="#fff"/>
      </svg>
    `)}`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });

  const placePin = (lat: number, lng: number) => {
    setPin({ lat, lng });
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
    }
  };

  useEffect(() => {
    if (!accountType || !mapDivRef.current || mapRef.current) return;
    const map = L.map(mapDivRef.current).setView([-6.8, 39.25], 12); // Dar es Salaam
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) => placePin(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountType]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Your browser does not support location. Please tap the map to drop a pin instead.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        placePin(pos.coords.latitude, pos.coords.longitude);
        mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 15);
      },
      () => setError('Could not read your location. Please tap the map to drop a pin instead.')
    );
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await fileToDataUrl(file));
    } catch {
      setError('Could not read that image — please try a different photo.');
    }
  };

  const isVolunteer = accountType === 'volunteer_individual' || accountType === 'volunteer_group';
  const isOrg = accountType === 'municipal_council' || accountType === 'volunteer_group';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Location is mandatory for every account type
    if (!pin) {
      setError('Location is required — tap the map to drop a pin, or use "Use my current location".');
      return;
    }
    if (!form.address.trim()) {
      setError('Please enter your street / area address.');
      return;
    }

    setSaving(true);

    const member: Member = {
      id: `member-${Date.now()}`,
      accountType: accountType!,
      name: form.name.trim(),
      contactPerson: isOrg ? form.contactPerson.trim() : undefined,
      email: form.email.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim() || undefined,
      linkedin: isVolunteer && form.linkedin.trim() ? form.linkedin.trim() : undefined,
      photo: photo || undefined,
      location: {
        lat: Math.round(pin.lat * 100000) / 100000,
        lng: Math.round(pin.lng * 100000) / 100000,
        address: form.address.trim(),
        ward: form.ward.trim() || undefined,
      },
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    };

    try {
      await addMember(member);
    } catch (e) {
      console.warn('addMember error:', e);
    }

    // Sign the new member in with an appropriate dashboard role
    const role = accountType === 'municipal_council' ? 'regional_manager' : 'volunteer';
    setUserRole(role as any);
    setIsAuthenticated(true);
    localStorage.setItem('userRole', role);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userName', member.name);

    navigate('/dashboard/map'); // land on the map so they see themselves on it
  };

  // ── STEP 1: choose account type ──
  if (!accountType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="bg-emerald-600 p-4 rounded-2xl shadow-lg">
                <Leaf className="text-white" size={40} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join the Kijani Hub network</h1>
            <p className="text-gray-600">Choose how you want to sign up. Every member appears on the network map.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {ACCOUNT_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setAccountType(t.id)}
                className="bg-white rounded-2xl shadow-md p-6 text-left hover:shadow-xl hover:-translate-y-1 transition-all border-2 border-transparent hover:border-emerald-500"
              >
                <t.icon className="text-emerald-600" size={28} />
                <h3 className="font-bold text-gray-800 mt-4">{t.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{t.desc}</p>
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-700 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── STEP 2: details + mandatory location ──
  const typeMeta = ACCOUNT_TYPES.find((t) => t.id === accountType)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setAccountType(null)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 mb-5"
        >
          <ArrowLeft size={16} /> Change account type
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-1">
            <typeMeta.icon className="text-emerald-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-800">{typeMeta.title} sign up</h1>
          </div>
          <p className="text-sm text-gray-500 mb-7">
            Fields marked <span className="text-red-500">*</span> are required. Your location will be shown on the KijaniSense network map.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {accountType === 'municipal_council' ? 'Council / office name' : accountType === 'volunteer_group' ? 'Organization name (CSO / NGO)' : 'Full name'} <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder={accountType === 'municipal_council' ? 'e.g. Ilala Municipal Council' : accountType === 'volunteer_group' ? 'e.g. Green Youth Initiative' : 'e.g. Amina Hassan'}
              />
            </div>

            {/* Contact person for orgs */}
            {isOrg && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact person <span className="text-red-500">*</span></label>
                <input
                  required
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Full name of the responsible officer"
                />
              </div>
            )}

            {/* Email + password */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="you@example.org"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required type="password" minLength={6} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Min. 6 characters"
                  />
                </div>
              </div>
            </div>

            {/* Phone + WhatsApp */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="+255 7XX XXX XXX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp number</label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel" value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Same as phone, or different"
                  />
                </div>
              </div>
            </div>

            {/* Volunteer extras: LinkedIn + profile photo */}
            {isVolunteer && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn profile</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="url" value={form.linkedin}
                      onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/yourname"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {accountType === 'volunteer_group' ? 'Logo / photo' : 'Profile picture'}
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center gap-2 px-3 py-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 text-sm text-gray-500">
                      <Camera size={18} className="text-gray-400" />
                      {photo ? 'Change photo' : 'Upload photo'}
                      <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                    </label>
                    {photo && <img src={photo} alt="Profile preview" className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500" />}
                  </div>
                </div>
              </div>
            )}

            {/* MANDATORY LOCATION */}
            <div className="border-t border-gray-200 pt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="inline-flex items-center gap-1.5"><MapPin size={16} className="text-emerald-600" />
                  {accountType === 'municipal_council' ? 'Office location' : accountType === 'volunteer_group' ? 'Organization location' : 'Your location'} <span className="text-red-500">*</span>
                </span>
              </label>
              <p className="text-xs text-gray-500 mb-3">Tap the map to drop a pin, or use your current location. This is where you will appear on the network map.</p>
              <div className="rounded-lg overflow-hidden border border-gray-300" style={{ height: '260px' }}>
                <div ref={mapDivRef} style={{ height: '100%', width: '100%' }} />
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <button type="button" onClick={useMyLocation}
                  className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 border border-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors">
                  <LocateFixed size={16} /> Use my current location
                </button>
                {pin ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
                    <CheckCircle size={16} /> Pin set: {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">No pin set yet</span>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street / area address <span className="text-red-500">*</span></label>
                  <input
                    required value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g. Uhuru Street, Ilala"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ward</label>
                  <input
                    value={form.ward}
                    onChange={(e) => setForm({ ...form, ward: e.target.value })}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g. Kariakoo"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                <AlertCircle size={17} /> {error}
              </div>
            )}

            <button
              type="submit" disabled={saving}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Creating your account…' : 'Create account & appear on the map'}
            </button>
            <p className="text-center text-xs text-gray-400">
              Your details are saved to the Kijani Hub network and will appear on the map for all users.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

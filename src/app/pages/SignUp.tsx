import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp, MemberType } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import {
  Leaf, Landmark, User, Users, Camera, LocateFixed, AlertCircle, ChevronLeft, ChevronRight, Check, MailCheck, CheckCircle2,
} from 'lucide-react';

/**
 * SignUp — Apple-style registration for municipal councils, individual volunteers
 * and volunteer groups (CSOs / NGOs).
 * Location is required: every member drops a pin, and appears on the KijaniSense map.
 */

const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const C = {
  label: '#1D1D1F',
  secondary: '#6E6E73',
  tertiary: '#8E8E93',
  separator: '#E5E5EA',
  tint: '#1E8A5A',
  green: '#248A3D',
  red: '#E0352B',
};

const ACCOUNT_TYPES: { id: MemberType; icon: typeof Landmark; title: string; desc: string }[] = [
  {
    id: 'municipal_council',
    icon: Landmark,
    title: 'Municipal council',
    desc: 'Register your council office. It appears on the network map and gets ward-level waste data.',
  },
  {
    id: 'volunteer_individual',
    icon: User,
    title: 'Individual volunteer',
    desc: 'Take part in collections and campaigns, and build your volunteer profile.',
  },
  {
    id: 'volunteer_group',
    icon: Users,
    title: 'Volunteer group (CSO or NGO)',
    desc: 'Register your organisation so your members can work together under one name.',
  },
];

const FORM_COPY: Record<MemberType, { heading: string; nameLabel: string; namePlaceholder: string; locationLabel: string }> = {
  municipal_council: { heading: 'Register your council', nameLabel: 'Council', namePlaceholder: 'Ilala Municipal Council', locationLabel: 'Office location' },
  volunteer_individual: { heading: 'Join as a volunteer', nameLabel: 'Full name', namePlaceholder: 'Amina Hassan', locationLabel: 'Your location' },
  volunteer_group: { heading: 'Register your organisation', nameLabel: 'Organisation', namePlaceholder: 'Green Youth Initiative', locationLabel: 'Organisation location' },
};

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

const inputClass = 'flex-1 min-w-0 h-11 bg-transparent text-[17px] outline-none placeholder:text-[#A1A1A6]';

export default function SignUp() {
  const navigate = useNavigate();
  const { refreshSession } = useApp();

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
  const [sentTo, setSentTo] = useState<string | null>(null);   // email the confirmation link went to
  const [resend, setResend] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [locating, setLocating] = useState(false);              // finding the device's position
  const [accuracy, setAccuracy] = useState<number | null>(null); // metres, when the pin came from GPS

  // ── Location picker map ──
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const pinIcon = L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path fill="${C.tint}" stroke="#fff" stroke-width="2" d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24c0-8.837-7.163-16-16-16z"/>
        <circle cx="16" cy="16" r="6" fill="#fff"/>
      </svg>
    `)}`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });

  const clearAccuracy = () => {
    accuracyCircleRef.current?.remove();
    accuracyCircleRef.current = null;
    setAccuracy(null);
  };

  /** Put the pin at a spot. fromGps=false means the person placed it themselves (exact). */
  const placePin = (lat: number, lng: number, fromGps = false) => {
    setPin({ lat, lng });
    setError('');
    if (!fromGps) clearAccuracy();
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { icon: pinIcon, draggable: true, autoPan: true }).addTo(map);
      // Dragging the pin fine-tunes it to the exact spot
      marker.on('dragend', () => {
        const p = marker.getLatLng();
        stopLocating();
        clearAccuracy();
        setPin({ lat: p.lat, lng: p.lng });
      });
      markerRef.current = marker;
    }
  };

  useEffect(() => {
    if (!accountType || !mapDivRef.current || mapRef.current) return;
    const map = L.map(mapDivRef.current).setView([-6.8, 39.25], 12); // Dar es Salaam
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      // OpenStreetMap blocks map requests that don't say which site they come from
      referrerPolicy: 'strict-origin-when-cross-origin',
    }).addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) => placePin(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);
    return () => {
      stopLocating();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      accuracyCircleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountType]);

  const stopLocating = () => {
    if (watchIdRef.current !== null) navigator.geolocation?.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
    setLocating(false);
  };

  /**
   * Ask the device for a precise position and keep refining for up to 20 seconds.
   * Phones usually get within ~20 m outdoors; laptops guess from Wi-Fi and can be far off.
   */
  const useMyLocation = () => {
    setError('');
    if (!('geolocation' in navigator)) {
      setError('This browser can’t share your location. Tap the map or drag the pin instead.');
      return;
    }
    if (!window.isSecureContext) {
      setError('Location only works on a secure (https) page. Tap the map instead.');
      return;
    }
    stopLocating();
    setLocating(true);
    let bestAccuracy = Infinity;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        if (acc >= bestAccuracy) return; // keep the most precise reading
        bestAccuracy = acc;
        placePin(latitude, longitude, true);
        setAccuracy(Math.round(acc));
        const map = mapRef.current;
        if (map) {
          accuracyCircleRef.current?.remove();
          accuracyCircleRef.current = L.circle([latitude, longitude], {
            radius: acc, color: C.tint, weight: 1, fillColor: C.tint, fillOpacity: 0.12, interactive: false,
          }).addTo(map);
          const zoom = acc <= 50 ? 17 : acc <= 250 ? 16 : acc <= 1000 ? 14 : 13;
          map.setView([latitude, longitude], zoom);
        }
        if (acc <= 25) stopLocating(); // precise enough
      },
      (err) => {
        const hadFix = bestAccuracy !== Infinity;
        // A passing hiccup (no signal for a moment, slow reading) after a good reading: keep refining
        if (hadFix && err.code !== 1) return;
        stopLocating();
        if (hadFix) return; // location was switched off, but we keep the reading we have
        const inPreview = window.self !== window.top;
        setError(
          err.code === 1
            ? inPreview
              ? 'Location is blocked inside this preview window. Open your published site to use it, or tap the map.'
              : 'Location access is off for this site. Allow it in your browser’s site settings, or tap the map.'
            : err.code === 3
              ? 'Finding your location took too long. Try again near a window or outdoors, or tap the map.'
              : 'Your device couldn’t work out where it is. Tap the map or drag the pin instead.'
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
    stopTimerRef.current = setTimeout(stopLocating, 20000); // stop refining after 20 s
  };

  const formatAccuracy = (m: number) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await fileToDataUrl(file));
    } catch {
      setError('We couldn’t read that image. Try a different photo.');
    }
  };

  const isVolunteer = accountType === 'volunteer_individual' || accountType === 'volunteer_group';
  const isOrg = accountType === 'municipal_council' || accountType === 'volunteer_group';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Location is required for every account type
    if (!pin) {
      setError('Add your location: tap the map to drop a pin, or use your current location.');
      return;
    }
    if (!form.address.trim()) {
      setError('Add your street or area address.');
      return;
    }

    setSaving(true);
    const email = form.email.trim();

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
          // The database turns this into the person's profile and map pin
          data: {
            account_type: accountType,
            full_name: form.name.trim(),
            member: {
              id: `member-${Date.now()}`,
              name: form.name.trim(),
              contact_person: isOrg ? form.contactPerson.trim() : '',
              phone: form.phone.trim(),
              whatsapp: form.whatsapp.trim(),
              linkedin: isVolunteer ? form.linkedin.trim() : '',
              lat: Math.round(pin.lat * 100000) / 100000,
              lng: Math.round(pin.lng * 100000) / 100000,
              address: form.address.trim(),
              ward: form.ward.trim(),
            },
          },
        },
      });

      if (signUpError) {
        const m = signUpError.message.toLowerCase();
        setError(
          m.includes('already registered') ? 'An account with this email already exists. Sign in instead.'
          : m.includes('password') ? 'Choose a stronger password: at least 6 characters.'
          : m.includes('rate limit') || m.includes('too many') ? 'Too many sign-ups right now. Wait a few minutes, then try again.'
          : m.includes('fetch') || m.includes('network') ? 'We couldn’t reach the server. Check your connection and try again.'
          : m.includes('sending') && m.includes('email') ? 'We couldn’t send your confirmation email just now. Please try again in a few minutes. If it keeps happening, contact kijanihubtz@gmail.com.'
          : signUpError.message
        );
        setSaving(false);
        return;
      }

      // Supabase hides whether an email is taken: an existing account comes back with no identities
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('An account with this email already exists. Sign in instead.');
        setSaving(false);
        return;
      }

      // The photo is uploaded on first sign-in (it's too large to send with the sign-up)
      if (photo) localStorage.setItem('kijani-pending-photo', JSON.stringify({ email, photo }));

      if (data.session) {
        // Email confirmation is switched off in Supabase: they're signed in already
        await refreshSession();
        navigate('/dashboard/map');
        return;
      }

      setSentTo(email);
      setSaving(false);
    } catch (err) {
      setError('We couldn’t reach the server. Check your connection and try again.');
      setSaving(false);
    }
  };

  const resendEmail = async () => {
    if (!sentTo) return;
    setResend('sending');
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: sentTo,
        options: { emailRedirectTo: `${window.location.origin}/login?confirmed=1` },
      });
      setResend(resendError ? 'error' : 'sent');
    } catch {
      setResend('error');
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  // ── Done: confirmation email sent ──
  if (sentTo) {
    return (
      <Shell back={{ label: 'Kijani Hub', to: '/' }}>
        <div className="text-center pt-6">
          <span className="inline-flex w-16 h-16 rounded-full items-center justify-center" style={{ background: 'rgba(30,138,90,0.12)' }}>
            <MailCheck size={32} style={{ color: C.tint }} />
          </span>
          <h1 className="mt-5 text-[28px] leading-tight font-semibold tracking-[-0.02em]">Check your email</h1>
          <p className="mt-3 text-[17px] leading-[1.45] text-balance" style={{ color: C.secondary }}>
            We sent a confirmation link to <span style={{ color: C.label }}>{sentTo}</span>. Tap it to finish creating your account, and your pin will appear on the map.
          </p>
        </div>

        <Link
          to="/login"
          className="mt-8 w-full h-12 rounded-xl text-[17px] font-semibold text-white flex items-center justify-center"
          style={{ background: C.tint }}
        >
          Go to sign in
        </Link>

        <div className="mt-6 text-center text-[15px]" style={{ color: C.secondary }}>
          {resend === 'sent' ? (
            <p className="inline-flex items-center gap-1.5" style={{ color: C.green }}><CheckCircle2 size={16} /> Sent again. Check your inbox.</p>
          ) : (
            <p>
              Didn’t get it? Check your spam folder, or{' '}
              <button type="button" onClick={resendEmail} disabled={resend === 'sending'} style={{ color: C.tint }}>
                {resend === 'sending' ? 'sending…' : 'send it again'}
              </button>
              .
            </p>
          )}
          {resend === 'error' && (
            <p className="mt-2 text-[13px]" style={{ color: C.red }}>We couldn’t resend it. Wait a minute and try again.</p>
          )}
        </div>
      </Shell>
    );
  }

  // ── STEP 1: choose account type ──
  if (!accountType) {
    return (
      <Shell back={{ label: 'Kijani Hub', to: '/' }}>
        <div className="text-center">
          <span className="inline-flex w-16 h-16 rounded-[16px] items-center justify-center" style={{ background: C.tint }}>
            <Leaf size={34} className="text-white" strokeWidth={2} />
          </span>
          <h1 className="mt-5 text-[28px] leading-tight font-semibold tracking-[-0.02em]">Join KijaniSense</h1>
          <p className="mt-2 text-[15px] text-balance" style={{ color: C.secondary }}>
            Choose how you’d like to take part. Every member appears on the network map.
          </p>
        </div>

        <div className="mt-8 bg-white rounded-xl overflow-hidden">
          <div className="pl-4 divide-y divide-[#E5E5EA]">
            {ACCOUNT_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setAccountType(t.id)}
                className="w-full flex items-center gap-3 pr-3 py-3 text-left hover:bg-black/[0.02] active:bg-black/[0.05]"
              >
                <span className="w-9 h-9 rounded-[9px] flex-shrink-0 flex items-center justify-center" style={{ background: C.tint }}>
                  <t.icon size={19} className="text-white" strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[17px]">{t.title}</p>
                  <p className="text-[13px] leading-[1.35]" style={{ color: C.secondary }}>{t.desc}</p>
                </div>
                <ChevronRight size={18} className="flex-shrink-0" style={{ color: '#C4C4C7' }} />
              </button>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-[15px]" style={{ color: C.secondary }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: C.tint }}>Sign in</Link>
        </p>
      </Shell>
    );
  }

  // ── STEP 2: details + required location ──
  const copy = FORM_COPY[accountType];

  return (
    <Shell back={{ label: 'Account type', onClick: () => { setAccountType(null); setPin(null); setError(''); } }}>
      <h1 className="px-1 text-[28px] leading-tight font-semibold tracking-[-0.02em]">{copy.heading}</h1>
      <p className="px-1 mt-1.5 text-[15px]" style={{ color: C.secondary }}>
        It takes about two minutes. You can update your details later.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-7">
        {/* Identity */}
        <Group>
          <Field label={copy.nameLabel} htmlFor="name">
            <input id="name" required value={form.name} onChange={set('name')} placeholder={copy.namePlaceholder} className={inputClass} autoComplete={accountType === 'volunteer_individual' ? 'name' : 'organization'} />
          </Field>
          {isOrg && (
            <Field label="Contact person" htmlFor="contactPerson">
              <input id="contactPerson" required value={form.contactPerson} onChange={set('contactPerson')} placeholder="Full name" className={inputClass} autoComplete="name" />
            </Field>
          )}
        </Group>

        {/* Account */}
        <Group header="Account">
          <Field label="Email" htmlFor="email">
            <input id="email" type="email" required value={form.email} onChange={set('email')} placeholder="name@example.org" className={inputClass} autoComplete="email" />
          </Field>
          <Field label="Password" htmlFor="password">
            <input id="password" type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="At least 6 characters" className={inputClass} autoComplete="new-password" />
          </Field>
        </Group>

        {/* Contact */}
        <Group header="Contact" footer={isVolunteer ? 'Shown on your map profile so others can reach you.' : undefined}>
          <Field label="Phone" htmlFor="phone">
            <input id="phone" type="tel" required value={form.phone} onChange={set('phone')} placeholder="+255 7XX XXX XXX" className={inputClass} autoComplete="tel" />
          </Field>
          <Field label="WhatsApp" htmlFor="whatsapp">
            <input id="whatsapp" type="tel" value={form.whatsapp} onChange={set('whatsapp')} placeholder="Optional" className={inputClass} />
          </Field>
          {isVolunteer && (
            <Field label="LinkedIn" htmlFor="linkedin">
              <input id="linkedin" type="url" value={form.linkedin} onChange={set('linkedin')} placeholder="Optional" className={inputClass} />
            </Field>
          )}
        </Group>

        {/* Photo (volunteers) */}
        {isVolunteer && (
          <Group header={accountType === 'volunteer_group' ? 'Logo' : 'Profile photo'}>
            <label className="flex items-center gap-3 pr-4 py-2.5 cursor-pointer">
              {photo ? (
                <img src={photo} alt="Your photo" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <span className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#F2F2F7' }}>
                  <Camera size={20} style={{ color: C.tertiary }} />
                </span>
              )}
              <span className="text-[17px]" style={{ color: C.tint }}>{photo ? 'Change photo' : 'Add a photo'}</span>
              <span className="ml-auto text-[15px]" style={{ color: C.tertiary }}>Optional</span>
              <input type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
            </label>
          </Group>
        )}

        {/* Location (required) */}
        <div>
          <p className="px-4 mb-1.5 text-[13px]" style={{ color: C.secondary }}>{copy.locationLabel}</p>
          <div className="bg-white rounded-xl overflow-hidden isolate">
            <div ref={mapDivRef} style={{ height: 240, width: '100%' }} aria-label="Map: tap to drop your pin" />
            <div className="pl-4 divide-y divide-[#E5E5EA] border-t border-[#E5E5EA]">
              <button
                type="button"
                onClick={locating ? stopLocating : useMyLocation}
                className="w-full min-h-11 py-2 flex items-center justify-between gap-3 pr-4 text-[17px] text-left"
              >
                <span className="flex items-center gap-2" style={{ color: C.tint }}>
                  <LocateFixed size={18} className={locating ? 'animate-pulse' : ''} />
                  {locating ? 'Finding your location…' : pin && accuracy !== null ? 'Find me again' : 'Use my current location'}
                </span>
                {locating ? (
                  <span className="text-[15px]" style={{ color: C.tertiary }}>Tap to stop</span>
                ) : pin ? (
                  <span className="flex items-center gap-1 text-[15px] whitespace-nowrap" style={{ color: C.green }}>
                    <Check size={16} /> {accuracy !== null ? `Within ${formatAccuracy(accuracy)}` : 'Pin set'}
                  </span>
                ) : (
                  <span className="text-[15px]" style={{ color: C.tertiary }}>No pin yet</span>
                )}
              </button>
              <Field label="Address" htmlFor="address">
                <input id="address" required value={form.address} onChange={set('address')} placeholder="Uhuru Street, Ilala" className={inputClass} autoComplete="street-address" />
              </Field>
              <Field label="Ward" htmlFor="ward">
                <input id="ward" value={form.ward} onChange={set('ward')} placeholder="Optional" className={inputClass} />
              </Field>
            </div>
          </div>
          <p className="px-4 mt-1.5 text-[13px] leading-[1.4]" style={{ color: C.tertiary }}>
            {accuracy !== null && accuracy > 200
              ? 'Your device gave a rough position. Drag the pin onto your exact spot.'
              : 'Tap the map, or drag the pin, to put it exactly where you are. This is where you’ll appear on the network map.'}
          </p>
        </div>

        {error && (
          <p role="alert" className="px-1 flex items-start gap-1.5 text-[15px]" style={{ color: C.red }}>
            <AlertCircle size={17} className="mt-[2px] flex-shrink-0" /> {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 rounded-xl text-[17px] font-semibold text-white transition-opacity disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1E8A5A]/25"
            style={{ background: C.tint }}
          >
            {saving ? 'Creating your account…' : 'Create account'}
          </button>
          <p className="mt-3 px-2 text-center text-[13px] leading-[1.45] text-balance" style={{ color: C.tertiary }}>
            Your details are saved to the Kijani Hub network. Your name, location and contact details will be visible to other members on the map.
          </p>
        </div>
      </form>
    </Shell>
  );
}

// ── Pieces ───────────────────────────────────────────────────

type Back = { label: string; to?: string; onClick?: () => void };

function Shell({ back, children }: { back: Back; children: React.ReactNode }) {
  const cls = 'inline-flex items-center gap-0.5 text-[17px]';
  return (
    <div className="min-h-screen bg-[#F5F5F7] antialiased" style={{ fontFamily: SYSTEM_FONT, color: C.label }}>
      <div className="max-w-[1080px] mx-auto h-12 px-4 flex items-center">
        {back.to ? (
          <Link to={back.to} className={cls} style={{ color: C.tint }}><ChevronLeft size={22} strokeWidth={2} />{back.label}</Link>
        ) : (
          <button type="button" onClick={back.onClick} className={cls} style={{ color: C.tint }}><ChevronLeft size={22} strokeWidth={2} />{back.label}</button>
        )}
      </div>
      <main className="max-w-[520px] mx-auto px-4 pt-6 pb-16">{children}</main>
    </div>
  );
}

/** An iOS-style inset group with an optional header and footer */
function Group({ header, footer, children }: { header?: string; footer?: string; children: React.ReactNode }) {
  return (
    <div>
      {header && <p className="px-4 mb-1.5 text-[13px]" style={{ color: C.secondary }}>{header}</p>}
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="pl-4 divide-y divide-[#E5E5EA]">{children}</div>
      </div>
      {footer && <p className="px-4 mt-1.5 text-[13px] leading-[1.4]" style={{ color: C.tertiary }}>{footer}</p>}
    </div>
  );
}

/** A form row: label on the left, input on the right */
function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pr-4">
      <label htmlFor={htmlFor} className="w-[118px] flex-shrink-0 text-[17px]">{label}</label>
      {children}
    </div>
  );
}

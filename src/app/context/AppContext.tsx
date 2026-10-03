import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ConversionFactor, FactorMap, DEFAULT_FACTORS, factorsToMap, computeImpact,
  DeviceThroughput, DEFAULT_THROUGHPUT, totalThroughput,
} from '../lib/conversionFactors';
import { fetchAllMembers, insertMember, patchMemberLocation } from '../lib/membersApi';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import {
  fetchFactors, upsertFactor, resetAllFactors,
  fetchThroughput, upsertThroughput,
  fetchManualWaste, upsertManualWaste,
} from '../lib/conversionApi';

/**
 * User roles for the KijaniSense platform
 */
export type UserRole = 'admin' | 'regional_manager' | 'volunteer';

/**
 * IoT Device types used in the system
 */
export interface IoTDevice {
  id: string;
  name: string;
  type: 'waste_bin' | 'bsf_sensor' | 'compost_monitor' | 'biogas_meter' | 'wash_station';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'online' | 'offline' | 'warning';
  lastUpdate: Date;
  data: any;
}

/**
 * Notification type for alerts
 */
export interface Notification {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
  deviceId?: string;
  read: boolean;
}

/**
 * Dashboard metrics interface
 */
export interface DashboardMetrics {
  totalWasteCollected: number; // kg
  fertilizerProduced: number; // kg
  householdsServed: number;
  co2Reduced: number; // kg
  hygieneUsage: number; // count
  activeDevices: number;
  totalDevices: number;
}

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  userName: string;
  devices: IoTDevice[];
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  metrics: DashboardMetrics;
  isOnline: boolean;
  pendingSync: number;
  logout: () => Promise<void>;
  /** 'real' = Supabase account, 'demo' = one of the demo accounts, null = signed out */
  authMode: 'demo' | 'real' | null;
  /** true while a saved Supabase session is being restored on page load */
  authLoading: boolean;
  /** Re-read the Supabase session and apply the user's role (call after signing in) */
  refreshSession: () => Promise<void>;
  /** Start a demo session for one of the demo accounts */
  startDemoSession: (role: UserRole, name: string) => void;
  members: Member[];
  addMember: (member: Member) => Promise<void>;
  updateMemberLocation: (id: string, lat: number, lng: number) => Promise<void>;
  currentMemberId: string | null;
  // ─── Admin-controlled conversion engine ───
  factors: ConversionFactor[];
  updateFactor: (key: string, value: number) => void;
  resetFactors: () => void;
  manualWasteKg: number | null;        // if set, overrides the simulated waste total
  setManualWasteKg: (kg: number | null) => void;
  deviceThroughput: DeviceThroughput;  // per-device waste (kg), admin-set
  setDeviceThroughput: (id: string, kg: number) => void;
  // ─── Community & commerce ───
  events: CommunityEvent[];
  addEvent: (e: CommunityEvent) => void;
  forumPosts: ForumPost[];
  addForumPost: (p: ForumPost) => void;
  addForumReply: (postId: string, reply: ForumReply) => void;
  orders: Order[];
  placeOrder: (o: Order) => void;
}

/** An event or official update, posted by the admin or shown to all users */
export interface CommunityEvent {
  id: string;
  title: string;
  date: string;          // ISO date of the event
  location: string;
  description: string;
  type: 'event' | 'update' | 'announcement';
  createdAt: string;
}

/** A forum discussion thread */
export interface ForumReply {
  id: string;
  author: string;
  role: string;
  body: string;
  createdAt: string;
}
export interface ForumPost {
  id: string;
  author: string;
  role: string;          // e.g. 'admin', 'volunteer', 'council'
  title: string;
  body: string;
  pinned?: boolean;      // admin updates can be pinned
  createdAt: string;
  replies: ForumReply[];
}

/** A marketplace order placed by a stakeholder */
export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;     // TZS
}
export interface Order {
  id: string;
  buyerName: string;
  buyerContact: string;
  items: OrderItem[];
  total: number;
  status: 'requested' | 'confirmed' | 'in_transit' | 'delivered';
  createdAt: string;
}

/**
 * Registered network members: municipal councils, individual volunteers,
 * and volunteer groups (CSOs / NGOs). All appear on the map after sign-up.
 */
export type MemberType = 'municipal_council' | 'volunteer_individual' | 'volunteer_group';

export interface Member {
  id: string;
  accountType: MemberType;
  name: string;              // office name, person's full name, or organization name
  contactPerson?: string;    // for councils and groups
  email: string;
  phone: string;
  whatsapp?: string;
  linkedin?: string;
  photo?: string;            // data URL (volunteers)
  location: {
    lat: number;
    lng: number;
    address: string;
    ward?: string;
  };
  createdAt: string;
  lastSeen: string;          // updated when a volunteer shares live location
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Mock IoT data generator - simulates real sensor readings
 */
const generateMockDevices = (): IoTDevice[] => {
  return [
    // Waste bins
    {
      id: 'waste-001',
      name: 'Kariakoo Market Bin',
      type: 'waste_bin',
      location: { lat: -6.8161, lng: 39.2803, address: 'Kariakoo Market, Dar es Salaam' },
      status: 'online',
      lastUpdate: new Date(),
      data: { fillLevel: 75, temperature: 28, lastCollection: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
    },
    {
      id: 'waste-002',
      name: 'Ilala District Bin',
      type: 'waste_bin',
      location: { lat: -6.8235, lng: 39.2695, address: 'Ilala District, Dar es Salaam' },
      status: 'warning',
      lastUpdate: new Date(),
      data: { fillLevel: 92, temperature: 30, lastCollection: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
    },
    // BSF sensors
    {
      id: 'bsf-001',
      name: 'Kijani Hub BSF Unit 1',
      type: 'bsf_sensor',
      location: { lat: -6.7924, lng: 39.2083, address: 'Kijani Hub, Kinondoni' },
      status: 'online',
      lastUpdate: new Date(),
      data: { temperature: 32, humidity: 65, larvaeWeight: 45, feedRate: 12 }
    },
    {
      id: 'bsf-002',
      name: 'Kijani Hub BSF Unit 2',
      type: 'bsf_sensor',
      location: { lat: -6.7924, lng: 39.2085, address: 'Kijani Hub, Kinondoni' },
      status: 'online',
      lastUpdate: new Date(),
      data: { temperature: 31, humidity: 68, larvaeWeight: 52, feedRate: 15 }
    },
    // Compost monitors
    {
      id: 'compost-001',
      name: 'Central Compost Site',
      type: 'compost_monitor',
      location: { lat: -6.7850, lng: 39.2150, address: 'Central Compost, Kinondoni' },
      status: 'online',
      lastUpdate: new Date(),
      data: { temperature: 55, humidity: 45, pH: 7.2, moisture: 50 }
    },
    // Biogas meters
    {
      id: 'biogas-001',
      name: 'Biogas Digester 1',
      type: 'biogas_meter',
      location: { lat: -6.7900, lng: 39.2100, address: 'Kijani Hub, Kinondoni' },
      status: 'online',
      lastUpdate: new Date(),
      data: { gasProduction: 3.5, pressure: 1.2, temperature: 35, energyGenerated: 8.2 }
    },
    // WASH stations
    {
      id: 'wash-001',
      name: 'Kariakoo WASH Station',
      type: 'wash_station',
      location: { lat: -6.8170, lng: 39.2810, address: 'Kariakoo Market, Dar es Salaam' },
      status: 'online',
      lastUpdate: new Date(),
      data: { handwashCount: 324, soapLevel: 45, waterLevel: 70 }
    },
    {
      id: 'wash-002',
      name: 'School WASH Station',
      type: 'wash_station',
      location: { lat: -6.7950, lng: 39.2200, address: 'Primary School, Kinondoni' },
      status: 'warning',
      lastUpdate: new Date(),
      data: { handwashCount: 189, soapLevel: 15, waterLevel: 25 }
    },
  ];
};

/**
 * Generate mock notifications based on device status
 */
const generateNotifications = (devices: IoTDevice[]): Notification[] => {
  const notifications: Notification[] = [];
  
  devices.forEach(device => {
    if (device.type === 'waste_bin' && device.data.fillLevel > 85) {
      notifications.push({
        id: `notif-${device.id}`,
        type: 'critical',
        message: `${device.name} is ${device.data.fillLevel}% full and needs collection`,
        timestamp: new Date(),
        deviceId: device.id,
        read: false
      });
    }
    
    if (device.type === 'wash_station' && (device.data.soapLevel < 20 || device.data.waterLevel < 30)) {
      notifications.push({
        id: `notif-${device.id}`,
        type: 'warning',
        message: `${device.name} - Low ${device.data.soapLevel < 20 ? 'soap' : 'water'} level`,
        timestamp: new Date(),
        deviceId: device.id,
        read: false
      });
    }
  });
  
  return notifications;
};

/**
 * Calculate dashboard metrics from device data
 */
const calculateMetrics = (
  devices: IoTDevice[],
  factorMap: FactorMap,
  manualWasteKg: number | null,
  deviceThroughput: DeviceThroughput,
): DashboardMetrics => {
  const wasteDevices = devices.filter(d => d.type === 'waste_bin');
  const washDevices = devices.filter(d => d.type === 'wash_station');

  // Waste total priority:
  //   1. Admin's manual override, if set
  //   2. Sum of per-device throughput (the admin-set per-device numbers)
  //   3. Simulated sensor total (fallback)
  const simulatedWaste = Math.round(
    wasteDevices.reduce((sum, d) => sum + (d.data.fillLevel * 1.2), 0) * 45
  );
  const throughputTotal = totalThroughput(deviceThroughput);
  const totalWaste =
    manualWasteKg !== null ? manualWasteKg
    : throughputTotal > 0 ? throughputTotal
    : simulatedWaste;

  const hygieneUsage = washDevices.reduce((sum, d) => sum + d.data.handwashCount, 0);

  // Everything below is DERIVED from the editable conversion factors
  const impact = computeImpact(totalWaste, factorMap);

  return {
    totalWasteCollected: Math.round(totalWaste),
    fertilizerProduced: Math.round(impact.frassKg),
    householdsServed: 1247,
    co2Reduced: impact.co2eAvoidedKg,
    hygieneUsage,
    activeDevices: devices.filter(d => d.status === 'online').length,
    totalDevices: devices.length
  };
};

/**
 * AppProvider - Global state management for KijaniSense
 * Handles user roles, IoT device data, notifications, and offline capabilities
 */
/** Seed content so Community & Marketplace look alive on first load */
const SEED_EVENTS: CommunityEvent[] = [
  {
    id: 'evt-seed-1',
    title: 'Kariakoo Ward Clean-Up Drive',
    date: new Date(Date.now() + 7 * 864e5).toISOString(),
    location: 'Kariakoo Market, Dar es Salaam',
    description: 'Join Kijani Hub youth teams and volunteers for a community organic-waste collection and awareness day.',
    type: 'event',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-seed-2',
    title: 'KijaniSense v2 - new comparison dashboards',
    date: new Date().toISOString(),
    location: 'Platform-wide',
    description: 'Municipal managers can now compare their performance with other councils. More analytics coming soon.',
    type: 'update',
    createdAt: new Date().toISOString(),
  },
];

const SEED_FORUM: ForumPost[] = [
  {
    id: 'post-seed-1',
    author: 'Kijani Hub Admin',
    role: 'admin',
    title: 'Welcome to the Kijani Hub community forum',
    body: 'This is the space for councils, volunteers and partners to share ideas, ask questions, and get official updates. Please keep it respectful and on-topic. Karibuni!',
    pinned: true,
    createdAt: new Date().toISOString(),
    replies: [],
  },
  {
    id: 'post-seed-2',
    author: 'Green Youth Initiative',
    role: 'volunteer_group',
    title: 'Best practices for separating organic waste at source?',
    body: 'Our volunteers are starting collection in Ilala. Any tips from others on encouraging households to separate food waste?',
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    replies: [
      {
        id: 'r1', author: 'Kijani Hub Admin', role: 'admin',
        body: 'Great question! Colour-coded bins and a short demo at sign-up work well. We can supply printable guides.',
        createdAt: new Date(Date.now() - 1 * 864e5).toISOString(),
      },
    ],
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  // Load authentication state from localStorage
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('userRole');
    return (saved as UserRole) || 'admin';
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('isAuthenticated');
    return saved === 'true';
  });
  
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || 'User';
  });
  
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalWasteCollected: 0,
    fertilizerProduced: 0,
    householdsServed: 0,
    co2Reduced: 0,
    hygieneUsage: 0,
    activeDevices: 0,
    totalDevices: 0
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  // Update localStorage when userName changes
  useEffect(() => {
    const saved = localStorage.getItem('userName');
    if (saved) {
      setUserName(saved);
    }
  }, []);

  // Initialize devices and load from localStorage
  useEffect(() => {
    const savedDevices = localStorage.getItem('kijanisense-devices');
    if (savedDevices) {
      try {
        const parsed = JSON.parse(savedDevices);
        // Convert string dates back to Date objects
        const devicesWithDates = parsed.map((d: any) => ({
          ...d,
          lastUpdate: new Date(d.lastUpdate),
          data: {
            ...d.data,
            lastCollection: d.data.lastCollection ? new Date(d.data.lastCollection) : undefined
          }
        }));
        setDevices(devicesWithDates);
      } catch (e) {
        setDevices(generateMockDevices());
      }
    } else {
      setDevices(generateMockDevices());
    }
  }, []);

  // Save devices to localStorage
  useEffect(() => {
    if (devices.length > 0) {
      localStorage.setItem('kijanisense-devices', JSON.stringify(devices));
    }
  }, [devices]);

  // ─── Admin conversion factors (must be declared before the metrics useEffect) ───
  const [factors, setFactors] = useState<ConversionFactor[]>(DEFAULT_FACTORS);
  const [manualWasteKg, setManualWasteKgState] = useState<number | null>(null);
  // ─── Per-device waste throughput (admin-set) ───
  const [deviceThroughput, setDeviceThroughputState] = useState<DeviceThroughput>(DEFAULT_THROUGHPUT);

  // Generate notifications
  useEffect(() => {
    if (devices.length > 0) {
      setNotifications(generateNotifications(devices));
    }
  }, [devices]);

  // Calculate metrics — now driven by the editable conversion factors
  useEffect(() => {
    if (devices.length > 0) {
      setMetrics(calculateMetrics(devices, factorsToMap(factors), manualWasteKg, deviceThroughput));
    }
  }, [devices, factors, manualWasteKg, deviceThroughput]);

  // Simulate real-time IoT updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prevDevices => 
        prevDevices.map(device => {
          // Randomly update some values to simulate live data
          const updatedData = { ...device.data };
          
          // Helper: round to 1 decimal place so dashboards show clean values
          const r1 = (n: number) => Math.round(n * 10) / 10;

          if (device.type === 'waste_bin') {
            updatedData.fillLevel = Math.round(Math.min(100, device.data.fillLevel + Math.random() * 2));
            updatedData.temperature = r1(25 + Math.random() * 10);
          } else if (device.type === 'bsf_sensor') {
            updatedData.temperature = r1(28 + Math.random() * 8);
            updatedData.humidity = Math.round(60 + Math.random() * 15);
            updatedData.larvaeWeight = r1(Math.max(0, device.data.larvaeWeight + (Math.random() - 0.3) * 2));
          } else if (device.type === 'compost_monitor') {
            updatedData.temperature = r1(50 + Math.random() * 15);
            updatedData.moisture = Math.round(40 + Math.random() * 20);
          } else if (device.type === 'biogas_meter') {
            updatedData.gasProduction = r1(2 + Math.random() * 3);
            updatedData.energyGenerated = r1(device.data.energyGenerated + Math.random() * 0.5);
          } else if (device.type === 'wash_station') {
            updatedData.handwashCount += Math.floor(Math.random() * 3);
            updatedData.soapLevel = r1(Math.max(0, device.data.soapLevel - Math.random() * 0.5));
            updatedData.waterLevel = r1(Math.max(0, device.data.waterLevel - Math.random() * 0.3));
          }
          
          return {
            ...device,
            data: updatedData,
            lastUpdate: new Date(),
            status: updatedData.fillLevel > 90 || updatedData.soapLevel < 20 || updatedData.waterLevel < 30 
              ? 'warning' 
              : 'online'
          };
        })
      );
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Simulate syncing pending data
      if (pendingSync > 0) {
        setTimeout(() => setPendingSync(0), 2000);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSync]);

  const markNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };


  // ─── Network members — backed by Supabase ───
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(
    () => localStorage.getItem('kijani-current-member')
  );

  // Load all members from Supabase on mount, refresh every 60 s so new sign-ups appear
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchAllMembers();
        if (!cancelled) setMembers(data);
      } catch (e) {
        console.warn('Could not load members from Supabase:', e);
      }
    };
    load();
    const timer = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  const addMember = async (member: Member) => {
    try {
      await insertMember(member);
    } catch (e) {
      console.warn('Supabase insert failed, falling back to local:', e);
    }
    setMembers(prev => [...prev, member]);
    setCurrentMemberId(member.id);
    localStorage.setItem('kijani-current-member', member.id);
  };

  const updateMemberLocation = async (id: string, lat: number, lng: number) => {
    try {
      await patchMemberLocation(id, lat, lng);
    } catch (e) {
      console.warn('Supabase patch failed:', e);
    }
    setMembers(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, location: { ...m.location, lat, lng }, lastSeen: new Date().toISOString() }
          : m
      )
    );
  };

  // ─── Authentication: real Supabase accounts + demo accounts ───
  const [authMode, setAuthMode] = useState<'demo' | 'real' | null>(() => {
    const saved = localStorage.getItem('authMode');
    if (saved === 'demo' || saved === 'real') return saved;
    return localStorage.getItem('isAuthenticated') === 'true' ? 'demo' : null;
  });
  const [authLoading, setAuthLoading] = useState(true);

  const AUTH_KEYS = ['authMode', 'isAuthenticated', 'userRole', 'userName', 'kijani-current-member'];

  /** Apply a Supabase session: load the user's role (profiles) and their map pin */
  const applySession = async (session: Session | null) => {
    if (!session) {
      // Only clear state if the person was signed in with a real account
      if (localStorage.getItem('authMode') === 'real') {
        setIsAuthenticated(false);
        setAuthMode(null);
        setUserName('');
        setCurrentMemberId(null);
        AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
      }
      return;
    }
    const uid = session.user.id;
    const [{ data: profile }, { data: memberRow }] = await Promise.all([
      supabase.from('profiles').select('role, full_name').eq('id', uid).maybeSingle(),
      supabase.from('network_members').select('id, photo').eq('user_id', uid).maybeSingle(),
    ]);
    const role = ((profile?.role as UserRole) ?? 'volunteer');
    const name = profile?.full_name || session.user.email || 'Member';

    setUserRole(role);
    setUserName(name);
    setIsAuthenticated(true);
    setAuthMode('real');
    localStorage.setItem('authMode', 'real');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
    if (memberRow?.id) {
      setCurrentMemberId(memberRow.id);
      localStorage.setItem('kijani-current-member', memberRow.id);
    }

    // A profile photo chosen at sign-up is uploaded on the first real sign-in
    try {
      const pending = JSON.parse(localStorage.getItem('kijani-pending-photo') || 'null');
      if (
        pending?.photo && memberRow?.id && !memberRow.photo &&
        pending.email?.toLowerCase() === session.user.email?.toLowerCase()
      ) {
        await supabase.from('network_members').update({ photo: pending.photo }).eq('id', memberRow.id);
        localStorage.removeItem('kijani-pending-photo');
        fetchAllMembers().then(setMembers).catch(() => {});
      }
    } catch { /* photo upload is best-effort */ }
  };

  // Restore a saved session on load, and follow sign-in / sign-out events
  useEffect(() => {
    let active = true;
    supabase.auth.getSession()
      .then(({ data }) => applySession(data.session))
      .catch(() => { /* offline: keep current state */ })
      .finally(() => { if (active) setAuthLoading(false); });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Deferred, as Supabase recommends, so no other Supabase call runs inside this callback
      setTimeout(() => {
        if (event === 'SIGNED_OUT') applySession(null);
        else if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'PASSWORD_RECOVERY'].includes(event)) applySession(session);
      }, 0);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshSession = async () => {
    const { data } = await supabase.auth.getSession();
    await applySession(data.session);
  };

  const startDemoSession = (role: UserRole, name: string) => {
    setUserRole(role);
    setUserName(name);
    setIsAuthenticated(true);
    setAuthMode('demo');
    localStorage.setItem('authMode', 'demo');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
  };

  const logout = async () => {
    const wasReal = localStorage.getItem('authMode') === 'real';
    setIsAuthenticated(false);
    setUserName('');
    setAuthMode(null);
    setCurrentMemberId(null);
    AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
    if (wasReal) {
      try { await supabase.auth.signOut(); } catch { /* already signed out */ }
    }
  };

  // Load conversion engine data from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [loadedFactors, loadedThroughput, loadedWaste] = await Promise.all([
          fetchFactors(),
          fetchThroughput(),
          fetchManualWaste(),
        ]);
        if (!cancelled) {
          setFactors(loadedFactors);
          setDeviceThroughputState(loadedThroughput);
          setManualWasteKgState(loadedWaste);
        }
      } catch (e) {
        console.warn('Could not load conversion engine from Supabase:', e);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const updateFactor = (key: string, value: number) => {
    setFactors(prev => prev.map(f => (f.key === key ? { ...f, value } : f)));
    upsertFactor(key, value).catch(e => console.warn('upsertFactor failed:', e));
  };

  const resetFactors = () => {
    setFactors(DEFAULT_FACTORS);
    resetAllFactors().catch(e => console.warn('resetAllFactors failed:', e));
  };

  const setManualWasteKg = (kg: number | null) => {
    setManualWasteKgState(kg);
    upsertManualWaste(kg).catch(e => console.warn('upsertManualWaste failed:', e));
  };

  const setDeviceThroughput = (id: string, kg: number) => {
    setDeviceThroughputState(prev => ({ ...prev, [id]: kg }));
    upsertThroughput(id, kg).catch(e => console.warn('upsertThroughput failed:', e));
  };

  // ─── Community & commerce state (persisted to localStorage) ───
  const [events, setEvents] = useState<CommunityEvent[]>(() => {
    try {
      const s = localStorage.getItem('kijani-events');
      return s ? JSON.parse(s) : SEED_EVENTS;
    } catch { return SEED_EVENTS; }
  });
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(() => {
    try {
      const s = localStorage.getItem('kijani-forum');
      return s ? JSON.parse(s) : SEED_FORUM;
    } catch { return SEED_FORUM; }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const s = localStorage.getItem('kijani-orders');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('kijani-events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('kijani-forum', JSON.stringify(forumPosts)); }, [forumPosts]);
  useEffect(() => { localStorage.setItem('kijani-orders', JSON.stringify(orders)); }, [orders]);

  const addEvent = (e: CommunityEvent) => setEvents(prev => [e, ...prev]);
  const addForumPost = (p: ForumPost) => setForumPosts(prev => [p, ...prev]);
  const addForumReply = (postId: string, reply: ForumReply) =>
    setForumPosts(prev => prev.map(p => p.id === postId ? { ...p, replies: [...p.replies, reply] } : p));
  const placeOrder = (o: Order) => setOrders(prev => [o, ...prev]);

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        isAuthenticated,
        setIsAuthenticated,
        userName,
        devices,
        notifications,
        markNotificationRead,
        metrics,
        isOnline,
        pendingSync,
        logout,
        authMode,
        authLoading,
        refreshSession,
        startDemoSession,
        members,
        addMember,
        updateMemberLocation,
        currentMemberId,
        factors,
        updateFactor,
        resetFactors,
        manualWasteKg,
        setManualWasteKg,
        deviceThroughput,
        setDeviceThroughput,
        events,
        addEvent,
        forumPosts,
        addForumPost,
        addForumReply,
        orders,
        placeOrder
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/**
 * Custom hook to use the app context
 */
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
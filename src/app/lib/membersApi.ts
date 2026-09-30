import { supabase } from './supabase';
import type { Member } from '../context/AppContext';

/** Row shape in Supabase — flat, snake_case */
interface MemberRow {
  id: string;
  account_type: string;
  name: string;
  contact_person: string | null;
  email: string;
  phone: string;
  whatsapp: string | null;
  linkedin: string | null;
  photo: string | null;
  lat: number;
  lng: number;
  address: string;
  ward: string | null;
  created_at: string;
  last_seen: string;
}

function rowToMember(row: MemberRow): Member {
  return {
    id: row.id,
    accountType: row.account_type as Member['accountType'],
    name: row.name,
    contactPerson: row.contact_person ?? undefined,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp ?? undefined,
    linkedin: row.linkedin ?? undefined,
    photo: row.photo ?? undefined,
    location: {
      lat: row.lat,
      lng: row.lng,
      address: row.address,
      ward: row.ward ?? undefined,
    },
    createdAt: row.created_at,
    lastSeen: row.last_seen,
  };
}

function memberToRow(m: Member): Omit<MemberRow, never> {
  return {
    id: m.id,
    account_type: m.accountType,
    name: m.name,
    contact_person: m.contactPerson ?? null,
    email: m.email,
    phone: m.phone,
    whatsapp: m.whatsapp ?? null,
    linkedin: m.linkedin ?? null,
    photo: m.photo ?? null,
    lat: m.location.lat,
    lng: m.location.lng,
    address: m.location.address,
    ward: m.location.ward ?? null,
    created_at: m.createdAt,
    last_seen: m.lastSeen,
  };
}

export async function fetchAllMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('network_members')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as MemberRow[]).map(rowToMember);
}

export async function insertMember(member: Member): Promise<void> {
  const { error } = await supabase
    .from('network_members')
    .insert([memberToRow(member)]);
  if (error) throw new Error(error.message);
}

export async function patchMemberLocation(id: string, lat: number, lng: number): Promise<void> {
  const { error } = await supabase
    .from('network_members')
    .update({ lat, lng, last_seen: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

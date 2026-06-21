/**
 * db.js — Data Access Layer for Event Calendar
 *
 * All column-name mapping between the app's data model and the Supabase
 * schema is handled here so that page.js only deals with the app's shape.
 */

import { supabase } from './supabase';

const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_ID;

// ─────────────────────────────────────────────
//  EVENT DETAILS
// ─────────────────────────────────────────────

export async function fetchEventDetails() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', EVENT_ID)
    .single();
  if (error) throw new Error(error.message);
  return mapEventFromDb(data);
}

export async function updateEventDetails(details) {
  const { error } = await supabase
    .from('events')
    .update(mapEventToDb(details))
    .eq('id', EVENT_ID);
  if (error) throw new Error(error.message);
}

function mapEventFromDb(row) {
  return {
    title: row.name || '',
    location: row.location || '',
    type: row.type || 'Hybrid',
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    description: row.description || '',
    banner: row.banner || row.cover_url || '',
  };
}

function mapEventToDb(details) {
  return {
    name: details.title,
    location: details.location,
    type: details.type,
    start_date: details.startDate,
    end_date: details.endDate,
    description: details.description,
    banner: details.banner,
  };
}

// ─────────────────────────────────────────────
//  SESSIONS
// ─────────────────────────────────────────────

export async function fetchSessions() {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('start_time', { ascending: true });
  if (error) throw new Error(error.message);
  return data.map(mapSessionFromDb);
}

export async function upsertSession(session) {
  const row = mapSessionToDb(session);
  const { data, error } = await supabase
    .from('sessions')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapSessionFromDb(data);
}

export async function deleteSession(id) {
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function mapSessionFromDb(row) {
  return {
    id: row.id,
    title: row.title || '',
    date: row.date || '',
    startTime: row.start_time ? row.start_time.substring(11, 16) : '',
    endTime: row.end_time ? row.end_time.substring(11, 16) : '',
    description: row.description || '',
    speakers: row.speakers || [],
    moderators: row.moderators || [],
  };
}

function mapSessionToDb(session) {
  const dateStr = session.date || new Date().toISOString().split('T')[0];
  return {
    id: session.id,
    event_id: EVENT_ID,
    title: session.title,
    date: session.date,
    start_time: session.startTime ? `${dateStr}T${session.startTime}:00+00:00` : null,
    end_time: session.endTime ? `${dateStr}T${session.endTime}:00+00:00` : null,
    description: session.description,
    speakers: session.speakers || [],
    moderators: session.moderators || [],
  };
}

// ─────────────────────────────────────────────
//  ATTENDEES (participants)
// ─────────────────────────────────────────────

export async function fetchAttendees() {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('registered_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data.map(mapAttendeeFromDb);
}

export async function upsertAttendee(attendee) {
  const row = mapAttendeeToDb(attendee);
  const { data, error } = await supabase
    .from('participants')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapAttendeeFromDb(data);
}

export async function deleteAttendee(id) {
  const { error } = await supabase.from('participants').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function mapAttendeeFromDb(row) {
  return {
    id: row.id,
    name: `${row.first_name} ${row.last_name}`.trim(),
    email: row.email || '',
    ticketType: row.ticket_type || 'Standard Admission',
    status: row.status_participation || 'registered',
    registeredDate: row.registered_at ? row.registered_at.split('T')[0] : '',
    image: row.image || '',
    isSpeaker: !!row.is_speaker,
  };
}

function mapAttendeeToDb(attendee) {
  const nameParts = (attendee.name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  return {
    id: attendee.id,
    event_id: EVENT_ID,
    first_name: firstName,
    last_name: lastName,
    email: attendee.email,
    ticket_type: attendee.ticketType,
    status_participation: attendee.status,
    registered_at: attendee.registeredDate
      ? new Date(attendee.registeredDate).toISOString()
      : new Date().toISOString(),
    image: attendee.image || '',
    is_speaker: !!attendee.isSpeaker,
  };
}

// ─────────────────────────────────────────────
//  PENDING REGISTRATIONS
// ─────────────────────────────────────────────

export async function fetchPending() {
  const { data, error } = await supabase
    .from('pending_registrations')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data.map(mapPendingFromDb);
}

export async function upsertPending(item) {
  const row = {
    id: item.id,
    event_id: EVENT_ID,
    name: item.name,
    email: item.email,
    note: item.note || '',
    date: item.date || new Date().toISOString().split('T')[0],
  };
  const { data, error } = await supabase
    .from('pending_registrations')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapPendingFromDb(data);
}

export async function deletePending(id) {
  const { error } = await supabase.from('pending_registrations').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function mapPendingFromDb(row) {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email || '',
    note: row.note || '',
    date: row.date || '',
  };
}

// ─────────────────────────────────────────────
//  ORGANIZATIONS
// ─────────────────────────────────────────────

export async function fetchOrganizations() {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data.map(mapOrgFromDb);
}

export async function upsertOrganization(org) {
  const row = mapOrgToDb(org);
  const { data, error } = await supabase
    .from('organizations')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapOrgFromDb(data);
}

export async function deleteOrganization(id) {
  const { error } = await supabase.from('organizations').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function mapOrgFromDb(row) {
  return {
    id: row.id,
    name: row.name || '',
    industry: row.industry || row.type || '',
    contact: row.contact || '',
    website: row.website || '',
    logo: row.logo_url || '',
  };
}

function mapOrgToDb(org) {
  return {
    id: org.id,
    name: org.name,
    industry: org.industry,
    contact: org.contact,
    website: org.website,
    logo_url: org.logo || '',
  };
}

// ─────────────────────────────────────────────
//  SPONSORS
// ─────────────────────────────────────────────

export async function fetchSponsors() {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data.map(mapSponsorFromDb);
}

export async function upsertSponsor(sponsor) {
  const row = {
    id: sponsor.id,
    event_id: EVENT_ID,
    name: sponsor.name,
    tier: sponsor.tier,
    website: sponsor.website || '#',
    image_url: sponsor.image || '',
  };
  const { data, error } = await supabase
    .from('sponsors')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapSponsorFromDb(data);
}

export async function deleteSponsor(id) {
  const { error } = await supabase.from('sponsors').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function mapSponsorFromDb(row) {
  return {
    id: row.id,
    name: row.name || '',
    tier: row.tier || 'gold',
    website: row.website || '#',
    image: row.image_url || '',
  };
}

// ─────────────────────────────────────────────
//  EXHIBITORS
// ─────────────────────────────────────────────

export async function fetchExhibitors() {
  const { data, error } = await supabase
    .from('exhibitors')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data.map(mapExhibitorFromDb);
}

export async function upsertExhibitor(exhibitor) {
  const row = {
    id: exhibitor.id,
    event_id: EVENT_ID,
    org_id: exhibitor.org_id || null,
    name: exhibitor.name,
    logo_url: exhibitor.logo || '',
    contact: exhibitor.contact || '',
    booth: exhibitor.booth || 'Not Assigned',
    email: exhibitor.email || '',
  };
  const { data, error } = await supabase
    .from('exhibitors')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapExhibitorFromDb(data);
}

export async function deleteExhibitor(id) {
  const { error } = await supabase.from('exhibitors').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function mapExhibitorFromDb(row) {
  return {
    id: row.id,
    name: row.name || '',
    logo: row.logo_url || '',
    contact: row.contact || '',
    booth: row.booth || 'Not Assigned',
    org_id: row.org_id || null,
    email: row.email || '',
  };
}

// ─────────────────────────────────────────────
//  TICKETS
// ─────────────────────────────────────────────

export async function fetchTickets() {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data.map(mapTicketFromDb);
}

export async function upsertTicket(ticket) {
  const row = {
    id: ticket.id,
    event_id: EVENT_ID,
    name: ticket.name,
    price: ticket.price,
    quantity_available: ticket.maxQty,
    features: ticket.features || [],
  };
  const { data, error } = await supabase
    .from('tickets')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapTicketFromDb(data);
}

export async function deleteTicket(id) {
  const { error } = await supabase.from('tickets').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function mapTicketFromDb(row) {
  return {
    id: row.id,
    name: row.name || '',
    price: Number(row.price) || 0,
    maxQty: row.quantity_available || 100,
    features: row.features || [],
  };
}

// ─────────────────────────────────────────────
//  TEAM MEMBERS
// ─────────────────────────────────────────────

export async function fetchTeam() {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data.map(mapTeamFromDb);
}

export async function upsertTeamMember(member) {
  const row = {
    id: member.id,
    event_id: EVENT_ID,
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status || 'Active',
  };
  const { data, error } = await supabase
    .from('team_members')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapTeamFromDb(data);
}

export async function deleteTeamMember(id) {
  const { error } = await supabase.from('team_members').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function mapTeamFromDb(row) {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email || '',
    role: row.role || 'Staff',
    status: row.status || 'Active',
  };
}

// ─────────────────────────────────────────────
//  FLOOR PLANS
// ─────────────────────────────────────────────

export async function fetchFloorPlans() {
  const { data, error } = await supabase
    .from('floor_plans')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data.map(mapFloorPlanFromDb);
}

export async function upsertFloorPlan(plan) {
  // Sync the first floor to top-level elements and blueprint columns for backward compatibility
  const firstFloor = plan.floors && plan.floors.length > 0 
    ? plan.floors[0] 
    : { elements: plan.elements || [], blueprint: plan.blueprint || {} };

  const row = {
    id: plan.id,
    event_id: EVENT_ID,
    name: plan.name,
    elements: firstFloor.elements || [],
    blueprint: firstFloor.blueprint || {},
    font_family: plan.fontFamily || 'Inter',
    floors: plan.floors || [],
  };
  const { data, error } = await supabase
    .from('floor_plans')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapFloorPlanFromDb(data);
}

export async function deleteFloorPlan(id) {
  const { error } = await supabase.from('floor_plans').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function mapFloorPlanFromDb(row) {
  const elements = row.elements || [];
  const blueprint = row.blueprint || {
    url: '', name: 'Venue Blueprint', opacity: 0.8,
    x: 0, y: 0, width: 800, height: 600, rotation: 0, isLocked: false,
  };
  
  let rawFloors = row.floors;
  if (typeof rawFloors === 'string') {
    try {
      rawFloors = JSON.parse(rawFloors);
    } catch (e) {
      rawFloors = null;
    }
  }

  // Build floors array for backward compatibility
  const floors = rawFloors && Array.isArray(rawFloors) && rawFloors.length > 0 ? rawFloors : [
    {
      id: 'default-floor-id',
      name: row.name || 'Ground Floor',
      elements: elements,
      blueprint: blueprint,
    }
  ];

  return {
    id: row.id,
    name: row.name || 'Unnamed Plan',
    createdAt: row.created_at,
    elements: elements,
    blueprint: blueprint,
    fontFamily: row.font_family || 'Inter',
    floors: floors,
  };
}

export async function uploadFileToBucket(file, bucket = 'floor-plans') {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${EVENT_ID}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw new Error(error.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function logCommunication({ subject, body, recipientCount }) {
  const row = {
    event_id: EVENT_ID,
    subject: subject,
    body: body,
    recipient_count: recipientCount,
    status: 'Sent',
    sent_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('communications')
    .insert(row)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchCommunications() {
  const { data, error } = await supabase
    .from('communications')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('sent_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}



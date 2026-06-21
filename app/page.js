"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Users, CheckCircle2, Ticket, ShieldAlert, Building2, 
  Award, Briefcase, Mic, ChevronDown, LayoutDashboard, Calendar, 
  MapPin, Users2, BarChart3, Plus, X, Globe, Map, Sparkles, Upload, Image, Mail
} from "lucide-react";

import Overview from "../components/Overview";
import CalendarView from "../components/CalendarView";
import FloorPlanModifier from "../components/FloorPlanModifier";
import FloorPlanGallery from "../components/FloorPlanGallery";
import GenericTableView from "../components/GenericTableView";

import LivePageBuilder from "../components/LivePageBuilder";

import {
  fetchEventDetails, updateEventDetails,
  fetchSessions, upsertSession, deleteSession,
  fetchAttendees, upsertAttendee, deleteAttendee,
  fetchPending, upsertPending, deletePending,
  fetchOrganizations, upsertOrganization, deleteOrganization,
  fetchSponsors, upsertSponsor, deleteSponsor,
  fetchExhibitors, upsertExhibitor, deleteExhibitor,
  fetchTickets, upsertTicket, deleteTicket,
  fetchTeam, upsertTeamMember, deleteTeamMember,
  fetchFloorPlans, upsertFloorPlan, deleteFloorPlan,
  uploadFileToBucket,
} from "../lib/db";

const INDUSTRIES = [
  "Energy & Hydrocarbons",
  "Technology & Software",
  "Finance & Banking",
  "Healthcare & Pharmaceuticals",
  "Education & Academia",
  "Manufacturing & Heavy Industry",
  "Transportation & Logistics",
  "Real Estate & Construction",
  "Retail & E-commerce",
  "Media & Entertainment",
  "Agriculture & Food Production",
  "Government & Public Sector",
  "Non-Profit & NGOs",
  "Hospitality & Tourism",
  "Aerospace & Defense",
  "Automotive & Mobility",
  "Telecommunications",
  "Chemicals & Materials",
  "Environmental & Sustainability Services",
  "Consulting & Professional Services"
];

// ==========================================================================
// DEFAULT MOCK DATABASE SEEDING
// ==========================================================================
const defaultEventDetails = {
  title: "Algeria Hydrogen Law Conference 2026",
  location: "Algiers International Conference Center & Online",
  type: "Hybrid",
  startDate: "2026-10-12",
  endDate: "2026-10-18",
  description: "The premiere global forum covering the legal, regulatory, and financial frameworks for the developing green hydrogen sector in North Africa.",
  banner: ""
};

const defaultSessions = [
  {
    id: 1,
    title: "Opening Ceremony & Ministerial Keynote",
    date: "2026-10-12",
    startTime: "09:00",
    endTime: "10:30",
    description: "Welcoming remarks and keynote speeches by the Ministry of Energy and Mines, outlining Algeria's strategic legal pathway for green hydrogen exportation to Europe.",
    speakers: [
      { id: 101, name: "Mohamed Arkab", image: "https://ui-avatars.com/api/?name=Mohamed+Arkab&background=0b5cdb&color=fff" }
    ],
    moderators: [
      { id: 201, name: "Dr. Amel Bouraoui", image: "https://ui-avatars.com/api/?name=Amel+Bouraoui&background=64748b&color=fff" }
    ]
  },
  {
    id: 2,
    title: "Regulatory Frameworks for Trans-Mediterranean Pipelines",
    date: "2026-10-12",
    startTime: "11:00",
    endTime: "12:30",
    description: "A panel debating the harmonization of technical codes and safety regulations for transporting gaseous hydrogen blends through the SoutH2 Corridor infrastructure.",
    speakers: [
      { id: 102, name: "Jean-Marc Lhomme", image: "https://ui-avatars.com/api/?name=Jean-Marc+Lhomme&background=0b5cdb&color=fff" },
      { id: 103, name: "Noureddine Yassaa", image: "https://ui-avatars.com/api/?name=Noureddine+Yassaa&background=0b5cdb&color=fff" }
    ],
    moderators: []
  },
  {
    id: 3,
    title: "Financing Large-Scale Clean Hydrogen Projects in North Africa",
    date: "2026-10-13",
    startTime: "14:00",
    endTime: "15:30",
    description: "Insights from the African Development Bank, IMF, and private equity heads on risk mitigation, sovereign guarantees, and project financing contracts.",
    speakers: [
      { id: 104, name: "Fatima Al-Mansoori", image: "https://ui-avatars.com/api/?name=Fatima+Al-Mansoori&background=0b5cdb&color=fff" }
    ],
    moderators: [
      { id: 202, name: "Christian Vance", image: "https://ui-avatars.com/api/?name=Christian+Vance&background=64748b&color=fff" }
    ]
  }
];

const defaultAttendees = [
  { id: 1, name: "Sofiane Merabet", email: "s.merabet@sonatrach.dz", ticketType: "VIP Access Pass", status: "checked-in", registeredDate: "2026-09-15" },
  { id: 2, name: "Elena Rostova", email: "e.rostova@hydrogeneurope.eu", ticketType: "VIP Access Pass", status: "registered", registeredDate: "2026-09-18" },
  { id: 3, name: "Marcus Aurel", email: "m.aurel@deutschgas.de", ticketType: "Standard Admission", status: "checked-in", registeredDate: "2026-09-20" },
  { id: 4, name: "Amine Zerrouki", email: "a.zerrouki@univ-alger.dz", ticketType: "Online Only", status: "registered", registeredDate: "2026-09-24" }
];

const defaultPending = [
  { id: 1, name: "Karim Benchikh", email: "k.benchikh@algeriapower.com", note: "Interested in the pipeline legal regulatory panels.", date: "2026-10-01" },
  { id: 2, name: "Sophia Martinez", email: "s.martinez@h2invest.com", note: "Investor wishing to schedule meetings with officials.", date: "2026-10-03" }
];

const defaultOrganizations = [
  { id: 1, name: "Sonatrach", industry: "Energy & Hydrocarbons", contact: "Lamine O.", website: "https://www.sonatrach.com" },
  { id: 2, name: "Sonelgaz", industry: "Power Generation & Grid", contact: "Yassine A.", website: "https://www.sonelgaz.dz" },
  { id: 3, name: "Hydrogen Europe", industry: "Trade Association", contact: "Valerie D.", website: "https://www.hydrogeneurope.eu" }
];

const defaultSponsors = [
  { id: 1, name: "Sonatrach", tier: "diamond", website: "https://www.sonatrach.com", image: "" },
  { id: 2, name: "Deutsche Bank", tier: "gold", website: "https://www.db.com", image: "" },
  { id: 3, name: "Air Liquide", tier: "silver", website: "https://www.airliquide.com", image: "" }
];

const defaultExhibitors = [
  { id: 1, name: "Hydrogen Systems Corp", booth: "B1", contact: "Tariq S." },
  { id: 2, name: "Snam SpA", booth: "A1", contact: "Giuseppe M." }
];

const defaultTickets = [
  { id: 1, name: "Standard Admission", price: 150, maxQty: 200, features: ["Access to all days", "Access to exhibition halls", "Standard lunch", "Presentation materials"] },
  { id: 2, name: "VIP Access Pass", price: 350, maxQty: 50, features: ["Access to all days", "Front-row auditorium seating", "Ministerial networking lunch", "VIP lounge access", "All session video recordings"] },
  { id: 3, name: "Online Only", price: 50, maxQty: 500, features: ["Access to live webinar stream", "Submit questions online", "Digital presentation materials"] }
];

const defaultTeam = [
  { id: 1, name: "Dr. Amel Bouraoui", role: "Admin", email: "a.bouraoui@eventzone.com", status: "Active" },
  { id: 2, name: "Yasmin Cherif", role: "Editor", email: "y.cherif@eventzone.com", status: "Active" },
  { id: 3, name: "Rafik Khelil", role: "Staff", email: "r.khelil@eventzone.com", status: "Active" }
];

const defaultFloorPlans = [
  {
    id: "fp_default",
    name: "Main Exhibition Hall",
    createdAt: new Date().toISOString(),
    elements: [
      { id: "A1", type: "booth-empty", x: 80, y: 80, width: 80, height: 80, rotation: 0, label: "Booth A1", status: "reserved", exhibitorId: 2 },
      { id: "A3", type: "booth-empty", x: 240, y: 80, width: 80, height: 80, rotation: 0, label: "Booth A3", status: "available", exhibitorId: null },
      { id: "B1", type: "booth-semi", x: 80, y: 200, width: 80, height: 80, rotation: 0, label: "Booth B1", status: "sold", exhibitorId: 1 },
      { id: "C3", type: "booth-equipped", x: 240, y: 320, width: 100, height: 100, rotation: 0, label: "VIP C3", status: "available", exhibitorId: null },
      { id: "C5", type: "booth-equipped", x: 440, y: 320, width: 100, height: 100, rotation: 0, label: "VIP C5", status: "available", exhibitorId: null },
      { id: "stage-1", type: "stage", x: 600, y: 120, width: 200, height: 100, rotation: 0, label: "Main Stage", status: "available", exhibitorId: null },
      { id: "catering-1", type: "utility-catering", x: 600, y: 320, width: 120, height: 80, rotation: 0, label: "Catering Zone", status: "available", exhibitorId: null }
    ],
    blueprint: { url: "", name: "Venue Blueprint", opacity: 0.8, x: 0, y: 0, width: 800, height: 600, rotation: 0, isLocked: false }
  }
];

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("overview");
  const [participantsOpen, setParticipantsOpen] = useState(true);

  // Core databases state
  const [eventDetails, setEventDetails] = useState(defaultEventDetails);
  const [sessions, setSessions] = useState(defaultSessions);
  const [attendees, setAttendees] = useState(defaultAttendees);
  const [pending, setPending] = useState(defaultPending);
  const [organizations, setOrganizations] = useState(defaultOrganizations);
  const [sponsors, setSponsors] = useState(defaultSponsors);
  const [exhibitors, setExhibitors] = useState(defaultExhibitors);
  const [tickets, setTickets] = useState(defaultTickets);
  const [team, setTeam] = useState(defaultTeam);
  const [floorPlans, setFloorPlans] = useState(defaultFloorPlans);
  const [activeFloorPlanId, setActiveFloorPlanId] = useState(null); // null = gallery
  const [saveStatus, setSaveStatus] = useState("saved"); // "saved", "saving", "error"
  const [initialPreviewMode, setInitialPreviewMode] = useState(false);
  const isInitializedRef = useRef(false);

  // Modal Manager state
  const [activeModalType, setActiveModalType] = useState(null); // 'attendee', 'org', 'sponsor', 'exhibitor', 'ticket', 'team'
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalTicket, setModalTicket] = useState("Standard Admission");
  const [modalSector, setModalSector] = useState("");
  const [modalContact, setModalContact] = useState("");
  const [modalWebsite, setModalWebsite] = useState("");
  const [modalTier, setModalTier] = useState("diamond");
  const [modalBooth, setModalBooth] = useState("");
  const [modalPrice, setModalPrice] = useState("");
  const [modalMax, setModalMax] = useState("");
  const [modalFeatures, setModalFeatures] = useState("");
  const [modalRole, setModalRole] = useState("Admin");
  const [modalLogo, setModalLogo] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [modalOrgId, setModalOrgId] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false);

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const publicUrl = await uploadFileToBucket(file, 'floor-plans');
      if (publicUrl) setModalLogo(publicUrl);
    } catch (err) {
      console.error("Failed to upload logo:", err);
      alert("Failed to upload image to Supabase Storage");
    }
  };

  // Load all data from Supabase on mount
  useEffect(() => {
    setIsClient(true);

    const loadAll = async () => {
      try {
        const results = await Promise.allSettled([
          fetchEventDetails(),
          fetchSessions(),
          fetchAttendees(),
          fetchPending(),
          fetchOrganizations(),
          fetchSponsors(),
          fetchExhibitors(),
          fetchTickets(),
          fetchTeam(),
          fetchFloorPlans(),
        ]);

        const [
          eventResult, sessionsResult, attendeesResult, pendingResult,
          orgsResult, sponsorsResult, exhibitorsResult, ticketsResult,
          teamResult, floorPlansResult
        ] = results;

        if (eventResult.status === "fulfilled") setEventDetails(eventResult.value);
        else console.error("Failed to load event details:", eventResult.reason);

        if (sessionsResult.status === "fulfilled") setSessions(sessionsResult.value);
        else console.error("Failed to load sessions:", sessionsResult.reason);

        if (attendeesResult.status === "fulfilled") setAttendees(attendeesResult.value);
        else console.error("Failed to load attendees:", attendeesResult.reason);

        if (pendingResult.status === "fulfilled") setPending(pendingResult.value);
        else console.error("Failed to load pending:", pendingResult.reason);

        if (orgsResult.status === "fulfilled") setOrganizations(orgsResult.value);
        else console.error("Failed to load organizations:", orgsResult.reason);

        if (sponsorsResult.status === "fulfilled") setSponsors(sponsorsResult.value);
        else console.error("Failed to load sponsors:", sponsorsResult.reason);

        if (exhibitorsResult.status === "fulfilled") setExhibitors(exhibitorsResult.value);
        else console.error("Failed to load exhibitors:", exhibitorsResult.reason);

        if (ticketsResult.status === "fulfilled") setTickets(ticketsResult.value);
        else console.error("Failed to load tickets:", ticketsResult.reason);

        if (teamResult.status === "fulfilled") setTeam(teamResult.value);
        else console.error("Failed to load team:", teamResult.reason);

        if (floorPlansResult.status === "fulfilled") setFloorPlans(floorPlansResult.value);
        else console.error("Failed to load floor plans:", floorPlansResult.reason);

      } catch (err) {
        console.error("Unexpected error loading data from Supabase:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, []);

  // Synchronize state variables to URL query parameters
  useEffect(() => {
    if (isLoading || typeof window === "undefined" || !isInitializedRef.current) return;

    const params = new URLSearchParams();
    if (currentView !== "overview") {
      params.set("view", currentView);
    }
    if (currentView === "floor-plan" && activeFloorPlanId) {
      params.set("planId", activeFloorPlanId);
      if (initialPreviewMode) {
        params.set("preview", "true");
      }
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : "/";

    if (window.location.search !== `?${queryString}` && (window.location.search !== "" || queryString !== "")) {
      window.history.pushState({}, "", newUrl);
    }
  }, [currentView, activeFloorPlanId, initialPreviewMode, isLoading]);

  // Parse URL query parameters to set initial state on load
  useEffect(() => {
    if (!isLoading && typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const viewParam = searchParams.get("view");
      const planIdParam = searchParams.get("planId");
      const previewParam = searchParams.get("preview");
      
      if (viewParam) {
        if (viewParam === "floor-plan") {
          setCurrentView("floor-plan");
          if (planIdParam) {
            const planExists = floorPlans.some(p => p.id === planIdParam || String(p.id) === String(planIdParam));
            if (planExists) {
              setActiveFloorPlanId(planIdParam);
              if (previewParam === "true") {
                setInitialPreviewMode(true);
              }
            } else {
              setActiveFloorPlanId(null);
            }
          } else {
            setActiveFloorPlanId(null);
          }
        } else {
          const validViews = [
            "overview", "page-builder", "calendar", "event-details", 
            "attendees", "pending", "organizations", "sponsors", 
            "exhibitors", "speakers", "tickets", "check-in", 
            "my-team", "analytics", "communications"
          ];
          if (validViews.includes(viewParam)) {
            setCurrentView(viewParam);
          }
        }
      }
      isInitializedRef.current = true;
    }
  }, [isLoading, floorPlans]);

  // Listen to popstate event (browser back/forward button clicks) for complete history sync
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const viewParam = searchParams.get("view") || "overview";
      const planIdParam = searchParams.get("planId");
      const previewParam = searchParams.get("preview");

      setCurrentView(viewParam);
      if (viewParam === "floor-plan") {
        setActiveFloorPlanId(planIdParam);
        setInitialPreviewMode(previewParam === "true");
      } else {
        setActiveFloorPlanId(null);
        setInitialPreviewMode(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // ── Floor Plan management handlers ──────────────────────────────────────
  const handleCreateFloorPlan = async () => {
    const newPlanData = {
      name: `Floor Plan ${floorPlans.length + 1}`,
      elements: [],
      blueprint: { url: "", name: "Venue Blueprint", opacity: 0.8, x: 0, y: 0, width: 800, height: 600, rotation: 0, isLocked: false }
    };
    try {
      const savedPlan = await upsertFloorPlan(newPlanData);
      setFloorPlans(prev => [...prev, savedPlan]);
      setActiveFloorPlanId(savedPlan.id);
    } catch (err) {
      console.error("Failed to create floor plan:", err);
    }
  };

  const handleDuplicateFloorPlan = async (id) => {
    const source = floorPlans.find(p => p.id === id);
    if (!source) return;

    const elementsCopy = (source.elements || []).map(el => {
      const newId = `el_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const newChildren = el.children ? el.children.map(child => {
        const idx = child.id.indexOf('_seat_');
        const seatSuffix = idx !== -1 ? child.id.substring(idx + 6) : `${Math.random().toString(36).substr(2, 4)}`;
        return {
          ...child,
          id: `${newId}_seat_${seatSuffix}`
        };
      }) : null;
      return {
        ...el,
        id: newId,
        children: newChildren
      };
    });

    const copyData = {
      name: `${source.name} (Copy)`,
      elements: elementsCopy,
      blueprint: JSON.parse(JSON.stringify(source.blueprint)),
      fontFamily: source.fontFamily,
    };
    try {
      const savedCopy = await upsertFloorPlan(copyData);
      setFloorPlans(prev => [...prev, savedCopy]);
    } catch (err) {
      console.error("Failed to duplicate floor plan:", err);
    }
  };

  const handleDeleteFloorPlan = (id) => {
    setFloorPlans(prev => prev.filter(p => p.id !== id));
    if (activeFloorPlanId === id) setActiveFloorPlanId(null);
    deleteFloorPlan(id).catch(console.error);
  };

  const saveFloorPlanWithStatus = async (plan) => {
    setSaveStatus("saving");
    try {
      await upsertFloorPlan(plan);
      setSaveStatus("saved");
    } catch (err) {
      console.error("Failed to save floor plan:", err);
      setSaveStatus("error");
    }
  };

  const handleRenameFloorPlan = (id, newName) => {
    setFloorPlans(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, name: newName } : p);
      const merged = updated.find(p => p.id === id);
      if (merged) saveFloorPlanWithStatus(merged);
      return updated;
    });
  };

  const handleSaveFloorPlanElements = (id, elements) => {
    const updatedFloorPlans = floorPlans.map(p => p.id === id ? { ...p, elements } : p);
    setFloorPlans(updatedFloorPlans);
    const savedPlan = updatedFloorPlans.find(p => p.id === id);
    if (savedPlan) saveFloorPlanWithStatus(savedPlan);

    // Sync exhibitor booth labels globally
    setExhibitors(prevExhibitors => {
      return prevExhibitors.map(ex => {
        let assignedBoothLabel = "";
        for (const plan of updatedFloorPlans) {
          const matchedElement = (plan.elements || []).find(el => String(el.exhibitorId) === String(ex.id));
          if (matchedElement) {
            assignedBoothLabel = matchedElement.label || `Booth ${matchedElement.id}`;
            break;
          }
        }
        return {
          ...ex,
          booth: assignedBoothLabel || "Not Assigned"
        };
      });
    });
  };

  const handleSaveFloorPlanFloors = (id, floors) => {
    const firstFloor = floors[0] || { elements: [], blueprint: {} };
    const updatedFloorPlans = floorPlans.map(p => p.id === id ? { 
      ...p, 
      floors,
      elements: firstFloor.elements || [],
      blueprint: firstFloor.blueprint || {}
    } : p);
    
    setFloorPlans(updatedFloorPlans);
    const savedPlan = updatedFloorPlans.find(p => p.id === id);
    if (savedPlan) saveFloorPlanWithStatus(savedPlan);

    // Sync exhibitor booth labels globally across all floors of all plans
    setExhibitors(prevExhibitors => {
      return prevExhibitors.map(ex => {
        let assignedBoothLabel = "";
        for (const plan of updatedFloorPlans) {
          if (plan.floors && plan.floors.length > 0) {
            for (const floor of plan.floors) {
              const matchedElement = (floor.elements || []).find(el => String(el.exhibitorId) === String(ex.id));
              if (matchedElement) {
                assignedBoothLabel = matchedElement.label || `Booth ${matchedElement.id}`;
                break;
              }
            }
          } else {
            const matchedElement = (plan.elements || []).find(el => String(el.exhibitorId) === String(ex.id));
            if (matchedElement) {
              assignedBoothLabel = matchedElement.label || `Booth ${matchedElement.id}`;
            }
          }
          if (assignedBoothLabel) break;
        }
        return {
          ...ex,
          booth: assignedBoothLabel || "Not Assigned"
        };
      });
    });
  };

  const handleSaveFloorPlanBlueprint = (id, blueprintState) => {
    setFloorPlans(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, blueprint: blueprintState } : p);
      const merged = updated.find(p => p.id === id);
      if (merged) saveFloorPlanWithStatus(merged);
      return updated;
    });
  };

  const handleSaveFloorPlanFontFamily = (id, fontFamily) => {
    setFloorPlans(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, fontFamily } : p);
      const merged = updated.find(p => p.id === id);
      if (merged) saveFloorPlanWithStatus(merged);
      return updated;
    });
  };

  const activePlan = floorPlans.find(p => p.id === activeFloorPlanId) ?? null;

  // Diff old/new arrays and sync deletes + upserts to Supabase
  const syncArrayToDb = (oldArr, newArr, upsertFn, deleteFn) => {
    const newIds = new Set(newArr.map(i => String(i.id)));
    const ops = [];
    for (const item of oldArr) {
      if (!newIds.has(String(item.id))) {
        ops.push(deleteFn(item.id).catch(e => console.error('Delete failed:', e)));
      }
    }
    for (const item of newArr) {
      const oldItem = oldArr.find(i => String(i.id) === String(item.id));
      if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(item)) {
        ops.push(upsertFn(item).catch(e => console.error('Upsert failed:', e)));
      }
    }
    Promise.all(ops);
  };

  // Handle generic view state update callback
  const handleUpdateState = (key, val) => {
    switch (key) {
      case "eventDetails":
        setEventDetails(val);
        updateEventDetails(val).catch(console.error);
        break;
      case "sessions":
        syncArrayToDb(sessions, val, upsertSession, deleteSession);
        setSessions(val);
        break;
      case "attendees":
        syncArrayToDb(attendees, val, upsertAttendee, deleteAttendee);
        setAttendees(val);
        break;
      case "pending":
        syncArrayToDb(pending, val, upsertPending, deletePending);
        setPending(val);
        break;
      case "organizations":
        syncArrayToDb(organizations, val, upsertOrganization, deleteOrganization);
        setOrganizations(val);
        break;
      case "sponsors":
        syncArrayToDb(sponsors, val, upsertSponsor, deleteSponsor);
        setSponsors(val);
        break;
      case "exhibitors":
        syncArrayToDb(exhibitors, val, upsertExhibitor, deleteExhibitor);
        setExhibitors(val);
        break;
      case "tickets":
        syncArrayToDb(tickets, val, upsertTicket, deleteTicket);
        setTickets(val);
        break;
      case "team":
        syncArrayToDb(team, val, upsertTeamMember, deleteTeamMember);
        setTeam(val);
        break;
      case "floorPlans":
        syncArrayToDb(floorPlans, val, upsertFloorPlan, deleteFloorPlan);
        setFloorPlans(val);
        break;
    }
  };

  // Speaker and moderator directory size calculation
  const getUniqueSpeakersCount = () => {
    const seen = new Set();
    sessions.forEach(s => {
      s.speakers.forEach(sp => seen.add(sp.name));
      s.moderators.forEach(mo => seen.add(mo.name));
    });
    return seen.size;
  };

  // Modals Save submission handler
  const handleModalSubmit = async (e) => {
    e.preventDefault();

    if (editingItem) {
      // EDIT MODE — optimistic local update + async Supabase sync
      switch (activeModalType) {
        case "attendee": {
          const updated = { ...editingItem, name: modalName, email: modalEmail, ticketType: modalTicket, image: modalLogo };
          setAttendees(attendees.map(a => a.id === editingItem.id ? updated : a));
          upsertAttendee(updated).catch(console.error);
          break;
        }
        case "org": {
          const updated = { ...editingItem, name: modalName, industry: modalSector, contact: modalContact, website: modalWebsite || "https://", logo: modalLogo };
          setOrganizations(organizations.map(o => o.id === editingItem.id ? updated : o));
          upsertOrganization(updated).catch(console.error);
          break;
        }
        case "sponsor": {
          const updated = { ...editingItem, name: modalName, tier: modalTier, website: modalWebsite || "#", image: modalLogo || "" };
          setSponsors(sponsors.map(s => s.id === editingItem.id ? updated : s));
          upsertSponsor(updated).catch(console.error);
          break;
        }
        case "exhibitor": {
          const editOrg = organizations.find(o => String(o.id) === String(modalOrgId));
          if (editOrg) {
            const updated = { ...editingItem, name: editOrg.name, logo: editOrg.logo || "", contact: editOrg.contact || "", email: modalEmail, org_id: editOrg.id };
            setExhibitors(exhibitors.map(ex => ex.id === editingItem.id ? updated : ex));
            upsertExhibitor(updated).catch(console.error);
          }
          break;
        }
        case "ticket": {
          const updated = { ...editingItem, name: modalName, price: parseInt(modalPrice) || 0, maxQty: parseInt(modalMax) || 100, features: modalFeatures.split(",").map(f => f.trim()) };
          setTickets(tickets.map(t => t.id === editingItem.id ? updated : t));
          upsertTicket(updated).catch(console.error);
          break;
        }
        case "team": {
          const updated = { ...editingItem, name: modalName, email: modalEmail, role: modalRole };
          setTeam(team.map(tm => tm.id === editingItem.id ? updated : tm));
          upsertTeamMember(updated).catch(console.error);
          break;
        }
      }
    } else {
      // CREATE MODE — insert to Supabase first to get UUID, then update local state
      try {
        switch (activeModalType) {
          case "attendee": {
            const saved = await upsertAttendee({
              name: modalName, email: modalEmail, ticketType: modalTicket, image: modalLogo,
              status: "registered", registeredDate: new Date().toISOString().split("T")[0],
            });
            setAttendees(prev => [...prev, saved]);
            break;
          }
          case "org": {
            const saved = await upsertOrganization({
              name: modalName, industry: modalSector, contact: modalContact,
              website: modalWebsite || "https://", logo: modalLogo,
            });
            setOrganizations(prev => [...prev, saved]);
            break;
          }
          case "sponsor": {
            const saved = await upsertSponsor({
              name: modalName, tier: modalTier,
              website: modalWebsite || "#", image: modalLogo || "",
            });
            setSponsors(prev => [...prev, saved]);
            break;
          }
          case "exhibitor": {
            const org = organizations.find(o => String(o.id) === String(modalOrgId));
            if (org) {
              const saved = await upsertExhibitor({
                org_id: org.id, name: org.name,
                logo: org.logo || "", contact: org.contact || "", booth: "Not Assigned",
                email: modalEmail,
              });
              setExhibitors(prev => [...prev, saved]);
            }
            break;
          }
          case "ticket": {
            const saved = await upsertTicket({
              name: modalName, price: parseInt(modalPrice) || 0,
              maxQty: parseInt(modalMax) || 100,
              features: modalFeatures.split(",").map(f => f.trim()),
            });
            setTickets(prev => [...prev, saved]);
            break;
          }
          case "team": {
            const saved = await upsertTeamMember({
              name: modalName, email: modalEmail, role: modalRole, status: "Pending Invite",
            });
            setTeam(prev => [...prev, saved]);
            break;
          }
        }
      } catch (err) {
        console.error("Failed to save record to Supabase:", err);
      }
    }

    closeModal();
  };

  const closeModal = () => {
    setActiveModalType(null);
    setEditingItem(null);
    setModalName("");
    setModalEmail("");
    setModalSector("");
    setModalContact("");
    setModalWebsite("");
    setModalBooth("");
    setModalPrice("");
    setModalMax("");
    setModalFeatures("");
    setModalLogo("");
    setModalOrgId("");
    setIndustrySearch("");
    setIndustryDropdownOpen(false);
  };

  const handleOpenModal = (type, item = null) => {
    setActiveModalType(type);
    if (item) {
      setEditingItem(item);
      setModalName(item.name || "");
      if (type === "attendee") {
        setModalEmail(item.email || "");
        setModalTicket(item.ticketType || "Standard Admission");
        setModalLogo(item.image || "");
      } else if (type === "org") {
        setModalSector(item.industry || "");
        setIndustrySearch(item.industry || "");
        setModalContact(item.contact || "");
        setModalWebsite(item.website || "");
        setModalLogo(item.logo || "");
      } else if (type === "sponsor") {
        setModalTier(item.tier || "diamond");
        setModalWebsite(item.website || "");
        setModalLogo(item.image || "");
      } else if (type === "exhibitor") {
        setModalOrgId(String(item.org_id || ""));
        setModalEmail(item.email || "");
      } else if (type === "ticket") {
        setModalPrice(String(item.price || 0));
        setModalMax(String(item.maxQty || 100));
        setModalFeatures(item.features ? item.features.join(", ") : "");
      } else if (type === "team") {
        setModalEmail(item.email || "");
        setModalRole(item.role || "Admin");
      }
    } else {
      setEditingItem(null);
      setModalName("");
      setModalEmail("");
      setModalSector("");
      setModalContact("");
      setModalWebsite("");
      setModalBooth("");
      setModalPrice("");
      setModalMax("");
      setModalFeatures("");
      setModalLogo("");
      setModalOrgId("");
      setIndustrySearch("");
      setIndustryDropdownOpen(false);
    }
  };

  // Render the modal inputs dynamically
  const renderModalFormContent = () => {
    switch (activeModalType) {
      case "attendee":
        return (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Attendee Picture</label>
              <div className="flex items-center gap-3">
                {modalLogo ? (
                  <img src={modalLogo} className="w-12 h-12 rounded-xl object-cover border border-slate-200" alt="Attendee picture" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 text-[9px] font-bold text-center p-1 leading-tight select-none">
                    No Image
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 py-2 px-3 rounded-xl cursor-pointer text-xs font-semibold text-slate-650 justify-center transition-colors">
                    <Upload size={13} />
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
                  </label>
                  <input 
                    type="url" 
                    value={modalLogo} 
                    onChange={(e) => setModalLogo(e.target.value)} 
                    placeholder="Or paste image URL..."
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-[10px] font-semibold focus:outline-none focus:border-indigo-650"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" required value={modalName} onChange={(e) => setModalName(e.target.value)} placeholder="e.g. John Doe"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" required value={modalEmail} onChange={(e) => setModalEmail(e.target.value)} placeholder="e.g. john@example.com"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Ticket Type</label>
              <select 
                value={modalTicket} onChange={(e) => setModalTicket(e.target.value)}
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-indigo-650"
              >
                {tickets.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
          </>
        );

      case "org":
        return (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Organization Name</label>
              <input 
                type="text" required value={modalName} onChange={(e) => setModalName(e.target.value)} placeholder="e.g. Sonatrach"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Company Logo</label>
              <div className="flex items-center gap-3">
                {modalLogo ? (
                  <img src={modalLogo} className="w-12 h-12 rounded-xl object-cover border border-slate-200" alt="Logo preview" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 text-[9px] font-bold text-center p-1 leading-tight select-none">
                    No Logo
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 py-2 px-3 rounded-xl cursor-pointer text-xs font-semibold text-slate-650 justify-center transition-colors">
                    <Upload size={13} />
                    Upload Image
                    <input type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
                  </label>
                  <input 
                    type="url" 
                    value={modalLogo} 
                    onChange={(e) => setModalLogo(e.target.value)} 
                    placeholder="Or paste image URL..."
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-[10px] font-semibold focus:outline-none focus:border-indigo-650"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Industry/Sector</label>
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  value={industrySearch} 
                  onChange={(e) => {
                    setIndustrySearch(e.target.value);
                    setModalSector(e.target.value);
                    setIndustryDropdownOpen(true);
                  }}
                  onFocus={() => setIndustryDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIndustryDropdownOpen(false), 200)}
                  placeholder="Search or select industry..."
                  className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650 w-full pr-8 bg-white"
                />
                <button 
                  type="button"
                  onClick={() => setIndustryDropdownOpen(o => !o)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                >
                  {industryDropdownOpen ? "▲" : "▼"}
                </button>
              </div>
              {industryDropdownOpen && (() => {
                const filtered = INDUSTRIES.filter(ind => 
                  ind.toLowerCase().includes(industrySearch.toLowerCase())
                );
                return (
                  <div className="absolute top-full left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5">
                    {filtered.length > 0 ? (
                      filtered.map(ind => (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => {
                            setModalSector(ind);
                            setIndustrySearch(ind);
                            setIndustryDropdownOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700"
                        >
                          {ind}
                        </button>
                      ))
                    ) : (
                      <div className="px-3.5 py-2 text-xs font-semibold text-slate-450 italic">
                        No matches found. Press enter to save custom value.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Contact Person</label>
              <input 
                type="text" required value={modalContact} onChange={(e) => setModalContact(e.target.value)} placeholder="e.g. Ahmed B."
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Website URL</label>
              <input 
                type="url" value={modalWebsite} onChange={(e) => setModalWebsite(e.target.value)} placeholder="https://"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
            </div>
          </>
        );

      case "sponsor":
        return (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Company Name</label>
              <input 
                type="text" required value={modalName} onChange={(e) => setModalName(e.target.value)} placeholder="e.g. Air Liquide"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Sponsor Logo</label>
              <div className="flex items-center gap-3">
                {modalLogo ? (
                  <img src={modalLogo} className="w-12 h-12 rounded-xl object-cover border border-slate-200" alt="Logo preview" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 text-[9px] font-bold text-center p-1 leading-tight select-none">
                    No Logo
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 py-2 px-3 rounded-xl cursor-pointer text-xs font-semibold text-slate-650 justify-center transition-colors">
                    <Upload size={13} />
                    Upload Image
                    <input type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
                  </label>
                  <input 
                    type="url" 
                    value={modalLogo} 
                    onChange={(e) => setModalLogo(e.target.value)} 
                    placeholder="Or paste image URL..."
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-[10px] font-semibold focus:outline-none focus:border-indigo-650"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Sponsor Tier</label>
              <select 
                value={modalTier} onChange={(e) => setModalTier(e.target.value)}
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-indigo-650"
              >
                <option value="diamond">Diamond Tier</option>
                <option value="gold">Gold Tier</option>
                <option value="silver">Silver Tier</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Website URL</label>
              <input 
                type="url" value={modalWebsite} onChange={(e) => setModalWebsite(e.target.value)} placeholder="https://"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
            </div>
          </>
        );

      case "exhibitor":
        return (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Select Organization</label>
              <select 
                value={modalOrgId} 
                onChange={(e) => setModalOrgId(e.target.value)}
                required
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-indigo-650"
              >
                <option value="">-- Choose an Organization --</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Exhibitor Contact Email</label>
              <input 
                type="email"
                value={modalEmail}
                onChange={(e) => setModalEmail(e.target.value)}
                placeholder="e.g. contact@exhibitor.com"
                required
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
            </div>
          </>
        );

      case "ticket":
        return (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Tier Name</label>
              <input 
                type="text" required value={modalName} onChange={(e) => setModalName(e.target.value)} placeholder="e.g. VIP Access Pass"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Price ($)</label>
              <input 
                type="number" required value={modalPrice} onChange={(e) => setModalPrice(e.target.value)} placeholder="e.g. 299"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Max Availability</label>
              <input 
                type="number" required value={modalMax} onChange={(e) => setModalMax(e.target.value)} placeholder="e.g. 100"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Key Features (Comma-separated)</label>
              <input 
                type="text" required value={modalFeatures} onChange={(e) => setModalFeatures(e.target.value)} placeholder="e.g. Front-row seating, Lunch included, Video records"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
            </div>
          </>
        );

      case "team":
        return (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" required value={modalName} onChange={(e) => setModalName(e.target.value)} placeholder="e.g. Sarah M."
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" required value={modalEmail} onChange={(e) => setModalEmail(e.target.value)} placeholder="e.g. sarah@eventzone.com"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Access Role</label>
              <select 
                value={modalRole} onChange={(e) => setModalRole(e.target.value)}
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-indigo-650"
              >
                <option value="Admin">Administrator (Full Access)</option>
                <option value="Editor">Editor (Edit Sessions)</option>
                <option value="Staff">Staff (Check-in Door Only)</option>
              </select>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (!isClient || isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Eventzone...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Dynamic Accordion Navigation Sidebar — hidden while editing a floor plan */}
      {!(currentView === "floor-plan" && activeFloorPlanId !== null) && (
      <aside className="w-[260px] h-screen bg-white border-r border-slate-200 py-8 px-4 flex flex-col gap-8 sticky top-0 overflow-y-auto shrink-0 select-none z-40">
        <div className="px-3 py-1 select-none">
          <img src="https://i.imgur.com/jFDrQbM.png" className="h-6 w-auto object-contain" alt="eventzone logo" />
        </div>

        <nav className="flex flex-col gap-1">
          <button 
            onClick={() => setCurrentView("overview")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 text-left ${currentView === "overview" ? "bg-indigo-650 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-650"}`}
          >
            <LayoutDashboard size={16} />
            <span>Overview</span>
          </button>

          <button 
            onClick={() => setCurrentView("page-builder")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 text-left ${currentView === "page-builder" ? "bg-indigo-650 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-650"}`}
          >
            <Sparkles size={16} />
            <span>Landing Builder</span>
          </button>

          <button 
            onClick={() => setCurrentView("calendar")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 text-left ${currentView === "calendar" ? "bg-indigo-650 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-650"}`}
          >
            <Calendar size={16} />
            <span>Calendar</span>
          </button>

          <button 
            onClick={() => setCurrentView("event-details")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 text-left ${currentView === "event-details" ? "bg-indigo-650 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-650"}`}
          >
            <Globe size={16} />
            <span>Event details</span>
          </button>

          {/* Expandable Participants Submenu */}
          <div className="flex flex-col">
            <button 
              onClick={() => setParticipantsOpen(!participantsOpen)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 text-left ${["attendees", "pending", "organizations", "sponsors", "exhibitors", "speakers"].includes(currentView) ? "text-indigo-650 bg-indigo-50/45 font-extrabold" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <div className="flex items-center gap-3">
                <Users2 size={16} />
                <span>Participants</span>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-250 ${participantsOpen ? "rotate-180" : ""}`} />
            </button>

            {participantsOpen && (
              <div className="flex flex-col gap-0.5 pl-6 mt-1 border-l border-slate-100 ml-6">
                <button 
                  onClick={() => setCurrentView("attendees")}
                  className={`flex items-center justify-between px-4 py-2 rounded-lg font-semibold text-xs text-left transition-all duration-150 ${currentView === "attendees" ? "text-indigo-650 bg-indigo-50" : "text-slate-400 hover:text-indigo-600"}`}
                >
                  <span>All Attendees</span>
                  <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full ${currentView === "attendees" ? "bg-indigo-650 text-white" : "bg-slate-100 text-slate-500"}`}>{attendees.length}</span>
                </button>

                <button 
                  onClick={() => setCurrentView("pending")}
                  className={`flex items-center justify-between px-4 py-2 rounded-lg font-semibold text-xs text-left transition-all duration-150 ${currentView === "pending" ? "text-indigo-650 bg-indigo-50" : "text-slate-400 hover:text-indigo-600"}`}
                >
                  <span>Pending</span>
                  <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full ${currentView === "pending" ? "bg-indigo-650 text-white" : "bg-slate-100 text-slate-500"}`}>{pending.length}</span>
                </button>

                <button 
                  onClick={() => setCurrentView("organizations")}
                  className={`flex items-center justify-between px-4 py-2 rounded-lg font-semibold text-xs text-left transition-all duration-150 ${currentView === "organizations" ? "text-indigo-650 bg-indigo-50" : "text-slate-400 hover:text-indigo-600"}`}
                >
                  <span>Organizations</span>
                  <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full ${currentView === "organizations" ? "bg-indigo-650 text-white" : "bg-slate-100 text-slate-500"}`}>{organizations.length}</span>
                </button>

                <button 
                  onClick={() => setCurrentView("sponsors")}
                  className={`flex items-center justify-between px-4 py-2 rounded-lg font-semibold text-xs text-left transition-all duration-150 ${currentView === "sponsors" ? "text-indigo-650 bg-indigo-50" : "text-slate-400 hover:text-indigo-600"}`}
                >
                  <span>Sponsors</span>
                  <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full ${currentView === "sponsors" ? "bg-indigo-650 text-white" : "bg-slate-100 text-slate-500"}`}>{sponsors.length}</span>
                </button>

                <button 
                  onClick={() => setCurrentView("exhibitors")}
                  className={`flex items-center justify-between px-4 py-2 rounded-lg font-semibold text-xs text-left transition-all duration-150 ${currentView === "exhibitors" ? "text-indigo-650 bg-indigo-50" : "text-slate-400 hover:text-indigo-600"}`}
                >
                  <span>Exhibitors</span>
                  <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full ${currentView === "exhibitors" ? "bg-indigo-650 text-white" : "bg-slate-100 text-slate-500"}`}>{exhibitors.length}</span>
                </button>

                <button 
                  onClick={() => setCurrentView("speakers")}
                  className={`flex items-center justify-between px-4 py-2 rounded-lg font-semibold text-xs text-left transition-all duration-150 ${currentView === "speakers" ? "text-indigo-650 bg-indigo-50" : "text-slate-400 hover:text-indigo-600"}`}
                >
                  <span>Speakers</span>
                  <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full ${currentView === "speakers" ? "bg-indigo-650 text-white" : "bg-slate-100 text-slate-500"}`}>{getUniqueSpeakersCount()}</span>
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => { setCurrentView("floor-plan"); setActiveFloorPlanId(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 text-left ${currentView === "floor-plan" ? "bg-indigo-650 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-650"}`}
          >
            <Map size={16} />
            <span>Floor Plans</span>
            <span className={`ml-auto text-[9px] font-extrabold py-0.5 px-2 rounded-full ${currentView === "floor-plan" ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>{floorPlans.length}</span>
          </button>

          <button 
            onClick={() => setCurrentView("tickets")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 text-left ${currentView === "tickets" ? "bg-indigo-650 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-650"}`}
          >
            <Ticket size={16} />
            <span>Tickets</span>
          </button>

          <button 
            onClick={() => setCurrentView("check-in")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 text-left ${currentView === "check-in" ? "bg-indigo-650 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-650"}`}
          >
            <CheckCircle2 size={16} />
            <span>Check In</span>
          </button>

          <button 
            onClick={() => setCurrentView("my-team")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 text-left ${currentView === "my-team" ? "bg-indigo-650 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-650"}`}
          >
            <ShieldAlert size={16} />
            <span>My Team</span>
          </button>

          <button 
            onClick={() => setCurrentView("analytics")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 text-left ${currentView === "analytics" ? "bg-indigo-650 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-650"}`}
          >
            <BarChart3 size={16} />
            <span>Analytics</span>
          </button>

          <button 
            onClick={() => setCurrentView("communications")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 text-left ${currentView === "communications" ? "bg-indigo-650 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-650"}`}
          >
            <Mail size={16} />
            <span>Communications</span>
          </button>
        </nav>
      </aside>
      )}

      {/* Main View Port Container */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Dynamic content views router */}
        <div className={`flex-1 ${
          currentView === "floor-plan" && activeFloorPlanId !== null && initialPreviewMode 
            ? "overflow-hidden h-[100dvh] flex flex-col p-0" 
            : `overflow-y-auto ${currentView === "floor-plan" && activeFloorPlanId !== null ? "p-4" : "p-8 md:p-12"}`
        }`}>
          {currentView === "overview" && (
            <Overview 
              eventDetails={eventDetails}
              attendees={attendees}
              sessions={sessions}
              tickets={tickets}
              onSwitchView={setCurrentView}
              onOpenModal={handleOpenModal}
            />
          )}

          {currentView === "calendar" && (
            <CalendarView 
              sessions={sessions}
              attendees={attendees}
              onSaveSessions={(newSessions) => {
                syncArrayToDb(sessions, newSessions, upsertSession, deleteSession);
                setSessions(newSessions);
              }}
              onClearAllSessions={async () => {
                if (confirm("Are you sure you want to clear all sessions?")) {
                  await Promise.all(sessions.map(s => deleteSession(s.id).catch(console.error)));
                  setSessions([]);
                }
              }}
              onUploadFile={uploadFileToBucket}
            />
          )}

          {currentView === "floor-plan" && activeFloorPlanId === null && (
            <FloorPlanGallery
              floorPlans={floorPlans}
              onEdit={(id) => setActiveFloorPlanId(id)}
              onCreateNew={handleCreateFloorPlan}
              onDuplicate={handleDuplicateFloorPlan}
              onDelete={handleDeleteFloorPlan}
              onRename={handleRenameFloorPlan}
            />
          )}

          {currentView === "floor-plan" && activeFloorPlanId !== null && activePlan && (
            <FloorPlanModifier 
              exhibitors={exhibitors.map(ex => {
                const org = organizations.find(o => String(o.id) === String(ex.org_id));
                return {
                  ...ex,
                  logo: ex.logo || org?.logo || '',
                };
              })}
              attendees={attendees}
              initialLayout={activePlan.elements}
              initialBlueprintState={activePlan.blueprint}
              initialFloors={activePlan.floors || []}
              fontFamily={activePlan.fontFamily || "Inter"}
              planName={activePlan.name}
              floorPlanId={activeFloorPlanId}
              onSaveLayout={(elements) => handleSaveFloorPlanElements(activeFloorPlanId, elements)}
              onSaveBlueprintState={(bp) => handleSaveFloorPlanBlueprint(activeFloorPlanId, bp)}
              onSaveFloors={(floors) => handleSaveFloorPlanFloors(activeFloorPlanId, floors)}
              onSaveFontFamily={(font) => handleSaveFloorPlanFontFamily(activeFloorPlanId, font)}
              onBack={() => {
                setActiveFloorPlanId(null);
                setInitialPreviewMode(false);
              }}
              onRename={(newName) => handleRenameFloorPlan(activeFloorPlanId, newName)}
              onUploadFile={uploadFileToBucket}
              saveStatus={saveStatus}
              initialPreviewMode={initialPreviewMode}
            />
          )}

          {currentView === "page-builder" && (
            <LivePageBuilder 
              eventDetails={eventDetails}
              onUpdateEventDetails={(val) => handleUpdateState("eventDetails", val)}
              sessions={sessions}
              sponsors={sponsors}
              exhibitors={exhibitors.map(ex => {
                const org = organizations.find(o => String(o.id) === String(ex.org_id));
                return {
                  ...ex,
                  logo: ex.logo || org?.logo || '',
                };
              })}
              tickets={tickets}
            />
          )}

          {!["overview", "calendar", "page-builder"].includes(currentView) && currentView !== "floor-plan" && (
            <GenericTableView 
              viewName={currentView}
              state={{
                eventDetails,
                attendees,
                pending,
                organizations,
                sponsors,
                exhibitors,
                tickets,
                team,
                sessions
              }}
              onUpdateState={handleUpdateState}
              onOpenModal={handleOpenModal}
              onUploadFile={uploadFileToBucket}
            />
          )}
        </div>
      </main>

      {/* Modal overlays for adding records */}
      {activeModalType && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white border border-slate-150 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 relative animate-scale-up">
            <header className="flex justify-between items-center select-none">
              <h3 className="text-lg font-bold text-slate-800">
                {activeModalType === "attendee" && "Add New Attendee"}
                {activeModalType === "org" && "Add Partner Organization"}
                {activeModalType === "sponsor" && "Add Event Sponsor"}
                {activeModalType === "exhibitor" && "Register Exhibitor"}
                {activeModalType === "ticket" && "Create Ticket Tier"}
                {activeModalType === "team" && "Invite Team Member"}
              </h3>
              <button 
                onClick={closeModal}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </header>

            <form onSubmit={handleModalSubmit} className="flex flex-col gap-5">
              {renderModalFormContent()}
              
              <button 
                type="submit" 
                className="w-full bg-indigo-650 hover:bg-indigo-750 text-white font-semibold py-3.5 px-4 rounded-xl text-xs transition-all hover:shadow hover:-translate-y-0.5 mt-3 cursor-pointer"
              >
                Save Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

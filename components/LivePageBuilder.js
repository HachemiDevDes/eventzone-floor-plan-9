"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, MapPin, AlignLeft, Sparkles, Paintbrush, 
  Smartphone, Monitor, Eye, Layout, Type, Check, 
  Compass, Users, Clock, AlertCircle, Bookmark, Ticket, Award, HelpCircle,
  Plus, Trash2, Image, ChevronLeft, ChevronRight, Play, Map
} from "lucide-react";

// Google Fonts free for commercial use list (to show professional visual design)
const PREVIEW_FONTS = [
  { id: "inter", name: "Inter", className: "font-sans" },
  { id: "playfair", name: "Playfair Display", className: "font-serif" },
  { id: "outfit", name: "Outfit", className: "font-sans tracking-tight" },
  { id: "space-mono", name: "Space Mono", className: "font-mono" }
];

const THEME_COLORS = [
  { id: "blue", name: "Ocean Blue", hex: "#2563eb", class: "bg-blue-600", border: "border-blue-500", text: "text-blue-600", accent: "rgba(37, 99, 235, 0.08)", gradient: "from-blue-50/70 via-white to-white" },
  { id: "red", name: "Crimson Red", hex: "#dc2626", class: "bg-red-600", border: "border-red-500", text: "text-red-600", accent: "rgba(220, 38, 38, 0.08)", gradient: "from-red-50/70 via-white to-white" },
  { id: "green", name: "Forest Green", hex: "#059669", class: "bg-emerald-600", border: "border-emerald-500", text: "text-emerald-600", accent: "rgba(5, 150, 105, 0.08)", gradient: "from-emerald-50/70 via-white to-white" },
  { id: "pink", name: "Hot Pink", hex: "#db2777", class: "bg-pink-600", border: "border-pink-500", text: "text-pink-600", accent: "rgba(219, 39, 119, 0.08)", gradient: "from-pink-50/70 via-white to-white" },
  { id: "purple", name: "Royal Purple", hex: "#7c3aed", class: "bg-purple-600", border: "border-purple-500", text: "text-purple-600", accent: "rgba(124, 58, 237, 0.08)", gradient: "from-purple-50/70 via-white to-white" }
];

// Initial seeded banner images for wow effect
const INITIAL_IMAGES = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80"
];

export default function LivePageBuilder({ eventDetails, onUpdateEventDetails, sessions = [], sponsors = [], exhibitors = [], tickets = [] }) {
  // Sync core inputs with global state
  const title = eventDetails?.title || "";
  const date = eventDetails?.startDate || "";
  const location = eventDetails?.location || "";
  const description = eventDetails?.description || "";

  const updateField = (field, val) => {
    onUpdateEventDetails({
      ...eventDetails,
      [field]: val
    });
  };

  // Localized UI state
  const [time, setTime] = useState("09:00 AM - 05:00 PM EST");
  const [selectedTheme, setSelectedTheme] = useState(THEME_COLORS[0]); // Default: Blue
  const [selectedFont, setSelectedFont] = useState(PREVIEW_FONTS[0]); // Default: Inter
  const [deviceMode, setDeviceMode] = useState("desktop"); // desktop | mobile

  // Images state for the banner
  const [bannerImages, setBannerImages] = useState(INITIAL_IMAGES);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Fallback / Dummy agenda sessions to guarantee mock visual richness
  const displaySessions = sessions.length > 0 ? sessions : [
    { id: 1, title: "Opening Remarks & Future Roadmap", startTime: "09:00 AM", endTime: "10:30 AM", description: "Our leadership outlines future innovations.", speakers: [{ name: "Mohamed Arkab", role: "Keynote" }] },
    { id: 2, title: "Next-Gen System Paradigms", startTime: "11:00 AM", endTime: "12:30 PM", description: "Practical architecture design patterns.", speakers: [{ name: "Dr. Amel Bouraoui", role: "Special Guest" }] }
  ];

  // Fallback / Dummy sponsors
  const displaySponsors = sponsors.length > 0 ? sponsors : [
    { id: 1, name: "Sonatrach", tier: "diamond" },
    { id: 2, name: "Deutsche Bank", tier: "gold" },
    { id: 3, name: "Air Liquide", tier: "silver" }
  ];

  // Fallback / Dummy exhibitors
  const displayExhibitors = exhibitors.length > 0 ? exhibitors : [
    { id: 1, name: "Hydrogen Systems Corp", booth: "B1" },
    { id: 2, name: "Snam SpA", booth: "A1" }
  ];

  // Fallback / Dummy tickets
  const displayTickets = tickets.length > 0 ? tickets : [
    { id: 1, name: "Standard Admission", price: 150, features: ["Access to exhibition halls", "Standard lunch", "Presentation materials"] },
    { id: 2, name: "VIP Access Pass", price: 350, features: ["Ministerial networking lunch", "VIP lounge access", "Front-row seating"] }
  ];

  // Extraction of unique speakers from sessions
  const displaySpeakers = [];
  const speakerNames = new Set();
  displaySessions.forEach(s => {
    if (s.speakers) {
      s.speakers.forEach(sp => {
        if (!speakerNames.has(sp.name)) {
          speakerNames.add(sp.name);
          displaySpeakers.push(sp);
        }
      });
    }
  });
  // Fallback speakers if list is empty
  if (displaySpeakers.length === 0) {
    displaySpeakers.push(
      { name: "Dr. Amel Bouraoui", role: "Keynote Speaker", image: "https://ui-avatars.com/api/?name=Amel+Bouraoui&background=2563eb&color=fff" },
      { name: "Mohamed Arkab", role: "Industry Expert", image: "https://ui-avatars.com/api/?name=Mohamed+Arkab&background=64748b&color=fff" }
    );
  }

  // Handle adding custom images to the banner carousel
  const handleAddImage = (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setBannerImages([...bannerImages, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (indexToRemove) => {
    const updated = bannerImages.filter((_, idx) => idx !== indexToRemove);
    setBannerImages(updated);
    if (activeImageIdx >= updated.length && updated.length > 0) {
      setActiveImageIdx(updated.length - 1);
    }
  };

  const nextImage = () => {
    if (bannerImages.length === 0) return;
    setActiveImageIdx((prev) => (prev + 1) % bannerImages.length);
  };

  const prevImage = () => {
    if (bannerImages.length === 0) return;
    setActiveImageIdx((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  const previewContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const previewItemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/60 rounded-3xl border border-slate-150 overflow-hidden">
      {/* View Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white border-b border-slate-100 gap-4 select-none">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Layout className="text-indigo-650" size={20} />
            <span>Eventzone Page Builder</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Real-time landing page with premium design blocks and badge schedules.
          </p>
        </div>
        
        {/* Device toggle switches */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
          <button
            onClick={() => setDeviceMode("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${deviceMode === "desktop" ? "bg-white text-indigo-650 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Monitor size={14} />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setDeviceMode("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${deviceMode === "mobile" ? "bg-white text-indigo-650 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Smartphone size={14} />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Split Screen Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT PANEL: THE EDITOR */}
        <div className="w-full lg:w-[420px] bg-white border-r border-slate-100 overflow-y-auto flex flex-col p-6 gap-6">
          
          {/* Section 1: Core details */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-600" />
              <span>Event Details</span>
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Annual Design Summit"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => updateField("startDate", e.target.value)}
                  className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Time / Schedule</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 9:00 AM - 5:00 PM"
                  className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Location / Venue</label>
              <input
                type="text"
                value={location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g. Silicon Valley, CA"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Event Description</label>
              <textarea
                value={description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Write a compelling description..."
                rows={3}
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650 transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Banner Image Gallery controls */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Image size={14} className="text-indigo-600" />
              <span>Event Gallery Banner</span>
            </h3>

            <form onSubmit={handleAddImage} className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste Image URL..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-650"
              />
              <button
                type="submit"
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </form>

            {/* List of current images */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Current Photos</label>
              <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {bannerImages.map((img, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={img} className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" alt="thumbnail" />
                      <span className="text-[10px] font-bold text-slate-500 truncate">{img}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 text-slate-450 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {bannerImages.length === 0 && (
                  <span className="text-[10px] text-slate-400 font-bold italic py-2">No photos added yet.</span>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Styling & Brand */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Paintbrush size={14} className="text-indigo-600" />
              <span>Theme & Colors</span>
            </h3>

            {/* Colors grid */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Brand Palette</label>
              <div className="grid grid-cols-5 gap-2">
                {THEME_COLORS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t)}
                    title={t.name}
                    className={`h-11 rounded-xl flex items-center justify-center relative cursor-pointer border transition-all duration-200 ${selectedTheme.id === t.id ? `${t.border} ring-2 ring-offset-2 ring-slate-200 scale-102` : "border-slate-100 hover:scale-105"}`}
                    style={{ backgroundColor: t.hex }}
                  >
                    {selectedTheme.id === t.id && (
                      <Check className="text-white drop-shadow-sm" size={16} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Font selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Typography Family</label>
              <div className="grid grid-cols-2 gap-2">
                {PREVIEW_FONTS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFont(f)}
                    className={`px-3 py-3 border rounded-xl text-xs font-bold transition-all text-left flex justify-between items-center cursor-pointer ${selectedFont.id === f.id ? "border-indigo-600 bg-indigo-50/40 text-indigo-700" : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"}`}
                  >
                    <span>{f.name}</span>
                    {selectedFont.id === f.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE PREVIEW CONTAINER */}
        <div className="flex-1 bg-slate-100/50 p-6 md:p-8 flex items-center justify-center overflow-y-auto">
          
          {/* Framed Container / Mock Browser */}
          <div 
            className={`bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-500 ease-in-out ${deviceMode === "mobile" ? "max-w-[375px] w-full aspect-[9/19]" : "w-full max-w-4xl min-h-[580px]"}`}
          >
            {/* Browser Header Bar */}
            <div className="bg-slate-50 border-b border-slate-150 px-4 py-3 flex items-center gap-2 select-none">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
              </div>
              <div className="mx-auto max-w-[280px] w-full bg-slate-200/50 text-[10px] text-slate-400 font-bold px-3 py-0.5 rounded-md text-center truncate tracking-wide">
                eventzone.co/events/{title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
              </div>
              <div className="w-12"></div>
            </div>

            {/* Inner Live Page Body */}
            <div className="overflow-y-auto h-[calc(100%-38px)] max-h-[640px] bg-slate-50">
              <motion.div
                key={`${selectedTheme.id}-${selectedFont.id}`}
                variants={previewContainerVariants}
                initial="hidden"
                animate="show"
                className={`w-full bg-gradient-to-b ${selectedTheme.gradient} px-6 md:px-12 py-10 md:py-14 text-slate-800 ${selectedFont.className} flex flex-col gap-12`}
              >
                
                {/* Hero / Header Brand */}
                <div className="flex flex-col gap-6">
                  <motion.div variants={previewItemVariants} className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 select-none">
                    <Compass size={14} style={{ color: selectedTheme.hex }} />
                    <span>Official Landing Page</span>
                  </motion.div>

                  <motion.h1 
                    variants={previewItemVariants} 
                    className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight"
                  >
                    {title || "Untitled Premium Event"}
                  </motion.h1>

                  {/* Metadata chips */}
                  <motion.div variants={previewItemVariants} className="flex flex-wrap gap-3 mt-1">
                    {date && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white py-2 px-3.5 rounded-2xl border border-slate-100 shadow-sm">
                        <Calendar size={14} style={{ color: selectedTheme.hex }} />
                        <span>
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                    )}
                    {location && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white py-2 px-3.5 rounded-2xl border border-slate-100 shadow-sm">
                        <MapPin size={14} style={{ color: selectedTheme.hex }} />
                        <span className="truncate">{location}</span>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* SCROLLING PHOTO BANNER CAROUSEL */}
                {bannerImages.length > 0 && (
                  <motion.div variants={previewItemVariants} className="relative w-full h-[220px] rounded-3xl overflow-hidden shadow-md group">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImageIdx}
                        src={bannerImages[activeImageIdx]}
                        initial={{ opacity: 0, scale: 1.03 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full object-cover"
                        alt="Event Banner"
                      />
                    </AnimatePresence>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />

                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:bg-white shadow transition-all duration-200 cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:bg-white shadow transition-all duration-200 cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {bannerImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIdx(idx)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeImageIdx ? "bg-white w-3.5" : "bg-white/50"}`}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* About this Event */}
                <motion.div variants={previewItemVariants} className="flex flex-col gap-3">
                  <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Bookmark size={14} style={{ color: selectedTheme.hex }} />
                    <span>About this Event</span>
                  </h2>
                  <p className="text-xs md:text-sm text-slate-650 leading-relaxed max-w-2xl font-medium">
                    {description || "No description provided yet."}
                  </p>
                </motion.div>

                {/* PREMIUM BADGE-STYLE AGENDA TIMELINE */}
                <motion.div variants={previewItemVariants} className="flex flex-col gap-5">
                  <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Clock size={14} style={{ color: selectedTheme.hex }} />
                    <span>Event Agenda</span>
                  </h2>
                  <div className="flex flex-col gap-4 relative pl-4 border-l border-slate-200">
                    {displaySessions.map((session, idx) => (
                      <div key={session.id} className="relative flex flex-col md:flex-row md:items-start gap-4">
                        {/* Timeline point dot */}
                        <div 
                          className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 flex items-center justify-center transition-colors duration-300"
                          style={{ borderColor: selectedTheme.hex }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedTheme.hex }} />
                        </div>

                        {/* Badge time indicator */}
                        <div className="shrink-0">
                          <span 
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-wide uppercase border bg-white shadow-sm"
                            style={{ color: selectedTheme.hex, borderColor: `${selectedTheme.hex}25` }}
                          >
                            <Play size={8} className="fill-current" />
                            {session.startTime}
                          </span>
                        </div>

                        {/* Card Detail content */}
                        <div className="flex-1 bg-white border border-slate-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <h4 className="text-xs font-bold text-slate-800">{session.title}</h4>
                            <span className="text-[8px] text-slate-400 font-extrabold uppercase bg-slate-100 py-0.5 px-2 rounded-md">
                              Duration: {session.endTime ? `Till ${session.endTime}` : "60m"}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-slate-500 font-semibold mt-1.5 leading-relaxed">
                            {session.description}
                          </p>

                          {/* Show associated session speakers inside the agenda detail card */}
                          {session.speakers && session.speakers.length > 0 && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {session.speakers.map((sp, sIdx) => (
                                <div key={sIdx} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 py-1 px-2 rounded-xl">
                                  <div className="w-4 h-4 rounded-full bg-slate-200 border border-slate-100 flex items-center justify-center text-[7px] font-black text-slate-500 uppercase">
                                    {sp.name.charAt(0)}
                                  </div>
                                  <span className="text-[8px] font-bold text-slate-600">{sp.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Speaker Speakers list */}
                <motion.div variants={previewItemVariants} className="flex flex-col gap-4">
                  <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Users size={14} style={{ color: selectedTheme.hex }} />
                    <span>Keynote Speakers</span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {displaySpeakers.map((speaker, idx) => (
                      <div key={idx} className="p-3.5 bg-white border border-slate-150 rounded-2xl shadow-sm flex items-center gap-3 hover:shadow-md transition-all duration-300">
                        {speaker.image ? (
                          <img src={speaker.image} alt={speaker.name} className="w-10 h-10 rounded-full border border-slate-100 shrink-0 object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-extrabold shrink-0 text-xs uppercase">
                            {speaker.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-slate-800 truncate">{speaker.name}</span>
                          <span className="text-[9px] text-slate-550 truncate font-semibold mt-0.5">{speaker.role || "Speaker"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Ticket Admission Options */}
                <motion.div variants={previewItemVariants} className="flex flex-col gap-4">
                  <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Ticket size={14} style={{ color: selectedTheme.hex }} />
                    <span>Registration Tiers</span>
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {displayTickets.map((t) => (
                      <div key={t.id} className="p-5 bg-white border border-slate-150 rounded-2xl shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-800">{t.name}</span>
                            <span className="text-sm font-black text-slate-900">${t.price}</span>
                          </div>
                          <hr className="border-slate-100" />
                          <div className="flex flex-col gap-1">
                            {t.features && t.features.map((feat, fidx) => (
                              <div key={fidx} className="flex items-center gap-1.5 text-[9px] text-slate-550 font-semibold">
                                <Check size={10} style={{ color: selectedTheme.hex }} />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          style={{ backgroundColor: selectedTheme.hex }}
                          className="w-full py-2.5 text-white font-bold text-[10px] rounded-xl shadow-sm hover:shadow transition-shadow select-none cursor-pointer"
                        >
                          Select Ticket
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Brand Partners & Exhibitors */}
                <div className="grid md:grid-cols-2 gap-6 mt-2">
                  
                  {/* Sponsors */}
                  <motion.div variants={previewItemVariants} className="flex flex-col gap-3">
                    <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Award size={14} style={{ color: selectedTheme.hex }} />
                      <span>Event Sponsors</span>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {displaySponsors.map((sp) => (
                        <div key={sp.id} className="px-3 py-2 bg-white border border-slate-150 rounded-xl shadow-sm text-[10px] font-bold text-slate-650 flex items-center gap-2">
                          <span>{sp.name}</span>
                          <span className="text-[8px] bg-amber-50 text-amber-600 px-1 py-0.5 rounded uppercase font-black tracking-widest">{sp.tier}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Exhibitors */}
                  <motion.div variants={previewItemVariants} className="flex flex-col gap-3">
                    <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Map size={14} style={{ color: selectedTheme.hex }} />
                      <span>Featured Booths</span>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {displayExhibitors.map((ex) => (
                        <div key={ex.id} className="px-3 py-2 bg-white border border-slate-150 rounded-xl shadow-sm text-[10px] font-bold text-slate-650 flex items-center gap-2">
                          {ex.logo && (
                            <img src={ex.logo} className="w-4.5 h-4.5 rounded object-cover border border-slate-100" alt="" />
                          )}
                          <span>{ex.name}</span>
                          <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                            {ex.booth && ex.booth.toLowerCase().includes("booth") ? ex.booth : `Booth ${ex.booth || "TBD"}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                </div>

                {/* Footer Section info */}
                <motion.div 
                  variants={previewItemVariants} 
                  className="mt-6 border-t border-slate-200 pt-6 text-center"
                >
                  <p className="text-[10px] font-semibold text-slate-400 flex items-center justify-center gap-1 select-none">
                    <HelpCircle size={12} />
                    <span>Have questions? Contact us at info@eventzone.co</span>
                  </p>
                </motion.div>

              </motion.div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

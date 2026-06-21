"use client";

import React, { useState } from "react";
import { 
  Users, CheckCircle2, Ticket, ShieldAlert, Building2, 
  Award, Briefcase, Mic, Search, Trash2, Check, X,
  MapPin, Calendar, FileText, Upload, Plus, BarChart4, Pencil, Mail
} from "lucide-react";

export default function GenericTableView({ 
  viewName, 
  state, 
  onUpdateState, 
  onOpenModal,
  onUploadFile
}) {
  switch (viewName) {
    case "event-details":
      return <EventDetailsView state={state} onUpdateState={onUpdateState} onUploadFile={onUploadFile} />;
    case "attendees":
      return <AttendeesView state={state} onUpdateState={onUpdateState} onOpenModal={onOpenModal} />;
    case "pending":
      return <PendingView state={state} onUpdateState={onUpdateState} />;
    case "organizations":
      return <OrganizationsView state={state} onUpdateState={onUpdateState} onOpenModal={onOpenModal} />;
    case "sponsors":
      return <SponsorsView state={state} onUpdateState={onUpdateState} onOpenModal={onOpenModal} />;
    case "exhibitors":
      return <ExhibitorsView state={state} onUpdateState={onUpdateState} onOpenModal={onOpenModal} />;
    case "speakers":
      return <SpeakersDirectoryView state={state} onUpdateState={onUpdateState} />;
    case "tickets":
      return <TicketsView state={state} onUpdateState={onUpdateState} onOpenModal={onOpenModal} />;
    case "check-in":
      return <CheckInView state={state} onUpdateState={onUpdateState} />;
    case "my-team":
      return <MyTeamView state={state} onUpdateState={onUpdateState} onOpenModal={onOpenModal} />;
    case "analytics":
      return <AnalyticsView state={state} />;
    case "communications":
      return <CommunicationsView state={state} onUpdateState={onUpdateState} />;
    default:
      return <div className="p-8 text-slate-400">View not implemented yet.</div>;
  }
}

// 1. EVENT DETAILS VIEW
function EventDetailsView({ state, onUpdateState, onUploadFile }) {
  const { eventDetails } = state;
  const [title, setTitle] = useState(eventDetails.title);
  const [location, setLocation] = useState(eventDetails.location);
  const [type, setType] = useState(eventDetails.type || "Hybrid");
  const [startDate, setStartDate] = useState(eventDetails.startDate);
  const [endDate, setEndDate] = useState(eventDetails.endDate);
  const [description, setDescription] = useState(eventDetails.description);
  const [banner, setBanner] = useState(eventDetails.banner || "");

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const publicUrl = onUploadFile 
        ? await onUploadFile(file, 'floor-plans')
        : await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });

      if (publicUrl) {
        setBanner(publicUrl);
      }
    } catch (err) {
      console.error("Failed to upload banner:", err);
      alert("Failed to upload banner image to Supabase Storage");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateState("eventDetails", {
      title, location, type, startDate, endDate, description, banner
    });
    alert("Event details saved successfully!");
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-8 max-w-4xl mx-auto shadow-sm">
      <div 
        className="w-full h-56 rounded-2xl bg-gradient-to-br from-indigo-600 to-rose-500 bg-cover bg-center relative overflow-hidden mb-8 shadow-sm flex items-end p-8"
        style={banner ? { backgroundImage: `url(${banner})` } : {}}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-950/20 to-transparent"></div>
        <div className="relative text-white z-10">
          <h3 className="text-2xl font-bold tracking-tight text-white">{title || "Event Title"}</h3>
          <p className="text-xs font-semibold text-slate-200 mt-1 opacity-90">📍 {location} | 📅 {startDate} - {endDate}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            required
            className="px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-sm font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location / Venue</label>
            <input 
              type="text" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-sm font-semibold"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-sm font-semibold"
            >
              <option value="Hybrid">Hybrid</option>
              <option value="In-person">In-Person Only</option>
              <option value="Virtual">Virtual / Online Only</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-sm font-semibold"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-sm font-semibold"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">About Event</label>
          <textarea 
            rows={4} 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-sm font-semibold resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Cover Banner</label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-slate-100/55 transition-all text-center flex flex-col items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-indigo-650 bg-white border border-slate-200 hover:border-indigo-150 py-2.5 px-4 rounded-xl cursor-pointer shadow-sm hover:shadow">
              <Upload size={14} />
              Upload Custom Banner
              <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
            </label>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Recommended size: 1200 x 400 pixels</span>
          </div>
        </div>

        <button 
          type="submit" 
          className="bg-indigo-650 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl mt-4 max-w-[200px] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-sm"
        >
          Save Event Details
        </button>
      </form>
    </div>
  );
}

// 2. ALL ATTENDEES VIEW
function AttendeesView({ state, onUpdateState, onOpenModal }) {
  const { attendees } = state;
  const [search, setSearch] = useState("");

  const handleDelete = (id) => {
    if (confirm("Remove this attendee?")) {
      onUpdateState("attendees", attendees.filter(a => a.id !== id));
    }
  };

  const filtered = attendees.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <header className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">All Attendees</h2>
          <p className="text-sm text-slate-500">Manage list of registered participants and ticket tiers.</p>
        </div>
        <button 
          onClick={() => onOpenModal("attendee")}
          className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all hover:shadow duration-200 cursor-pointer"
        >
          <Plus size={16} /> Add Attendee
        </button>
      </header>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar search */}
        <div className="p-5 border-b border-slate-150 bg-slate-50 flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search attendees by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-650"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs font-medium text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
                <th className="py-4 px-6">Attendee</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Ticket Type</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Registered Date</th>
                <th className="py-4 px-6 w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-slate-450 py-12">No attendees registered yet.</td>
                </tr>
              ) : (
                filtered.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/55 transition-colors duration-150">
                    <td className="py-4 px-6 font-semibold flex items-center gap-3">
                      <img 
                        src={a.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=random`} 
                        className="w-8 h-8 rounded-full object-cover shadow-inner" 
                        alt="" 
                      />
                      <span className="text-slate-800 font-bold">{a.name}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-semibold">{a.email}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">{a.ticketType}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${a.status === 'checked-in' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {a.status === 'checked-in' ? 'checked in' : 'registered'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-bold">{a.registeredDate}</td>
                    <td className="py-4 px-6 text-center flex items-center justify-center gap-1">
                      <button 
                        onClick={() => {
                          const name = prompt("Select session index/title or leave blank to make attendee a speaker globally? (You can assign them directly to sessions in the Calendar tab)");
                          if (name !== null) {
                            // Find calendar sessions and add this attendee as a speaker
                            if (state.sessions && state.sessions.length > 0) {
                              const options = state.sessions.map((s, i) => `${i + 1}: ${s.title}`).join("\n");
                              const choice = prompt(`Enter session index (1 to ${state.sessions.length}) to assign them as speaker:\n\n${options}`);
                              if (choice) {
                                const idx = parseInt(choice) - 1;
                                if (idx >= 0 && idx < state.sessions.length) {
                                  const targetSession = state.sessions[idx];
                                  const updatedSpeakers = [...(targetSession.speakers || [])];
                                  if (!updatedSpeakers.find(sp => sp.name === a.name)) {
                                    updatedSpeakers.push({
                                      id: Date.now(),
                                      name: a.name,
                                      image: a.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=random`
                                    });
                                    const updatedSessions = state.sessions.map((s, i) => i === idx ? { ...s, speakers: updatedSpeakers } : s);
                                    onUpdateState("sessions", updatedSessions);
                                    alert(`Successfully added ${a.name} as a speaker to "${targetSession.title}"!`);
                                  } else {
                                    alert(`${a.name} is already a speaker in this session.`);
                                  }
                                  return;
                                }
                              }
                            }
                            alert("Attendee made a speaker! You can now assign them to sessions on the Calendar page.");
                          }
                        }}
                        className="p-1.5 hover:text-emerald-650 text-slate-400 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-lg transition-all cursor-pointer"
                        title="Assign Speaker to Session"
                      >
                        <Mic size={14} />
                      </button>
                      <button 
                        onClick={() => onOpenModal("attendee", a)}
                        className="p-1.5 hover:text-indigo-650 text-slate-400 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all cursor-pointer"
                        title="Edit Attendee"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 hover:text-rose-600 text-slate-400 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all cursor-pointer"
                        title="Remove Attendee"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 3. PENDING REGISTRATIONS VIEW
function PendingView({ state, onUpdateState }) {
  const { pending, attendees } = state;

  const handleDecline = (id) => {
    if (confirm("Decline this registration request?")) {
      onUpdateState("pending", pending.filter(p => p.id !== id));
    }
  };

  const handleApprove = (p) => {
    // Approve and add to attendees list
    const newAttendee = {
      id: Date.now(),
      name: p.name,
      email: p.email,
      ticketType: "Standard Admission",
      status: "registered",
      registeredDate: new Date().toISOString().split("T")[0],
      image: ""
    };
    onUpdateState("attendees", [...attendees, newAttendee]);
    onUpdateState("pending", pending.filter(x => x.id !== p.id));
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <header className="select-none">
        <h2 className="text-2xl font-bold text-slate-900">Pending Approvals</h2>
        <p className="text-sm text-slate-500">Review registrations awaiting organizer validation.</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs font-semibold text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Request Note</th>
                <th className="py-4 px-6">Submitted Date</th>
                <th className="py-4 px-6 w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pending.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-slate-400 py-16 font-medium">No pending registration requests.</td>
                </tr>
              ) : (
                pending.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-all duration-150">
                    <td className="py-4 px-6 font-bold text-slate-800">{p.name}</td>
                    <td className="py-4 px-6 text-slate-500">{p.email}</td>
                    <td className="py-4 px-6 text-slate-450 italic font-medium leading-relaxed max-w-xs truncate">{p.note || "None"}</td>
                    <td className="py-4 px-6 text-slate-400">{p.date}</td>
                    <td className="py-4 px-6 flex items-center gap-2">
                      <button 
                        onClick={() => handleApprove(p)}
                        className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-600 border border-emerald-100 hover:border-emerald-600 text-emerald-700 hover:text-white py-1.5 px-3 rounded-lg font-bold text-[11px] transition-all cursor-pointer shadow-sm hover:shadow"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button 
                        onClick={() => handleDecline(p.id)}
                        className="flex items-center gap-1 bg-rose-50 hover:bg-rose-600 border border-rose-100 hover:border-rose-600 text-rose-700 hover:text-white py-1.5 px-3 rounded-lg font-bold text-[11px] transition-all cursor-pointer shadow-sm"
                      >
                        <X size={12} /> Decline
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 4. PARTNER ORGANIZATIONS VIEW
function OrganizationsView({ state, onUpdateState, onOpenModal }) {
  const { organizations } = state;

  const handleDelete = (id) => {
    if (confirm("Remove this organization?")) {
      onUpdateState("organizations", organizations.filter(o => o.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <header className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Partner Organizations</h2>
          <p className="text-sm text-slate-500">Partner institutions, corporations and groups connected to the event.</p>
        </div>
        <button 
          onClick={() => onOpenModal("org")}
          className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all hover:shadow duration-200 cursor-pointer"
        >
          <Plus size={16} /> Add Organization
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-400">No organizations registered yet.</div>
        ) : (
          organizations.map(o => (
            <div key={o.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative group">
              <div className="flex justify-between items-start mb-4">
                {o.logo ? (
                  <img src={o.logo} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-inner" alt={o.name} />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-extrabold text-xl flex items-center justify-center select-none">
                    {o.name.charAt(0)}
                  </div>
                )}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => onOpenModal("org", o)}
                    className="p-1.5 hover:text-indigo-600 text-slate-400 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all duration-200 cursor-pointer"
                    title="Edit Organization"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(o.id)}
                    className="p-1.5 hover:text-rose-600 text-slate-400 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all duration-200 cursor-pointer"
                    title="Remove Organization"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-md font-bold text-slate-800 mb-4">{o.name}</h3>

              <div className="border-t border-slate-100 pt-4 flex flex-col gap-2 text-[11px] font-semibold text-slate-500 leading-normal">
                <span className="flex items-center gap-2"><Building2 size={13} className="text-slate-400 shrink-0" /> Sector: <strong className="text-slate-700">{o.industry}</strong></span>
                <span className="flex items-center gap-2"><Users size={13} className="text-slate-400 shrink-0" /> Contact: <strong className="text-slate-700">{o.contact}</strong></span>
                {o.website && (
                  <span className="mt-2 block"><a href={o.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-750 font-bold hover:underline">Visit Website →</a></span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 5. EVENT SPONSORS VIEW
function SponsorsView({ state, onUpdateState, onOpenModal }) {
  const { sponsors } = state;

  const handleDelete = (id) => {
    if (confirm("Remove this sponsor?")) {
      onUpdateState("sponsors", sponsors.filter(s => s.id !== id));
    }
  };

  const getSponsorsByTier = (tier) => sponsors.filter(s => s.tier === tier);

  const renderSponsorTierList = (tierName, tierKey, colorClass) => {
    const list = getSponsorsByTier(tierKey);
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col gap-6">
        <h3 className={`text-md font-bold flex items-center gap-2 pb-4 border-b border-slate-100 ${colorClass}`}>
          <Award size={18} />
          {tierName}
        </h3>
        {list.length === 0 ? (
          <p className="text-slate-400 text-xs italic">No sponsors added in this tier.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {list.map(s => (
              <div key={s.id} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col items-center gap-3 text-center relative group hover:bg-white hover:border-indigo-150 transition-all duration-200">
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => onOpenModal("sponsor", s)}
                    className="text-indigo-650 hover:bg-indigo-50 p-1 rounded-md font-bold text-xs leading-none cursor-pointer flex items-center justify-center border border-transparent hover:border-indigo-100"
                    title="Edit Sponsor"
                  >
                    <Pencil size={11} />
                  </button>
                  <button 
                    onClick={() => handleDelete(s.id)}
                    className="text-rose-500 hover:bg-rose-50 p-1 rounded-md font-bold text-sm leading-none cursor-pointer flex items-center justify-center border border-transparent hover:border-rose-100"
                    title="Remove Sponsor"
                  >
                    ×
                  </button>
                </div>
                <img 
                  src={s.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`} 
                  className="w-14 h-14 rounded-full object-cover shadow-sm bg-white" 
                  alt="" 
                />
                <h4 className="text-xs font-bold text-slate-800 truncate w-full">{s.name}</h4>
                {s.website && (
                  <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-650 hover:underline font-semibold leading-none">Website</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Event Sponsors</h2>
          <p className="text-sm text-slate-500">Sponsors categorized by tier. Displayed on public pages.</p>
        </div>
        <button 
          onClick={() => onOpenModal("sponsor")}
          className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all hover:shadow duration-200 cursor-pointer"
        >
          <Plus size={16} /> Add Sponsor
        </button>
      </header>

      <div className="flex flex-col gap-6">
        {renderSponsorTierList("💎 Diamond Tier", "diamond", "text-sky-500")}
        {renderSponsorTierList("🥇 Gold Tier", "gold", "text-amber-500")}
        {renderSponsorTierList("🥈 Silver Tier", "silver", "text-slate-450")}
      </div>
    </div>
  );
}

// 6. EVENT EXHIBITORS VIEW
function ExhibitorsView({ state, onUpdateState, onOpenModal }) {
  const { exhibitors } = state;

  const handleDelete = (id) => {
    if (confirm("Remove this exhibitor?")) {
      onUpdateState("exhibitors", exhibitors.filter(e => e.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <header className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Event Exhibitors</h2>
          <p className="text-sm text-slate-500">Manage booths and exhibitors present at the venue.</p>
        </div>
        <button 
          onClick={() => onOpenModal("exhibitor")}
          className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all hover:shadow duration-200 cursor-pointer"
        >
          <Plus size={16} /> Add Exhibitor
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exhibitors.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-400">No exhibitors registered yet.</div>
        ) : (
          exhibitors.map(e => (
            <div key={e.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative group">
              <div className="flex justify-between items-start mb-4">
                {e.logo ? (
                  <img src={e.logo} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-inner" alt={e.name} />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 font-extrabold text-xl flex items-center justify-center select-none">
                    🎪
                  </div>
                )}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => onOpenModal("exhibitor", e)}
                    className="p-1.5 hover:text-indigo-600 text-slate-400 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all duration-200 cursor-pointer"
                    title="Edit Exhibitor"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(e.id)}
                    className="p-1.5 hover:text-rose-600 text-slate-400 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all duration-200 cursor-pointer"
                    title="Remove Exhibitor"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-md font-bold text-slate-800 mb-4">{e.name}</h3>

              <div className="border-t border-slate-100 pt-4 flex flex-col gap-2 text-[11px] font-semibold text-slate-500 leading-normal">
                <span className="flex items-center gap-2"><Briefcase size={13} className="text-slate-400 shrink-0" /> Booth: <strong className="text-slate-700">{e.booth || "Not Assigned"}</strong></span>
                <span className="flex items-center gap-2"><Users size={13} className="text-slate-400 shrink-0" /> Staff Contact: <strong className="text-slate-700">{e.contact}</strong></span>
                {e.email && (
                  <span className="flex items-center gap-2"><Mail size={13} className="text-slate-400 shrink-0" /> Email: <strong className="text-slate-700">{e.email}</strong></span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 7. SPEAKERS DIRECTORY VIEW
function SpeakersDirectoryView({ state, onUpdateState }) {
  const { sessions, attendees = [] } = state;
  const [selectedAttendeeId, setSelectedAttendeeId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Extract unique speakers/moderators dynamically from sessions + attendees marked as speaker
  const directory = [];
  const seenNames = new Set();

  sessions.forEach(session => {
    (session.speakers || []).forEach(s => {
      if (!seenNames.has(s.name)) {
        seenNames.add(s.name);
        directory.push({ name: s.name, image: s.image, role: "speaker", sessionsCount: 1 });
      } else {
        const match = directory.find(x => x.name === s.name);
        if (match) match.sessionsCount++;
      }
    });

    (session.moderators || []).forEach(m => {
      if (!seenNames.has(m.name)) {
        seenNames.add(m.name);
        directory.push({ name: m.name, image: m.image, role: "moderator", sessionsCount: 1 });
      } else {
        const match = directory.find(x => x.name === m.name);
        if (match) match.sessionsCount++;
      }
    });
  });

  // Include attendees marked as speakers
  attendees.forEach(a => {
    if (a.isSpeaker && !seenNames.has(a.name)) {
      seenNames.add(a.name);
      directory.push({ name: a.name, image: a.image, role: "speaker", sessionsCount: 0 });
    }
  });

  const handleAddSpeakerSubmit = (e) => {
    e.preventDefault();
    if (!selectedAttendeeId) {
      alert("Please select an attendee.");
      return;
    }

    const attendee = attendees.find(a => String(a.id) === selectedAttendeeId);
    if (!attendee) return;

    // 1. If a session is chosen, assign to it
    if (selectedSessionId) {
      const session = sessions.find(s => String(s.id) === selectedSessionId);
      if (session) {
        const updatedSpeakers = [...(session.speakers || [])];
        if (!updatedSpeakers.find(sp => sp.name === attendee.name)) {
          updatedSpeakers.push({
            id: Date.now(),
            name: attendee.name,
            image: attendee.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name)}&background=random`
          });

          const updatedSessions = sessions.map(s => String(s.id) === selectedSessionId ? { ...s, speakers: updatedSpeakers } : s);
          onUpdateState("sessions", updatedSessions);
          
          // Also mark attendee isSpeaker globally
          const updatedAttendees = attendees.map(a => String(a.id) === selectedAttendeeId ? { ...a, isSpeaker: true } : a);
          onUpdateState("attendees", updatedAttendees);

          alert(`Successfully added ${attendee.name} as a speaker to "${session.title}"!`);
          setShowAddForm(false);
          setSelectedAttendeeId("");
          setSelectedSessionId("");
        } else {
          alert(`${attendee.name} is already a speaker in this session.`);
        }
      }
    } else {
      // 2. No session chosen, mark attendee as speaker globally
      const updatedAttendees = attendees.map(a => String(a.id) === selectedAttendeeId ? { ...a, isSpeaker: true } : a);
      onUpdateState("attendees", updatedAttendees);
      alert(`Successfully added ${attendee.name} to the Speakers Directory!`);
      setShowAddForm(false);
      setSelectedAttendeeId("");
      setSelectedSessionId("");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <header className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Speakers & Moderators</h2>
          <p className="text-sm text-slate-500">List of all experts speaking or moderating sessions. Gathered dynamically from your timeline.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all hover:shadow duration-200 cursor-pointer"
        >
          <Plus size={16} /> Add Speaker
        </button>
      </header>

      {showAddForm && (
        <form onSubmit={handleAddSpeakerSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-4 items-end animate-fade-in">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Select Attendee</label>
            <select
              value={selectedAttendeeId}
              onChange={(e) => setSelectedAttendeeId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-850 outline-none focus:border-indigo-650"
            >
              <option value="">-- Choose Attendee --</option>
              {attendees.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.company || "Guest"})</option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Select Session (Optional)</label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-850 outline-none focus:border-indigo-650"
            >
              <option value="">-- Assign Later --</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-indigo-650 hover:bg-indigo-750 text-white font-semibold py-3 px-5 rounded-xl text-xs transition-all hover:shadow cursor-pointer"
          >
            Assign Speaker
          </button>
        </form>
      )}

      {directory.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200 rounded-3xl gap-4 text-slate-400">
          <Mic size={54} className="opacity-30" />
          <p className="text-sm">No speakers detected. Add speakers to your timeline sessions to populate this directory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {directory.map((s, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex gap-4 items-center">
              <img src={s.image} className="w-16 h-16 rounded-full object-cover shrink-0 border border-slate-100" alt="" />
              <div className="flex flex-col gap-1 min-w-0 leading-tight">
                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] w-fit uppercase ${s.role === 'speaker' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'}`}>
                  {s.role}
                </span>
                <h3 className="text-sm font-bold text-slate-800 truncate mt-1">{s.name}</h3>
                <span className="text-[10px] text-slate-450 font-semibold uppercase">Speaking in {s.sessionsCount} session{s.sessionsCount > 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 8. TICKETS VIEW
function TicketsView({ state, onUpdateState, onOpenModal }) {
  const { tickets, attendees } = state;

  const handleDelete = (id) => {
    if (confirm("Remove this ticket tier?")) {
      onUpdateState("tickets", tickets.filter(t => t.id !== id));
    }
  };

  const totalCap = tickets.reduce((sum, t) => sum + (t.maxQty || 100), 0);
  const totalSold = attendees.length;
  const totalSoldPct = totalCap > 0 ? (totalSold / totalCap) * 100 : 0;

  const totalRev = attendees.reduce((sum, a) => {
    const matchingTicket = tickets.find(t => t.name === a.ticketType);
    return sum + (matchingTicket ? matchingTicket.price : 0);
  }, 0);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tickets & Pricing</h2>
          <p className="text-sm text-slate-500">Manage ticket tiers, prices, availability, and sales performance.</p>
        </div>
        <button 
          onClick={() => onOpenModal("ticket")}
          className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all hover:shadow duration-200 cursor-pointer"
        >
          <Plus size={16} /> Add Ticket Tier
        </button>
      </header>

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tickets Sold</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">{totalSold} <span className="text-sm font-semibold text-slate-400">/ {totalCap}</span></div>
          </div>
          <div className="mt-4">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${totalSoldPct}%` }}></div>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">{totalSoldPct.toFixed(1)}% capacity filled</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket Revenue</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">${totalRev.toLocaleString()}</div>
          </div>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-4">
            ↑ 15% clean conversion
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Tiers</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">{tickets.length}</div>
          </div>
          <span className="text-[10px] text-slate-450 font-semibold mt-4">
            {tickets.map(t => t.name).join(', ')}
          </span>
        </div>
      </div>

      {/* Ticket Tiers list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((t, i) => {
          const tierSold = attendees.filter(a => a.ticketType === t.name).length;
          return (
            <div key={t.id} className={`bg-white border-2 rounded-3xl p-8 flex flex-col gap-6 relative shadow-sm hover:shadow-lg transition-all duration-300 ${i === 1 ? 'border-indigo-650 bg-gradient-to-b from-white to-slate-50/20' : 'border-slate-200'}`}>
              {i === 1 && (
                <span className="absolute top-6 right-6 bg-indigo-650 text-white text-[9px] font-extrabold uppercase py-1 px-3 rounded-full">
                  Best Seller
                </span>
              )}
              
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t.name}</h3>
                <div className="text-3xl font-extrabold text-slate-900 mt-3">${t.price} <span className="text-xs font-semibold text-slate-400">/ ticket</span></div>
              </div>

              <ul className="flex flex-col gap-2.5 text-xs text-slate-500 font-semibold border-t border-slate-100 pt-5">
                {(t.features || []).map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-600 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto border-t border-slate-100 pt-5 flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Sold: {tierSold} / {t.maxQty}</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onOpenModal("ticket", t)}
                    className="text-indigo-650 hover:text-indigo-800 font-bold transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <span className="text-slate-200">|</span>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="text-slate-400 hover:text-rose-500 font-bold transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 9. CHECK IN VIEW
function CheckInView({ state, onUpdateState }) {
  const { attendees } = state;
  const [search, setSearch] = useState("");

  const handleToggle = (id) => {
    const updated = attendees.map(a => {
      if (a.id === id) {
        const isCheckedIn = a.status === "checked-in";
        return {
          ...a,
          status: isCheckedIn ? "registered" : "checked-in",
          checkinTime: isCheckedIn ? null : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return a;
    });
    onUpdateState("attendees", updated);
  };

  const totalCount = attendees.length;
  const checkedInCount = attendees.filter(a => a.status === 'checked-in').length;
  const pct = totalCount > 0 ? (checkedInCount / totalCount) * 100 : 0;

  const filtered = attendees.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <header className="select-none">
        <h2 className="text-2xl font-bold text-slate-900">Check In Dashboard</h2>
        <p className="text-sm text-slate-500">Track live attendee check-ins at the door.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Attendance</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">{checkedInCount} <span className="text-sm font-semibold text-slate-400">/ {totalCount}</span></div>
          </div>
          <div className="mt-4">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1.5 block">{pct.toFixed(1)}% checked in</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-In Speed</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">12 / min</div>
          </div>
          <span className="text-[10px] text-emerald-500 font-semibold mt-4">
            Peak hour check-in active
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-150 bg-slate-50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search attendees by name to check them in..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-650"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs font-medium text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
                <th className="py-4 px-6">Attendee</th>
                <th className="py-4 px-6">Ticket Type</th>
                <th className="py-4 px-6">Check-in Status</th>
                <th className="py-4 px-6">Check-in Time</th>
                <th className="py-4 px-6 w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-slate-400 py-12">No attendees registered yet.</td>
                </tr>
              ) : (
                filtered.map(a => {
                  const isCheckedIn = a.status === "checked-in";
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                      <td className="py-4 px-6 font-semibold flex items-center gap-3">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=random`} 
                          className="w-8 h-8 rounded-full object-cover" 
                          alt="" 
                        />
                        <span className="text-slate-850 font-bold">{a.name}</span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-650">{a.ticketType}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isCheckedIn ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 font-bold">{a.checkinTime || "-"}</td>
                      <td className="py-4 px-6">
                        <button 
                          onClick={() => handleToggle(a.id)}
                          className={`font-semibold py-1.5 px-4 rounded-xl text-[11px] shadow-sm transition-all duration-200 cursor-pointer ${isCheckedIn ? 'bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600' : 'bg-indigo-650 hover:bg-indigo-700 text-white'}`}
                        >
                          {isCheckedIn ? 'Check Out' : 'Check In'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 10. MY TEAM VIEW
function MyTeamView({ state, onUpdateState, onOpenModal }) {
  const { team } = state;

  const handleDelete = (id) => {
    if (confirm("Remove this staff member?")) {
      onUpdateState("team", team.filter(t => t.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Event Team</h2>
          <p className="text-sm text-slate-500">Invite and manage collaboration permissions for event staff.</p>
        </div>
        <button 
          onClick={() => onOpenModal("team")}
          className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all hover:shadow duration-200 cursor-pointer"
        >
          <Plus size={16} /> Add Member
        </button>
      </header>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs font-semibold text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {team.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                  <td className="py-4 px-6 font-bold text-slate-800">{t.name}</td>
                  <td className="py-4 px-6 font-bold text-indigo-650">{t.role}</td>
                  <td className="py-4 px-6 text-slate-500">{t.email}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${t.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center flex items-center justify-center gap-1">
                    <button 
                      onClick={() => onOpenModal("team", t)}
                      className="p-1.5 hover:text-indigo-650 text-slate-400 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all cursor-pointer"
                      title="Edit Member"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 hover:text-rose-600 text-slate-400 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all cursor-pointer"
                      title="Remove Member"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 11. ANALYTICS VIEW
function AnalyticsView({ state }) {
  const { attendees, tickets } = state;

  const totalAttendees = attendees.length;
  const standardCount = attendees.filter(a => a.ticketType === "Standard Admission").length;
  const vipCount = attendees.filter(a => a.ticketType === "VIP Access Pass").length;
  const onlineCount = attendees.filter(a => a.ticketType === "Online Only").length;

  const standardPct = totalAttendees > 0 ? (standardCount / totalAttendees) * 100 : 0;
  const vipPct = totalAttendees > 0 ? (vipCount / totalAttendees) * 100 : 0;
  const onlinePct = totalAttendees > 0 ? (onlineCount / totalAttendees) * 100 : 0;

  const checkedInCount = attendees.filter(a => a.status === 'checked-in').length;
  const checkinPct = totalAttendees > 0 ? (checkedInCount / totalAttendees) * 100 : 0;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <header className="select-none">
        <h2 className="text-2xl font-bold text-slate-900">Event Analytics</h2>
        <p className="text-sm text-slate-500">Monitor registrations velocity, ticket splits, and attendance engagement charts.</p>
      </header>

      {/* Analytics split columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col gap-6">
          <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
            <BarChart4 size={18} className="text-indigo-650" />
            Daily Registration Velocity
          </h3>
          <div className="relative w-full h-[180px] mt-2">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="an-chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25"></stop>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00"></stop>
                </linearGradient>
              </defs>
              <polyline fill="url(#an-chart-grad)" stroke="none" points="0,200 50,150 100,160 150,110 200,90 250,120 300,70 350,50 400,60 450,20 500,10 500,200"></polyline>
              <polyline fill="none" stroke="#6366f1" strokeWidth="3.5" points="0,200 50,150 100,160 150,110 200,90 250,120 300,70 350,50 400,60 450,20 500,10"></polyline>
              <circle cx="50" cy="150" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5"></circle>
              <circle cx="150" cy="110" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5"></circle>
              <circle cx="250" cy="120" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5"></circle>
              <circle cx="350" cy="50" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5"></circle>
              <circle cx="450" cy="20" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5"></circle>
            </svg>
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-450 px-1">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col gap-6">
          <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
            <Ticket size={18} className="text-indigo-650" />
            Registration Split by Ticket Type
          </h3>
          <div className="flex flex-col gap-4 justify-center flex-1">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Standard Admission ({standardPct.toFixed(1)}%)</span>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${standardPct}%` }}></div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500">VIP Access ({vipPct.toFixed(1)}%)</span>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${vipPct}%` }}></div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Online Only ({onlinePct.toFixed(1)}%)</span>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${onlinePct}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics stats metrics bottom */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion Rate</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">3.4%</div>
          </div>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-4">
            ↑ 0.5% compared to last event
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Ticket Price</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">$204</div>
          </div>
          <span className="text-[10px] text-slate-450 mt-4">
            Based on active standard & VIP tiers
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-in Rate</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">{checkinPct.toFixed(1)}%</div>
          </div>
          <span className="text-[10px] text-rose-500 font-semibold mt-4">
            ↓ 2% compared to last event
          </span>
        </div>
      </div>
    </div>
  );
}

// 12. COMMUNICATIONS VIEW
import { logCommunication, fetchCommunications } from "../lib/db";

function CommunicationsView({ state, onUpdateState }) {
  const { attendees, exhibitors, team } = state;
  const [recipientGroup, setRecipientGroup] = useState("all"); // "all" | "attendees" | "exhibitors" | "team"
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Fetch communications history
  React.useEffect(() => {
    fetchCommunications()
      .then((data) => setHistory(data))
      .catch((err) => console.error("Error loading communications history:", err))
      .finally(() => setHistoryLoading(false));
  }, []);

  const getRecipientEmails = () => {
    switch (recipientGroup) {
      case "attendees":
        return attendees.map(a => a.email).filter(Boolean);
      case "exhibitors":
        return exhibitors.map(e => e.email).filter(Boolean);
      case "team":
        return team.map(t => t.email).filter(Boolean);
      case "all":
      default: {
        const allEmails = [
          ...attendees.map(a => a.email),
          ...exhibitors.map(e => e.email),
          ...team.map(t => t.email)
        ];
        return Array.from(new Set(allEmails)).filter(Boolean);
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;

    const emails = getRecipientEmails();
    if (emails.length === 0) {
      alert(`There are no valid email addresses in the "${recipientGroup}" recipient group.`);
      return;
    }

    setIsSending(true);
    try {
      // Log the communication in the Supabase db
      const newComm = await logCommunication({
        subject: subject.trim(),
        body: body.trim(),
        recipientCount: emails.length
      });

      // Update local history state
      setHistory(prev => [newComm, ...prev]);

      setSubject("");
      setBody("");
      alert(`Successfully simulated sending event announcement to ${emails.length} recipients!`);
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to record communication in the database.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-10">
      <header className="select-none">
        <h2 className="text-2xl font-bold text-slate-900">Announcements & Communications</h2>
        <p className="text-sm text-slate-500">Contact all attendees, exhibitors, or staff members of the event with direct email broadcasts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left pane: Broadcast Form */}
        <div className="lg:col-span-2 bg-white border border-slate-250/60 rounded-3xl p-6.5 shadow-sm flex flex-col gap-6">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Mail size={16} className="text-indigo-600" />
            Send New Broadcast Announcement
          </h3>

          <form onSubmit={handleSend} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Recipient Group</label>
              <select
                value={recipientGroup}
                onChange={(e) => setRecipientGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-indigo-400 focus:outline-none rounded-xl text-xs font-semibold bg-white"
              >
                <option value="all">Everyone (All Attendees, Exhibitors & Team Members)</option>
                <option value="attendees">All Registered Attendees Only ({attendees.length})</option>
                <option value="exhibitors">All Registered Exhibitors Only ({exhibitors.length})</option>
                <option value="team">My Organizer Team & Staff Only ({team.length})</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Subject Line</label>
              <input
                type="text"
                required
                placeholder="e.g. Schedule update or venue directions"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-indigo-400 focus:outline-none rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Message Content</label>
              <textarea
                rows={7}
                required
                placeholder="Write your email body here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-indigo-400 focus:outline-none rounded-xl text-xs font-semibold resize-none"
              />
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3 mt-1 select-none">
              <Mail size={16} className="text-indigo-650 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-indigo-950">Broadcast details</span>
                <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                  This will broadcast to approximately <strong className="text-indigo-600">{getRecipientEmails().length}</strong> unique email addresses.
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-indigo-650 hover:bg-indigo-750 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 hover:shadow hover:-translate-y-0.5 transition-all select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSending ? (
                <>Simulating Broadcast...</>
              ) : (
                <>
                  <Mail size={14} />
                  Send Broadcast Announcement
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right pane: Sent History list */}
        <div className="bg-white border border-slate-250/60 rounded-3xl p-6.5 shadow-sm flex flex-col gap-5">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Broadcast History
          </h3>

          <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
            {historyLoading ? (
              <div className="text-xs font-semibold text-slate-400 text-center py-6">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="text-xs font-semibold text-slate-400 text-center py-6">No announcements sent yet.</div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="border border-slate-100 rounded-xl p-3.5 hover:bg-slate-50/50 transition-colors flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold text-indigo-650 bg-indigo-50/50 px-2 py-0.5 rounded-full">
                      {item.recipient_count || 0} Recipients
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400">
                      {item.sent_at ? new Date(item.sent_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-850 truncate">{item.subject}</h4>
                  <p className="text-[10px] font-semibold text-slate-500 line-clamp-3 whitespace-pre-wrap">{item.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


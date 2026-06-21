"use client";

import React from "react";
import { Users, CheckCircle2, DollarSign, Calendar, Zap, Plus, ArrowRight, UserPlus, Map } from "lucide-react";

export default function Overview({ 
  eventDetails, 
  attendees, 
  sessions, 
  tickets, 
  onSwitchView,
  onOpenModal
}) {
  // Calculate dashboard statistics
  const totalAttendees = attendees.length;
  const checkedInCount = attendees.filter(a => a.status === 'checked-in').length;
  const checkinPct = totalAttendees > 0 ? (checkedInCount / totalAttendees) * 100 : 0;
  
  const totalRev = attendees.reduce((sum, a) => {
    const matchingTicket = tickets.find(t => t.name === a.ticketType);
    return sum + (matchingTicket ? matchingTicket.price : 0);
  }, 0);

  // Get next 2 upcoming sessions sorted by date and time
  const upcomingSessions = [...sessions]
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA - dateB;
    })
    .slice(0, 2);

  const formatDateLabel = (dateStr) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const getDayNum = (dateStr) => {
    return new Date(dateStr).getDate();
  };

  const getMonthStr = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' });
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-2">
      {/* Header Info */}
      <header className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{eventDetails.title}</h2>
        <p className="text-slate-500 font-medium flex items-center gap-2">
          <span>📍 {eventDetails.location}</span>
          <span className="text-slate-300">|</span>
          <span>📅 {formatDateLabel(eventDetails.startDate)} - {formatDateLabel(eventDetails.endDate)} ({eventDetails.type})</span>
        </p>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Registered Attendees</span>
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Users size={20} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{totalAttendees}</div>
          </div>
          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1 mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Registration Active
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Live Check-ins</span>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{checkedInCount} <span className="text-sm font-medium text-slate-400">/ {totalAttendees}</span></div>
          </div>
          <div className="mt-4">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${checkinPct}%` }}></div>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1.5 block">{checkinPct.toFixed(1)}% checked in</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Tiers Revenue</span>
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800">${totalRev.toLocaleString()}</div>
          </div>
          <span className="text-xs font-medium text-slate-400 mt-4">
            Standard & VIP tier split
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Scheduled Sessions</span>
              <div className="p-2 bg-violet-50 rounded-xl text-violet-600">
                <Calendar size={20} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{sessions.length}</div>
          </div>
          <span className="text-xs font-medium text-slate-400 mt-4">
            Distributed across event days
          </span>
        </div>
      </div>

      {/* Analytics split: Registration Daily Growth & Upcoming sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Registration Daily Growth</h3>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">This Week</span>
          </div>
          <div className="relative w-full h-[200px] mt-2">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0b5cdb" stopOpacity="0.25"></stop>
                  <stop offset="100%" stopColor="#0b5cdb" stopOpacity="0.00"></stop>
                </linearGradient>
              </defs>
              {/* Shaded Area */}
              <polyline 
                fill="url(#chart-grad)" 
                stroke="none" 
                points="0,200 50,150 100,160 150,110 200,90 250,120 300,70 350,50 400,60 450,20 500,10 500,200"
              />
              {/* Path Line */}
              <polyline 
                fill="none" 
                stroke="#0b5cdb" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,200 50,150 100,160 150,110 200,90 250,120 300,70 350,50 400,60 450,20 500,10"
              />
              {/* Data points */}
              <circle cx="50" cy="150" r="4.5" fill="#0b5cdb" stroke="#ffffff" strokeWidth="1.5"></circle>
              <circle cx="150" cy="110" r="4.5" fill="#0b5cdb" stroke="#ffffff" strokeWidth="1.5"></circle>
              <circle cx="250" cy="120" r="4.5" fill="#0b5cdb" stroke="#ffffff" strokeWidth="1.5"></circle>
              <circle cx="350" cy="50" r="4.5" fill="#0b5cdb" stroke="#ffffff" strokeWidth="1.5"></circle>
              <circle cx="450" cy="20" r="4.5" fill="#0b5cdb" stroke="#ffffff" strokeWidth="1.5"></circle>
            </svg>
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-400 px-1">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
          <h3 className="text-lg font-bold text-slate-800">Upcoming Timeline Sessions</h3>
          <div className="flex flex-col gap-4 flex-1">
            {upcomingSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-12 text-slate-400 text-sm gap-2">
                <Calendar size={32} className="opacity-40" />
                <p>No upcoming sessions scheduled.</p>
              </div>
            ) : (
              upcomingSessions.map(session => (
                <div key={session.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors duration-250 items-center">
                  <div className="bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl py-2 px-3 flex flex-col items-center justify-center text-center font-bold min-w-[70px] shrink-0">
                    <span className="text-[10px] uppercase tracking-wide opacity-80">{getMonthStr(session.date)}</span>
                    <span className="text-lg leading-none">{getDayNum(session.date)}</span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate leading-snug">{session.title}</h4>
                    <p className="text-xs text-slate-500 truncate">🕒 {session.startTime} - {session.endTime}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                      {session.speakers.map(s => s.name).join(', ')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-slate-50 rounded-3xl p-8 border border-dashed border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Zap size={20} className="text-amber-500 fill-amber-500" />
          Event Quick Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <button 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 rounded-2xl transition-all shadow-sm shadow-indigo-100 hover:shadow-lg hover:-translate-y-0.5 duration-250 cursor-pointer"
            onClick={() => onSwitchView("calendar")}
          >
            <Calendar size={18} />
            Edit Calendar
            <ArrowRight size={16} />
          </button>
          
          <button 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-750 text-white font-semibold px-6 py-3.5 rounded-2xl transition-all shadow-sm shadow-emerald-100 hover:shadow-lg hover:-translate-y-0.5 duration-250 cursor-pointer"
            onClick={() => onSwitchView("check-in")}
          >
            <CheckCircle2 size={18} />
            Live Door Check-In
          </button>

          <button 
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-6 py-3.5 rounded-2xl transition-all hover:bg-slate-50 hover:-translate-y-0.5 duration-250 cursor-pointer"
            onClick={() => onOpenModal("attendee")}
          >
            <UserPlus size={18} className="text-slate-450" />
            Add New Attendee
          </button>

          <button 
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-6 py-3.5 rounded-2xl transition-all hover:bg-slate-50 hover:-translate-y-0.5 duration-250 cursor-pointer"
            onClick={() => onSwitchView("floor-plan")}
          >
            <Map size={18} className="text-slate-450" />
            Edit Floor Plan
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Map, Plus, Edit3, Copy, Trash2, Grid, LayoutGrid,
  Clock, Layers, ChevronRight, AlertTriangle
} from "lucide-react";

// Thumbnail preview: mini SVG representation of element counts
function PlanThumbnail({ plan }) {
  const count = plan.elements?.length ?? 0;
  const hasBlueprint = !!plan.blueprint?.url;

  return (
    <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-200 group-hover:border-indigo-200 transition-colors duration-200">
      {hasBlueprint ? (
        // Blueprint image thumbnail
        <img
          src={plan.blueprint.url}
          alt="Blueprint"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      ) : (
        // Grid pattern background
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />
      )}

      {/* Element dots */}
      {count > 0 && (
        <div className="absolute inset-0 p-4">
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: Math.min(count, 24) }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm bg-indigo-400/60 border border-indigo-500/40"
                style={{
                  width: 8 + Math.random() * 12,
                  height: 8 + Math.random() * 10,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Center icon if empty */}
      {count === 0 && !hasBlueprint && (
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Grid size={28} />
          <span className="text-[10px] font-semibold uppercase tracking-wider">Empty canvas</span>
        </div>
      )}

      {/* Element count badge */}
      {count > 0 && (
        <div className="absolute top-2.5 right-2.5 bg-indigo-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
          {count} element{count !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

// Inline editable plan name
function EditableName({ name, onRename }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  const commit = () => {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) {
      onRename(trimmed);
    } else {
      setValue(name);
    }
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setValue(name); setEditing(false); }
        }}
        className="text-sm font-bold text-slate-800 bg-indigo-50 border border-indigo-300 rounded-lg px-2 py-0.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <h3
      className="text-sm font-bold text-slate-800 truncate cursor-text hover:text-indigo-650 transition-colors"
      title="Double-click to rename"
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
    >
      {name}
    </h3>
  );
}

// Format date nicely
function formatDate(isoString) {
  if (!isoString) return "Unknown date";
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Single floor plan card
function PlanCard({ plan, onEdit, onDuplicate, onDelete, onRename }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col">
      {/* Thumbnail */}
      <div
        className="cursor-pointer"
        onClick={() => onEdit(plan.id)}
      >
        <PlanThumbnail plan={plan} />
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <EditableName name={plan.name} onRename={(n) => onRename(plan.id, n)} />
        </div>

        <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {formatDate(plan.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Layers size={10} />
            {plan.elements?.length ?? 0} items
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <button
            onClick={() => onEdit(plan.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
          >
            <Edit3 size={13} />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onDuplicate(plan.id)}
            className="p-2 border border-slate-200 hover:border-indigo-200 hover:text-indigo-650 rounded-xl text-slate-500 transition-all duration-200 cursor-pointer"
            title="Duplicate this floor plan"
          >
            <Copy size={14} />
          </button>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onDelete(plan.id); setShowDeleteConfirm(false); }}
                className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors cursor-pointer"
                title="Confirm delete"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="p-2 border border-slate-200 hover:border-slate-300 text-slate-400 rounded-xl transition-colors cursor-pointer text-[10px] font-bold"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 border border-slate-200 hover:border-rose-200 hover:text-rose-500 rounded-xl text-slate-500 transition-all duration-200 cursor-pointer"
              title="Delete this floor plan"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FloorPlanGallery({
  floorPlans,
  onEdit,
  onCreateNew,
  onDuplicate,
  onDelete,
  onRename,
}) {
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <Map size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Floor Plans</h1>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {floorPlans.length === 0
                  ? "No floor plans yet — create your first one below"
                  : `${floorPlans.length} plan${floorPlans.length !== 1 ? "s" : ""} · Double-click a name to rename`}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={16} />
          <span>New Floor Plan</span>
        </button>
      </div>

      {/* Empty state */}
      {floorPlans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-3xl gap-6">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center">
            <LayoutGrid size={36} className="text-indigo-400" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-lg font-bold text-slate-700">No floor plans yet</h2>
            <p className="text-xs font-semibold text-slate-400 max-w-xs">
              Create your first venue floor plan to start designing your event layout with booths, stages, and more.
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create First Floor Plan</span>
          </button>
        </div>
      )}

      {/* Plans grid */}
      {floorPlans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {floorPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))}

          {/* Quick-add card */}
          <button
            onClick={onCreateNew}
            className="min-h-[220px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors duration-200">
              <Plus size={22} className="transition-colors duration-200" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">New Floor Plan</span>
          </button>
        </div>
      )}
    </div>
  );
}

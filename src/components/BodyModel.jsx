import { useState } from "react";
import { RotateCcw } from "lucide-react";

/**
 * Interactive human body diagram for symptom body-area selection.
 * Features front/back view, hover highlights, and click-to-select zones.
 */

/* ── Zone → Body Area mapping ── */
const ZONE_MAP = {
  head: "Head / Face",
  eyes: "Eyes",
  throat: "Ears / Nose / Throat",
  chest: "Chest / Lungs",
  heart: "Heart / Cardiovascular",
  abdomen: "Abdomen / Stomach",
  upperBack: "Back / Spine",
  lowerBack: "Back / Spine",
  skin: "Skin",
  leftArm: "Arms / Hands",
  rightArm: "Arms / Hands",
  leftHand: "Arms / Hands",
  rightHand: "Arms / Hands",
  leftLeg: "Legs / Feet",
  rightLeg: "Legs / Feet",
  leftFoot: "Legs / Feet",
  rightFoot: "Legs / Feet",
  pelvis: "Urinary / Reproductive",
};

/* ── Zone definitions with SVG paths ── */

const FRONT_ZONES = [
  {
    id: "head",
    label: "Head / Face",
    // Head oval
    d: "M148,28 C148,12 162,2 180,2 C198,2 212,12 212,28 L212,58 C212,74 198,84 180,84 C162,84 148,74 148,58 Z",
  },
  {
    id: "throat",
    label: "Ears / Nose / Throat",
    // Neck
    d: "M168,84 L192,84 L196,115 L164,115 Z",
  },
  {
    id: "chest",
    label: "Chest / Lungs",
    // Upper torso
    d: "M126,115 L234,115 L238,180 L122,180 Z",
  },
  {
    id: "abdomen",
    label: "Abdomen / Stomach",
    // Mid torso
    d: "M122,180 L238,180 L234,250 L126,250 Z",
  },
  {
    id: "pelvis",
    label: "Urinary / Reproductive",
    // Pelvis area
    d: "M126,250 L234,250 L218,290 L142,290 Z",
  },
  {
    id: "leftArm",
    label: "Arms / Hands",
    // Left arm (viewer's left = body's right)
    d: "M234,115 L260,118 L278,200 L270,260 L254,256 L246,200 L238,180 Z",
  },
  {
    id: "rightArm",
    label: "Arms / Hands",
    // Right arm
    d: "M126,115 L100,118 L82,200 L90,260 L106,256 L114,200 L122,180 Z",
  },
  {
    id: "leftHand",
    label: "Arms / Hands",
    // Left hand
    d: "M270,260 L278,290 L274,310 L264,308 L268,290 L260,310 L252,308 L256,288 L250,306 L244,302 L248,284 L254,256 Z",
  },
  {
    id: "rightHand",
    label: "Arms / Hands",
    // Right hand
    d: "M90,260 L82,290 L86,310 L96,308 L92,290 L100,310 L108,308 L104,288 L110,306 L116,302 L112,284 L106,256 Z",
  },
  {
    id: "leftLeg",
    label: "Legs / Feet",
    // Left leg
    d: "M180,290 L218,290 L216,370 L212,440 L192,440 L188,370 Z",
  },
  {
    id: "rightLeg",
    label: "Legs / Feet",
    // Right leg
    d: "M142,290 L180,290 L172,370 L168,440 L148,440 L144,370 Z",
  },
  {
    id: "leftFoot",
    label: "Legs / Feet",
    // Left foot
    d: "M192,440 L212,440 L218,460 L220,475 L190,475 L188,460 Z",
  },
  {
    id: "rightFoot",
    label: "Legs / Feet",
    // Right foot
    d: "M148,440 L168,440 L172,460 L170,475 L140,475 L142,460 Z",
  },
];

const BACK_ZONES = [
  {
    id: "head",
    label: "Head / Face",
    d: "M148,28 C148,12 162,2 180,2 C198,2 212,12 212,28 L212,58 C212,74 198,84 180,84 C162,84 148,74 148,58 Z",
  },
  {
    id: "throat",
    label: "Ears / Nose / Throat",
    d: "M168,84 L192,84 L196,115 L164,115 Z",
  },
  {
    id: "upperBack",
    label: "Back / Spine",
    d: "M126,115 L234,115 L238,180 L122,180 Z",
  },
  {
    id: "lowerBack",
    label: "Back / Spine",
    d: "M122,180 L238,180 L234,250 L126,250 Z",
  },
  {
    id: "pelvis",
    label: "Urinary / Reproductive",
    d: "M126,250 L234,250 L218,290 L142,290 Z",
  },
  {
    id: "leftArm",
    label: "Arms / Hands",
    d: "M234,115 L260,118 L278,200 L270,260 L254,256 L246,200 L238,180 Z",
  },
  {
    id: "rightArm",
    label: "Arms / Hands",
    d: "M126,115 L100,118 L82,200 L90,260 L106,256 L114,200 L122,180 Z",
  },
  {
    id: "leftHand",
    label: "Arms / Hands",
    d: "M270,260 L278,290 L274,310 L264,308 L268,290 L260,310 L252,308 L256,288 L250,306 L244,302 L248,284 L254,256 Z",
  },
  {
    id: "rightHand",
    label: "Arms / Hands",
    d: "M90,260 L82,290 L86,310 L96,308 L92,290 L100,310 L108,308 L104,288 L110,306 L116,302 L112,284 L106,256 Z",
  },
  {
    id: "leftLeg",
    label: "Legs / Feet",
    d: "M180,290 L218,290 L216,370 L212,440 L192,440 L188,370 Z",
  },
  {
    id: "rightLeg",
    label: "Legs / Feet",
    d: "M142,290 L180,290 L172,370 L168,440 L148,440 L144,370 Z",
  },
  {
    id: "leftFoot",
    label: "Legs / Feet",
    d: "M192,440 L212,440 L218,460 L220,475 L190,475 L188,460 Z",
  },
  {
    id: "rightFoot",
    label: "Legs / Feet",
    d: "M148,440 L168,440 L172,460 L170,475 L140,475 L142,460 Z",
  },
];

/* ── Zone colors ── */
const ZONE_COLORS = {
  "Head / Face": { fill: "#818CF8", glow: "#6366F1" },
  Eyes: { fill: "#818CF8", glow: "#6366F1" },
  "Ears / Nose / Throat": { fill: "#A78BFA", glow: "#7C3AED" },
  "Chest / Lungs": { fill: "#2DD4BF", glow: "#14B8A6" },
  "Heart / Cardiovascular": { fill: "#F87171", glow: "#EF4444" },
  "Abdomen / Stomach": { fill: "#FBBF24", glow: "#F59E0B" },
  "Back / Spine": { fill: "#60A5FA", glow: "#3B82F6" },
  Skin: { fill: "#FB923C", glow: "#F97316" },
  "Arms / Hands": { fill: "#34D399", glow: "#10B981" },
  "Legs / Feet": { fill: "#38BDF8", glow: "#0EA5E9" },
  "Urinary / Reproductive": { fill: "#F472B6", glow: "#EC4899" },
  "Mental Health": { fill: "#C084FC", glow: "#A855F7" },
  "General / Whole Body": { fill: "#94A3B8", glow: "#64748B" },
};

export default function BodyModel({ selectedAreas = [], onToggleArea, gender }) {
  const [view, setView] = useState("front"); // "front" | "back"
  const [hoveredZone, setHoveredZone] = useState(null);

  const zones = view === "front" ? FRONT_ZONES : BACK_ZONES;
  const hoveredLabel = hoveredZone
    ? ZONE_MAP[hoveredZone] || hoveredZone
    : null;

  const handleSelect = (zone) => {
    const areaName = ZONE_MAP[zone.id] || zone.label;
    onToggleArea(areaName);
  };

  const isZoneSelected = (zone) => {
    const areaName = ZONE_MAP[zone.id] || zone.label;
    return selectedAreas.includes(areaName);
  };

  const isZoneHovered = (zone) => {
    if (!hoveredZone) return false;
    const hoveredArea = ZONE_MAP[hoveredZone];
    const zoneArea = ZONE_MAP[zone.id];
    return hoveredArea === zoneArea;
  };

  return (
    <div className="flex flex-col items-center">
      {/* View toggle */}
      <div className="mb-4 flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setView("front")}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
              view === "front"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Front
          </button>
          <button
            onClick={() => setView("back")}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
              view === "back"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Back
          </button>
        </div>
        <button
          onClick={() => setView(view === "front" ? "back" : "front")}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
          title="Rotate"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Hover label */}
      <div className="mb-2 h-7">
        {hoveredLabel && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md"
            style={{
              backgroundColor: ZONE_COLORS[hoveredLabel]?.glow || "#64748B",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-white/50"
            />
            {hoveredLabel}
          </span>
        )}
      </div>

      {/* SVG Body */}
      <div className="relative">
        <svg
          viewBox="0 0 360 490"
          className="h-[420px] w-auto select-none sm:h-[460px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Glow filter for selected state */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Subtle shadow for body outline */}
            <filter id="bodyShadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#94A3B8" floodOpacity="0.15" />
            </filter>

            {/* Gradient for body fill */}
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>

            {/* Pulse animation for selected zones */}
            <radialGradient id="pulseGrad">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Body silhouette outline for visual context */}
          <g filter="url(#bodyShadow)" opacity="0.5">
            {/* Full body outline path */}
            <path
              d="M180,2 C198,2 212,12 212,28 L212,58 C212,74 198,84 192,84 L196,115 
                 L260,118 L278,200 L270,260 L278,290 L274,310 L264,308 L268,290 L260,310 
                 L252,308 L256,288 L250,306 L244,302 L248,284 L238,260 L238,180 L234,250 
                 L218,290 L216,370 L212,440 L218,460 L220,475 L190,475 L188,460 L192,440 
                 L188,370 L180,290 L172,370 L168,440 L172,460 L170,475 L140,475 L142,460 
                 L148,440 L144,370 L142,290 L126,250 L122,180 L122,260 L112,284 L116,302 
                 L110,306 L104,288 L108,308 L100,310 L92,290 L96,308 L86,310 L82,290 
                 L90,260 L82,200 L100,118 L164,115 L168,84 C162,84 148,74 148,58 
                 L148,28 C148,12 162,2 180,2 Z"
              fill="url(#bodyGrad)"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
          </g>

          {/* Clickable zones */}
          {zones.map((zone) => {
            const areaName = ZONE_MAP[zone.id] || zone.label;
            const colors = ZONE_COLORS[areaName] || {
              fill: "#94A3B8",
              glow: "#64748B",
            };
            const selected = isZoneSelected(zone);
            const hovered = isZoneHovered(zone);

            return (
              <g key={zone.id}>
                <path
                  d={zone.d}
                  fill={
                    selected
                      ? colors.fill
                      : hovered
                      ? `${colors.fill}88`
                      : "transparent"
                  }
                  stroke={
                    selected
                      ? colors.glow
                      : hovered
                      ? `${colors.fill}AA`
                      : "transparent"
                  }
                  strokeWidth={selected ? 2.5 : hovered ? 1.5 : 0}
                  filter={selected ? "url(#glow)" : undefined}
                  opacity={selected ? 0.85 : hovered ? 0.6 : 0}
                  className="transition-all duration-200"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => handleSelect(zone)}
                />
                {/* Invisible hit area for better click targeting */}
                <path
                  d={zone.d}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => handleSelect(zone)}
                />
              </g>
            );
          })}

          {/* Face details (front view) */}
          {view === "front" && (
            <g opacity="0.3" pointerEvents="none">
              {/* Eyes */}
              <ellipse cx="170" cy="40" rx="5" ry="3" fill="#64748B" />
              <ellipse cx="190" cy="40" rx="5" ry="3" fill="#64748B" />
              {/* Nose */}
              <path
                d="M178,46 L180,54 L182,46"
                fill="none"
                stroke="#64748B"
                strokeWidth="1"
              />
              {/* Mouth */}
              <path
                d="M172,62 Q180,68 188,62"
                fill="none"
                stroke="#64748B"
                strokeWidth="1"
              />
            </g>
          )}

          {/* Center line (spine indicator) */}
          <line
            x1="180"
            y1="115"
            x2="180"
            y2="290"
            stroke="#CBD5E1"
            strokeWidth="0.5"
            strokeDasharray="4 4"
            opacity="0.4"
            pointerEvents="none"
          />
        </svg>

        {/* View label */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {view} view
          </span>
        </div>
      </div>

      {/* Selected indicators */}
      {selectedAreas.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {selectedAreas.map((area) => (
            <span
              key={area}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
              style={{
                backgroundColor:
                  ZONE_COLORS[area]?.glow || "#64748B",
              }}
            >
              {area}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

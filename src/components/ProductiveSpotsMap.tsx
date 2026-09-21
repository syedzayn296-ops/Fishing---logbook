import React, { useState, useMemo } from 'react';
import { CatchLogEntry, CoastalLocation } from '../types';
import { SA_FISHING_LOCATIONS } from '../data/saLocations';
import {
  MapPin,
  Flame,
  Trophy,
  Fish,
  Grid,
  List,
  Compass,
  Anchor,
  Filter,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Calendar,
  X,
  ChevronRight,
} from 'lucide-react';

export interface SpotStats {
  locationName: string;
  matchedLocation?: CoastalLocation;
  totalCatches: number;
  percentage: number;
  legalCount: number;
  releasedCount: number;
  speciesMap: Record<string, number>;
  topSpecies: string;
  topSpeciesCount: number;
  uniqueSpeciesCount: number;
  topBaits: string[];
  avgWeightKg: string | null;
  maxWeightKg: string | null;
  avgLengthCm: string | null;
  recentDate: string;
  region: string;
  // Normalized 0-100 coordinates for schematic SA coastal map
  gridX: number;
  gridY: number;
  isHotspot: boolean;
}

interface ProductiveSpotsMapProps {
  entries: CatchLogEntry[];
  selectedLocationFilter?: string | null;
  onSelectLocationFilter?: (location: string | null) => void;
  onSelectSpeciesFilter?: (species: string | null) => void;
}

// Coordinate mapping for SA coastal regions on schematic 100x100 grid
// Coast sweeps from NW (West Coast) -> SW (False Bay/Cape) -> S (Agulhas/Garden Route) -> SE (Eastern Cape) -> E/NE (KZN)
const SCHEMATIC_COORDINATES: Record<string, { x: number; y: number; region: string }> = {
  'langebaan-lagoon': { x: 18, y: 35, region: 'West Coast' },
  'cape-town-table-bay': { x: 22, y: 55, region: 'Western Cape / Atlantic' },
  'false-bay-strand': { x: 26, y: 68, region: 'False Bay' },
  'hermanus-walker-bay': { x: 34, y: 76, region: 'Overberg' },
  'struisbaai-agulhas': { x: 42, y: 85, region: 'Cape Agulhas' },
  'breede-river-witsand': { x: 50, y: 82, region: 'South Coast Estuary' },
  'mossel-bay': { x: 58, y: 78, region: 'Garden Route' },
  'knysna-lagoon-heads': { x: 65, y: 74, region: 'Garden Route' },
  'jeffreys-bay-st-francis': { x: 73, y: 68, region: 'Eastern Cape' },
  'gqeberha-port-elizabeth': { x: 79, y: 62, region: 'Algoa Bay' },
  'east-london': { x: 84, y: 52, region: 'Border / Wild Coast' },
  'wild-coast-port-st-johns': { x: 88, y: 40, region: 'Wild Coast' },
  'durban-beaches': { x: 92, y: 26, region: 'KwaZulu-Natal' },
  'richards-bay-st-lucia': { x: 95, y: 15, region: 'Zululand' },
};

function matchKnownLocation(locationStr: string): CoastalLocation | undefined {
  const norm = locationStr.toLowerCase();
  return SA_FISHING_LOCATIONS.find((loc) => {
    const locNorm = loc.name.toLowerCase();
    const idNorm = loc.id.toLowerCase();
    return (
      norm.includes(locNorm) ||
      locNorm.includes(norm) ||
      norm.includes(idNorm) ||
      (norm.includes('false bay') && loc.id === 'false-bay-strand') ||
      (norm.includes('strandfontein') && loc.id === 'false-bay-strand') ||
      (norm.includes('breede') && loc.id === 'breede-river-witsand') ||
      (norm.includes('witsand') && loc.id === 'breede-river-witsand') ||
      (norm.includes('knysna') && loc.id === 'knysna-lagoon-heads') ||
      (norm.includes('melkbos') && loc.id === 'cape-town-table-bay') ||
      (norm.includes('table bay') && loc.id === 'cape-town-table-bay') ||
      (norm.includes('cape point') && loc.id === 'false-bay-strand') ||
      (norm.includes('algoa') && loc.id === 'gqeberha-port-elizabeth') ||
      (norm.includes('sunday') && loc.id === 'gqeberha-port-elizabeth') ||
      (norm.includes('durban') && loc.id === 'durban-beaches') ||
      (norm.includes('richards') && loc.id === 'richards-bay-st-lucia')
    );
  });
}

export const ProductiveSpotsMap: React.FC<ProductiveSpotsMapProps> = ({
  entries,
  selectedLocationFilter,
  onSelectLocationFilter,
  onSelectSpeciesFilter,
}) => {
  const [viewMode, setViewMode] = useState<'grid-map' | 'ranked-list'>('grid-map');
  const [activeSpotId, setActiveSpotId] = useState<string | null>(null);

  // Group and rank previous catches by location
  const { spots, topSpot, totalCatchesWithLocation } = useMemo(() => {
    const groups: Record<
      string,
      {
        locationName: string;
        matched?: CoastalLocation;
        entries: CatchLogEntry[];
      }
    > = {};

    entries.forEach((entry) => {
      const locKey = entry.location.trim() || 'Unknown Spot';
      if (!groups[locKey]) {
        groups[locKey] = {
          locationName: locKey,
          matched: matchKnownLocation(locKey),
          entries: [],
        };
      }
      groups[locKey].entries.push(entry);
    });

    const total = entries.length;
    const computedSpots: SpotStats[] = Object.values(groups).map((group) => {
      const locEntries = group.entries;
      const count = locEntries.length;

      // Species aggregation
      const speciesMap: Record<string, number> = {};
      let topSpecies = 'Various';
      let topSpeciesCount = 0;

      // Baits aggregation
      const baitMap: Record<string, number> = {};

      let legalCount = 0;
      let releasedCount = 0;
      const weights: number[] = [];
      const lengths: number[] = [];

      locEntries.forEach((c) => {
        // Species
        const s = c.speciesName || 'Unknown';
        speciesMap[s] = (speciesMap[s] || 0) + 1;
        if (speciesMap[s] > topSpeciesCount) {
          topSpeciesCount = speciesMap[s];
          topSpecies = s;
        }

        // Baits
        if (c.baitOrLure && c.baitOrLure !== 'Not specified') {
          const b = c.baitOrLure.trim();
          baitMap[b] = (baitMap[b] || 0) + 1;
        }

        // Legal
        if (c.isLegal) legalCount += 1;
        else releasedCount += 1;

        if (c.weightKg) weights.push(c.weightKg);
        if (c.lengthCm) lengths.push(c.lengthCm);
      });

      const sortedBaits = Object.entries(baitMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name]) => name)
        .slice(0, 2);

      const avgWeight = weights.length
        ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
        : null;
      const maxWeight = weights.length ? Math.max(...weights).toFixed(1) : null;
      const avgLen = lengths.length
        ? (lengths.reduce((a, b) => a + b, 0) / lengths.length).toFixed(1)
        : null;

      // Most recent catch timestamp
      const sortedByDate = [...locEntries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const recentDate = sortedByDate[0]?.timestamp || '';

      // Match coordinates from known coastal database
      const locId = group.matched?.id || '';
      const coords = SCHEMATIC_COORDINATES[locId] || {
        x: 48,
        y: 72,
        region: group.matched?.regionName || 'Coastal Waters',
      };

      return {
        locationName: group.locationName,
        matchedLocation: group.matched,
        totalCatches: count,
        percentage: Math.round((count / (total || 1)) * 100),
        legalCount,
        releasedCount,
        speciesMap,
        topSpecies,
        topSpeciesCount,
        uniqueSpeciesCount: Object.keys(speciesMap).length,
        topBaits: sortedBaits.length > 0 ? sortedBaits : ['Standard fresh bait'],
        avgWeightKg: avgWeight,
        maxWeightKg: maxWeight,
        avgLengthCm: avgLen,
        recentDate,
        region: coords.region,
        gridX: coords.x,
        gridY: coords.y,
        isHotspot: count >= 2,
      };
    });

    // Rank spots by total catches descending
    computedSpots.sort((a, b) => b.totalCatches - a.totalCatches);

    return {
      spots: computedSpots,
      topSpot: computedSpots.length > 0 ? computedSpots[0] : null,
      totalCatchesWithLocation: total,
    };
  }, [entries]);

  // Selected spot details
  const activeSpot = useMemo(() => {
    if (activeSpotId) {
      return spots.find((s) => s.locationName === activeSpotId) || null;
    }
    if (selectedLocationFilter) {
      return spots.find((s) => s.locationName === selectedLocationFilter) || null;
    }
    return topSpot;
  }, [spots, activeSpotId, selectedLocationFilter, topSpot]);

  if (entries.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
          <MapPin className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white font-['Outfit',sans-serif]">
          Logged Catch Locations
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Log catches with their coastal location to automatically group your logged catches by coastal location.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">
              Catch Location Analysis
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800">
              {spots.length} Active {spots.length === 1 ? 'Spot' : 'Spots'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Spatial grouping and catch frequency distribution across South African coastal marks.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          {selectedLocationFilter && onSelectLocationFilter && (
            <button
              onClick={() => {
                onSelectLocationFilter(null);
                setActiveSpotId(null);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-semibold hover:bg-cyan-900 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Spot Filter</span>
            </button>
          )}

          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('grid-map')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                viewMode === 'grid-map'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Coastal Grid Map</span>
            </button>
            <button
              onClick={() => setViewMode('ranked-list')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                viewMode === 'ranked-list'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Ranked List</span>
            </button>
          </div>
        </div>
      </div>

      {/* #1 Top Spot Metric Bar */}
      {topSpot && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-800/50 to-cyan-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  Most Logged Spot
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Most logged
                </span>
              </div>
              <h4 className="text-sm font-bold text-white font-['Outfit',sans-serif] mt-0.5">
                {topSpot.locationName}
              </h4>
              <p className="text-[11px] text-slate-400">
                Primary species:{' '}
                <span className="text-cyan-300 font-semibold">{topSpot.topSpecies}</span> ({topSpot.topSpeciesCount} landed)
                {topSpot.topBaits[0] && ` • Top bait: ${topSpot.topBaits[0]}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-slate-800 sm:pl-4">
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {topSpot.totalCatches}
              </span>
              <span className="text-[10px] text-slate-400 block font-semibold">
                {topSpot.percentage}% of all catches
              </span>
            </div>
            {onSelectLocationFilter && (
              <button
                onClick={() =>
                  onSelectLocationFilter(
                    selectedLocationFilter === topSpot.locationName ? null : topSpot.locationName
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition cursor-pointer"
              >
                {selectedLocationFilter === topSpot.locationName ? 'Clear Filter' : 'Filter Spot'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW A: COASTAL GRID-BASED MAP SCHEMATIC */}
      {viewMode === 'grid-map' && (
        <div className="space-y-4">
          
          {/* Schematic South African Coastline Grid */}
          <div className="relative bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-hidden">
            {/* Background Map Grid Overlay */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Compass Rose Accent */}
            <div className="absolute top-3 right-3 text-slate-800/80 pointer-events-none flex flex-col items-center">
              <Compass className="w-8 h-8 text-slate-700/50" />
              <span className="text-[9px] font-mono tracking-widest text-slate-600">SOUTH AFRICA</span>
            </div>

            {/* Regional Ocean Identifiers */}
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-2 border-b border-slate-900 pb-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500/40"></span> Atlantic Ocean (Benguela)
              </span>
              <span className="flex items-center gap-1">
                Indian Ocean (Agulhas) <span className="w-2 h-2 rounded-full bg-emerald-500/40"></span>
              </span>
            </div>

            {/* SVG Coastline Arc with Spot Nodes */}
            <div className="relative w-full h-[260px] sm:h-[300px]">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Coastal Bathymetry Depth Curves */}
                <path
                  d="M 12 25 Q 16 52 24 68 Q 38 88 56 82 Q 78 74 88 48 Q 94 28 98 10"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M 14 28 Q 18 54 26 69 Q 40 86 56 80 Q 76 72 86 46 Q 92 28 96 12"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                  strokeDasharray="2 3"
                  strokeOpacity="0.4"
                />

                {/* Main Shoreline Arc */}
                <path
                  d="M 16 32 Q 20 56 28 70 Q 42 84 58 78 Q 74 70 84 44 Q 90 28 94 14"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Spot Connection Rays to Coastline */}
                {spots.map((spot) => (
                  <line
                    key={`line-${spot.locationName}`}
                    x1={spot.gridX}
                    y1={spot.gridY}
                    x2={spot.gridX}
                    y2={spot.gridY}
                    stroke={spot.isHotspot ? '#22d3ee' : '#64748b'}
                    strokeWidth="1"
                    strokeOpacity="0.5"
                  />
                ))}
              </svg>

              {/* Spot Nodes (Interactive Pins & Badges positioned on 100x100 grid) */}
              {spots.map((spot, index) => {
                const isSelected =
                  activeSpot?.locationName === spot.locationName ||
                  selectedLocationFilter === spot.locationName;
                const isTop = index === 0;

                return (
                  <div
                    key={`node-${spot.locationName}`}
                    style={{
                      left: `${spot.gridX}%`,
                      top: `${spot.gridY}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onClick={() => {
                      setActiveSpotId(spot.locationName);
                      if (onSelectLocationFilter) {
                        onSelectLocationFilter(
                          selectedLocationFilter === spot.locationName ? null : spot.locationName
                        );
                      }
                    }}
                    className={`absolute z-10 cursor-pointer group transition-all duration-300 select-none ${
                      isSelected ? 'scale-110 z-20' : 'hover:scale-105'
                    }`}
                  >
                    {/* Pulsing ring for hotspots */}
                    {spot.isHotspot && (
                      <span className="absolute -inset-1.5 rounded-full bg-cyan-400/30 animate-ping opacity-75"></span>
                    )}

                    {/* Spot Pin / Badge */}
                    <div
                      className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg transition-colors border ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 border-white shadow-cyan-500/50'
                          : isTop
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-emerald-950/60'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-cyan-400'
                      }`}
                    >
                      <MapPin
                        className={`w-3 h-3 shrink-0 ${
                          isSelected
                            ? 'text-slate-950'
                            : isTop
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-cyan-400'
                        }`}
                      />
                      <span className="truncate max-w-[85px] sm:max-w-[120px]">
                        {spot.locationName.split('(')[0].trim()}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                          isSelected
                            ? 'bg-slate-950 text-cyan-300'
                            : 'bg-slate-800 text-cyan-400'
                        }`}
                      >
                        {spot.totalCatches}
                      </span>
                    </div>

                    {/* Quick Tooltip on Hover */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-30 pointer-events-none">
                      <div className="bg-slate-900 border border-cyan-500/40 rounded-lg p-2 text-xs shadow-2xl backdrop-blur-md min-w-[150px] text-center">
                        <span className="font-bold text-white block">{spot.locationName}</span>
                        <span className="text-[10px] text-cyan-400 block mt-0.5">
                          {spot.totalCatches} catches ({spot.percentage}%)
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Top: {spot.topSpecies}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coastal Map Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>#1 Top Spot</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                  <span>Multiple logged catches</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"></span>
                  <span>Recorded Catch</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 italic">
                Click any mark to filter diary entries by spot
              </span>
            </div>
          </div>

          {/* Active Spot Detailed Breakdown Card */}
          {activeSpot && (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 sm:p-5 shadow-lg space-y-3 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Anchor className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white font-['Outfit',sans-serif]">
                        {activeSpot.locationName}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {activeSpot.region}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeSpot.totalCatches} total catches logged here ({activeSpot.percentage}% of your diary)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onSelectLocationFilter && (
                    <button
                      onClick={() =>
                        onSelectLocationFilter(
                          selectedLocationFilter === activeSpot.locationName ? null : activeSpot.locationName
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        selectedLocationFilter === activeSpot.locationName
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <Filter className="w-3 h-3" />
                      <span>
                        {selectedLocationFilter === activeSpot.locationName
                          ? 'Spot Filter Active'
                          : 'Filter Logbook to This Spot'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Statistics Grid for this Spot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Top Species</span>
                  <span className="text-sm font-bold text-cyan-300 truncate block mt-0.5">
                    {activeSpot.topSpecies}
                  </span>
                  <span className="text-[10px] text-slate-500">{activeSpot.topSpeciesCount} caught</span>
                </div>

                <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Legal Ratio</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono block mt-0.5">
                    {Math.round((activeSpot.legalCount / activeSpot.totalCatches) * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {activeSpot.legalCount} legal / {activeSpot.releasedCount} released
                  </span>
                </div>

                <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Biggest Fish (PB)</span>
                  <span className="text-sm font-bold text-amber-300 font-mono block mt-0.5">
                    {activeSpot.maxWeightKg ? `${activeSpot.maxWeightKg} kg` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {activeSpot.avgWeightKg ? `Avg: ${activeSpot.avgWeightKg} kg` : 'Weight not logged'}
                  </span>
                </div>

                <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Proven Baits</span>
                  <span className="text-xs font-semibold text-slate-200 truncate block mt-0.5">
                    {activeSpot.topBaits[0]}
                  </span>
                  {activeSpot.topBaits[1] && (
                    <span className="text-[10px] text-slate-500 truncate block">
                      & {activeSpot.topBaits[1]}
                    </span>
                  )}
                </div>
              </div>

              {/* Species Caught at this Location (Clickable Chips) */}
              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Species Landed at this Mark:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(activeSpot.speciesMap).map(([species, cnt]) => (
                    <button
                      key={species}
                      onClick={() => onSelectSpeciesFilter?.(species)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 hover:border-cyan-500 transition cursor-pointer"
                      title="Filter logbook by this species"
                    >
                      <Fish className="w-3 h-3 text-cyan-400" />
                      <span>{species}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300">
                        {cnt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW B: RANKED CATCH LOCATIONS LIST & BENTO CARDS */}
      {viewMode === 'ranked-list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {spots.map((spot, index) => {
            const isSelected = selectedLocationFilter === spot.locationName;
            const rank = index + 1;

            return (
              <div
                key={`card-${spot.locationName}`}
                className={`bg-slate-900/90 border rounded-2xl p-4 shadow-lg flex flex-col justify-between transition-all duration-200 ${
                  isSelected
                    ? 'border-cyan-500 shadow-cyan-500/10 ring-1 ring-cyan-500'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Spot Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            rank === 1
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : rank <= 3
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          #{rank}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {spot.region}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white font-['Outfit',sans-serif] leading-snug">
                        {spot.locationName}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl font-bold text-cyan-400 font-mono">
                        {spot.totalCatches}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {spot.percentage}% of diary
                      </span>
                    </div>
                  </div>

                  {/* Relative Catch Share Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full"
                      style={{ width: `${Math.min(100, spot.percentage)}%` }}
                    ></div>
                  </div>

                  {/* Spot Metrics */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Main Species
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate block">
                        {spot.topSpecies}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Legal Retention
                      </span>
                      <span className="text-xs font-bold text-emerald-400 font-mono block">
                        {Math.round((spot.legalCount / spot.totalCatches) * 100)}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Best Bait
                      </span>
                      <span className="text-[11px] text-slate-300 truncate block">
                        {spot.topBaits[0]}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Max Weight (PB)
                      </span>
                      <span className="text-[11px] font-mono text-amber-300 block">
                        {spot.maxWeightKg ? `${spot.maxWeightKg} kg` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    Last catch: {new Date(spot.recentDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>

                  {onSelectLocationFilter && (
                    <button
                      onClick={() =>
                        onSelectLocationFilter(
                          selectedLocationFilter === spot.locationName ? null : spot.locationName
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Filter className="w-3 h-3" />
                      <span>{isSelected ? 'Filtered' : 'Filter Spot'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

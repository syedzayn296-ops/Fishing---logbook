import React, { useState, useMemo } from 'react';
import { FishSpecies, CoastRegion, SassiStatus } from '../types';
import { SA_SPECIES_DATABASE } from '../data/saSpecies';
import { Search, Filter, Shield, AlertCircle, Info, Sparkles, Compass, Check, X } from 'lucide-react';

export const SpeciesGuide: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoast, setSelectedCoast] = useState<CoastRegion>('all');
  const [selectedHabitat, setSelectedHabitat] = useState<string>('all');
  const [selectedSassi, setSelectedSassi] = useState<string>('all');
  const [activeSpecies, setActiveSpecies] = useState<FishSpecies | null>(null);

  const filteredSpecies = useMemo(() => {
    return SA_SPECIES_DATABASE.filter((fish) => {
      // Search query filter (matches common name, scientific name, or local Afrikaans names)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = fish.commonName.toLowerCase().includes(q);
        const matchesSci = fish.scientificName.toLowerCase().includes(q);
        const matchesLocal = fish.localNames.some((l) => l.toLowerCase().includes(q));
        const matchesBait = fish.bestBait.some((b) => b.toLowerCase().includes(q));
        if (!matchesName && !matchesSci && !matchesLocal && !matchesBait) {
          return false;
        }
      }

      // Coast filter
      if (selectedCoast !== 'all') {
        if (!fish.coast.includes(selectedCoast)) return false;
      }

      // Habitat filter
      if (selectedHabitat !== 'all') {
        if (!fish.habitat.includes(selectedHabitat as any)) return false;
      }

      // SASSI filter
      if (selectedSassi !== 'all') {
        if (fish.sassiStatus !== selectedSassi) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCoast, selectedHabitat, selectedSassi]);

  const getSassiBadge = (status: SassiStatus) => {
    switch (status) {
      case 'Green':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
            🟢 SASSI Green (Sustainable)
          </span>
        );
      case 'Orange':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50">
            🟠 SASSI Orange (Think Twice)
          </span>
        );
      case 'Red':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-600/50">
            🔴 SASSI Red (Do Not Buy / High Concern)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-cyan-950/70 border border-cyan-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit',sans-serif]">
              South African Angling Species Identification & Legal Guide
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Official recreational regulations specified under the Department of Forestry, Fisheries and the Environment (DFFE) Marine Living Resources Act, coupled with WWF-SASSI conservation classifications.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Permit required for all marine angling</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by English name, Afrikaans name (e.g. Galjoen, Kabeljou, Geelstert, Leervis), bait, or scientific name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          
          {/* Coast Filter */}
          <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 px-2 font-semibold">Coast:</span>
            {(
              [
                ['all', 'All Coasts'],
                ['west_coast', 'West Coast'],
                ['south_coast', 'South Coast / False Bay'],
                ['east_coast', 'KZN / East Coast'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSelectedCoast(val)}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  selectedCoast === val
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Habitat Filter */}
          <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 px-2 font-semibold">Habitat:</span>
            {[
              'all',
              'Rock & Surf',
              'Estuary / Lagoon',
              'Deep Sea / Boat',
              'Reef & Kelp',
            ].map((hab) => (
              <button
                key={hab}
                onClick={() => setSelectedHabitat(hab)}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  selectedHabitat === hab
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {hab === 'all' ? 'All Habitats' : hab}
              </button>
            ))}
          </div>

          {/* SASSI Status Filter */}
          <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 px-2 font-semibold">SASSI:</span>
            {[
              ['all', 'All'],
              ['Green', '🟢 Green'],
              ['Orange', '🟠 Orange'],
              ['Red', '🔴 Red'],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSelectedSassi(val)}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  selectedSassi === val
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Species Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpecies.map((fish) => {
          return (
            <div
              key={fish.id}
              onClick={() => setActiveSpecies(fish)}
              className="group bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-cyan-500/10 hover:-translate-y-0.5"
            >
              <div>
                {/* Header & Local Names */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition font-['Outfit',sans-serif]">
                      {fish.commonName}
                    </h3>
                    <p className="text-xs text-cyan-400/90 italic font-mono mt-0.5">
                      {fish.scientificName}
                    </p>
                  </div>
                  {getSassiBadge(fish.sassiStatus)}
                </div>

                {/* Local Afrikaans / Colloquial Names */}
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {fish.localNames.map((locName, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-medium"
                    >
                      {locName}
                    </span>
                  ))}
                </div>

                {/* DFFE Regulation Highlights */}
                <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Min Legal Size
                    </span>
                    <span className="text-sm font-bold text-amber-300 font-mono">
                      {fish.minLegalSizeCm ? `${fish.minLegalSizeCm} cm` : 'No min size'}
                    </span>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Daily Bag Limit
                    </span>
                    <span className="text-sm font-bold text-cyan-300 font-mono">
                      {fish.maxBagLimit ? `${fish.maxBagLimit} per day` : 'Unlimited'}
                    </span>
                  </div>
                </div>

                {/* Closed Season Warning if any */}
                {fish.closedSeason && (
                  <div className="mt-2 flex items-start gap-1.5 p-2 rounded-lg bg-rose-950/40 border border-rose-800/50 text-[11px] text-rose-300">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Closed Season:</strong> {fish.closedSeason}</span>
                  </div>
                )}

                {/* Key Identifying Features Preview */}
                <div className="mt-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Key Identification Markers:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {fish.identifyingFeatures.slice(0, 2).map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span className="line-clamp-1">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Top Bait:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[150px]">
                    {fish.bestBait[0]}
                  </span>
                </div>
                <span className="text-cyan-400 font-semibold group-hover:underline">
                  View Full Guide & Tackle →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSpecies.length === 0 && (
        <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-sm">No South African fish species matched your search criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCoast('all');
              setSelectedHabitat('all');
              setSelectedSassi('all');
            }}
            className="mt-3 px-4 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/30 transition"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Detail Modal Dialog */}
      {activeSpecies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveSpecies(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-['Outfit',sans-serif]">
                  {activeSpecies.commonName}
                </h3>
                {getSassiBadge(activeSpecies.sassiStatus)}
              </div>
              <p className="text-sm text-cyan-400 italic font-mono mt-0.5">
                {activeSpecies.scientificName}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {activeSpecies.localNames.map((name, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 mt-4 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
              {activeSpecies.description}
            </p>

            {/* South African Regulations Box */}
            <div className="mt-4 p-4 rounded-xl bg-slate-800/70 border border-cyan-500/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-2.5">
                <Shield className="w-4 h-4" />
                South African Regulation Data
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Minimum Size:</span>
                  <span className="text-sm font-bold text-amber-300 font-mono">
                    {activeSpecies.minLegalSizeCm ? `${activeSpecies.minLegalSizeCm} cm (Total Length)` : 'No Minimum Size'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Daily Bag Limit:</span>
                  <span className="text-sm font-bold text-cyan-300 font-mono">
                    {activeSpecies.maxBagLimit ? `${activeSpecies.maxBagLimit} per day` : 'Unlimited'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Edibility / Table:</span>
                  <span className="text-sm font-bold text-emerald-300">
                    {activeSpecies.edibility}
                  </span>
                </div>
              </div>

              {activeSpecies.closedSeason && (
                <div className="mt-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-200">
                  <strong>⚠️ Strict Closed Season:</strong> {activeSpecies.closedSeason}
                </div>
              )}

              <div className="mt-2.5 text-[11px] text-slate-300">
                <strong>SASSI Note:</strong> {activeSpecies.sassiReason}
              </div>
            </div>

            {/* Identification Markers */}
            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Anatomical Identification Markers
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activeSpecies.identifyingFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best Baits & Recommended Tackle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1.5">
                  Top Recommended Baits & Lures
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeSpecies.bestBait.map((bait, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 rounded bg-amber-950/60 text-amber-200 border border-amber-800/50">
                      {bait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1.5">
                  Tide & Sea Conditions
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeSpecies.bestTideConditions}
                </p>
              </div>
            </div>

            {/* Tackle Recommendation */}
            <div className="mt-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Recommended Tackle Rig:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {activeSpecies.recommendedTackle}
              </p>
            </div>

            {/* Close action */}
            <div className="mt-5 text-right">
              <button
                onClick={() => setActiveSpecies(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

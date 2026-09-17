import React, { useState, useEffect } from 'react';
import { CatchLogEntry } from '../types';
import { SA_SPECIES_DATABASE } from '../data/saSpecies';
import { SA_FISHING_LOCATIONS } from '../data/saLocations';
import { BookOpen, Plus, Trash2, Calendar, MapPin, Fish, AlertCircle, CheckCircle2, Award, Scale, Ruler, Search, BarChart3, X, Filter, Compass } from 'lucide-react';
import { CatchSpeciesBarChart } from './CatchSpeciesBarChart';
import { ProductiveSpotsMap } from './ProductiveSpotsMap';

interface CatchLogbookProps {
  entries: CatchLogEntry[];
  onAddEntry: (entry: CatchLogEntry) => void;
  onDeleteEntry: (id: string) => void;
  defaultLocation?: string;
  defaultTideState?: string;
}

export const CatchLogbook: React.FC<CatchLogbookProps> = ({
  entries,
  onAddEntry,
  onDeleteEntry,
  defaultLocation = 'False Bay',
  defaultTideState = 'Rising (Flood)',
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string | null>(null);
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string | null>(null);
  const [showSpots, setShowSpots] = useState(true);
  const [showChart, setShowChart] = useState(true);

  // Form states
  const [speciesName, setSpeciesName] = useState('Galjoen (South African National Fish)');
  const [customSpecies, setCustomSpecies] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [location, setLocation] = useState(defaultLocation);
  const [baitOrLure, setBaitOrLure] = useState('');
  const [tideState, setTideState] = useState(defaultTideState);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Check legal status against SA Species Database
  const targetSpecies = SA_SPECIES_DATABASE.find((s) => s.commonName === speciesName);
  const minLegal = targetSpecies?.minLegalSizeCm ?? null;
  const isUndersize = minLegal !== null && lengthCm !== '' && parseFloat(lengthCm) < minLegal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSpecies = speciesName === 'Other' ? customSpecies || 'Unknown Fish' : speciesName;

    const newEntry: CatchLogEntry = {
      id: `catch-${Date.now()}`,
      speciesName: finalSpecies,
      lengthCm: lengthCm ? parseFloat(lengthCm) : undefined,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      location,
      baitOrLure: baitOrLure.trim() || 'Not specified',
      tideState,
      timestamp: new Date().toISOString(),
      notes: notes.trim(),
      photoUrl: photoUrl || undefined,
      isLegal: !isUndersize,
    };

    onAddEntry(newEntry);
    setIsAdding(false);
    // Reset fields
    setLengthCm('');
    setWeightKg('');
    setNotes('');
    setPhotoUrl(null);
  };

  const filteredEntries = entries.filter((c) => {
    if (selectedSpeciesFilter && c.speciesName !== selectedSpeciesFilter) {
      return false;
    }
    if (
      selectedLocationFilter &&
      !c.location.toLowerCase().includes(selectedLocationFilter.toLowerCase()) &&
      !selectedLocationFilter.toLowerCase().includes(c.location.toLowerCase())
    ) {
      return false;
    }
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      c.speciesName.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.baitOrLure.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Stats */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/70 border border-emerald-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-['Outfit',sans-serif]">
                Angler's South African Catch Diary
              </h2>
              <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                {entries.length} Catches Recorded
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Log catches along the South African coast. Identify your most productive fishing spots, track successful tides, baits, and species frequency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {entries.length > 0 && (
              <>
                <button
                  onClick={() => setShowSpots(!showSpots)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                    showSpots
                      ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300 shadow-sm'
                      : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle productive spots coastal map & list"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>{showSpots ? 'Hide Spots Map' : 'Spots Map'}</span>
                </button>

                <button
                  onClick={() => setShowChart(!showChart)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                    showChart
                      ? 'bg-slate-800 border-cyan-500/40 text-cyan-300 shadow-sm'
                      : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle species frequency bar chart"
                >
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>{showChart ? 'Hide Species Chart' : 'Species Chart'}</span>
                </button>
              </>
            )}

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'Cancel Entry' : 'Log New Catch'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* DATA VISUALIZATION 1: Productive Spots Grid Map & List */}
      {showSpots && entries.length > 0 && (
        <ProductiveSpotsMap
          entries={entries}
          selectedLocationFilter={selectedLocationFilter}
          onSelectLocationFilter={setSelectedLocationFilter}
          onSelectSpeciesFilter={setSelectedSpeciesFilter}
        />
      )}

      {/* DATA VISUALIZATION 2: Catches per Species Bar Chart (Recharts) */}
      {showChart && entries.length > 0 && (
        <CatchSpeciesBarChart
          entries={entries}
          selectedSpeciesFilter={selectedSpeciesFilter}
          onSelectSpeciesFilter={setSelectedSpeciesFilter}
        />
      )}

      {/* Active Filters Bar (Spots or Species) */}
      {(selectedSpeciesFilter || selectedLocationFilter) && (
        <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Active Filters:
            </span>

            {selectedLocationFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-semibold">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>Spot: {selectedLocationFilter}</span>
                <button
                  onClick={() => setSelectedLocationFilter(null)}
                  className="hover:text-white ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedSpeciesFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800 text-xs font-semibold">
                <Fish className="w-3 h-3 text-cyan-400" />
                <span>Species: {selectedSpeciesFilter}</span>
                <button
                  onClick={() => setSelectedSpeciesFilter(null)}
                  className="hover:text-white ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-bold">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'result' : 'results'}
            </span>
          </div>

          <button
            onClick={() => {
              setSelectedSpeciesFilter(null);
              setSelectedLocationFilter(null);
            }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear All Filters</span>
          </button>
        </div>
      )}

      {/* Add New Catch Form Modal / Panel */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">
              Record a Catch in South African Waters
            </h3>
            <span className="text-xs text-slate-400">All fields auto-validate with DFFE sizes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Species Picker */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Target Species
              </label>
              <select
                value={speciesName}
                onChange={(e) => setSpeciesName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {SA_SPECIES_DATABASE.map((s) => (
                  <option key={s.id} value={s.commonName}>
                    {s.commonName}
                  </option>
                ))}
                <option value="Other">Other / Unlisted Species</option>
              </select>
            </div>

            {speciesName === 'Other' && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Custom Species Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bronze Bream / Karanteen"
                  value={customSpecies}
                  onChange={(e) => setCustomSpecies(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Length (cm) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Length (cm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="5"
                  max="350"
                  placeholder={minLegal ? `Min legal: ${minLegal}cm` : 'e.g. 45'}
                  value={lengthCm}
                  onChange={(e) => setLengthCm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
                <Ruler className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              {minLegal && (
                <span className={`text-[10px] block mt-1 ${isUndersize ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                  {isUndersize
                    ? `⚠️ Undersized! Legal limit is ${minLegal}cm. Release required.`
                    : `Legal min size: ${minLegal}cm`}
                </span>
              )}
            </div>

            {/* Weight (kg) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Weight (kg) - Optional
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="400"
                  placeholder="e.g. 2.4"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
                <Scale className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Spot / Beach / River
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Strandfontein gully / Breede River"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Bait or Lure */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Bait or Lure Used
              </label>
              <input
                type="text"
                placeholder="e.g. Red bait / Chokka & Sardine / Mud prawn"
                value={baitOrLure}
                onChange={(e) => setBaitOrLure(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Tide State */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Tidal State When Caught
              </label>
              <select
                value={tideState}
                onChange={(e) => setTideState(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Rising (Flood) - High Push">Rising (Flood) - High Push</option>
                <option value="Full Spring High Tide">Full Spring High Tide</option>
                <option value="Falling (Ebb) - Drain">Falling (Ebb) - Drain</option>
                <option value="Low Water Slack">Low Water Slack</option>
                <option value="Neap Tide Mid-Water">Neap Tide Mid-Water</option>
              </select>
            </div>

          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
              Field Notes (Water clarity, bite time, rig details)
            </label>
            <input
              type="text"
              placeholder="e.g. Foamy white water, caught 30 mins after sunset on grapnel sinker."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition"
            >
              Save Catch to Logbook
            </button>
          </div>
        </form>
      )}

      {/* Filter / Search Catches */}
      {entries.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logged catches by species, spot, or bait..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}

      {/* Catches List */}
      {filteredEntries.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <Fish className="w-10 h-10 text-slate-600 mx-auto" />
          <div>
            <h4 className="text-sm font-semibold text-slate-300">No catches logged yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Start building your South African angling history. Log your fish with length, location, and tide stage.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/30 transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Your First Catch</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button
                      onClick={() =>
                        setSelectedSpeciesFilter(
                          selectedSpeciesFilter === entry.speciesName ? null : entry.speciesName
                        )
                      }
                      className="text-left text-base font-bold text-white hover:text-cyan-400 font-['Outfit',sans-serif] transition cursor-pointer flex items-center gap-1.5 group"
                      title="Filter logbook and chart by this species"
                    >
                      <span>{entry.speciesName}</span>
                      <BarChart3 className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition shrink-0" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedLocationFilter(
                          selectedLocationFilter === entry.location ? null : entry.location
                        )
                      }
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-300 mt-0.5 transition cursor-pointer group text-left"
                      title="Filter logbook and map by this spot"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition shrink-0" />
                      <span>{entry.location}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {entry.isLegal ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Legal Catch
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        <AlertCircle className="w-3 h-3" /> Undersize/Released
                      </span>
                    )}

                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800 text-xs">
                  {entry.lengthCm && (
                    <div className="bg-slate-800/40 p-2 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Length</span>
                      <span className="text-sm font-bold text-cyan-300 font-mono">{entry.lengthCm} cm</span>
                    </div>
                  )}

                  {entry.weightKg && (
                    <div className="bg-slate-800/40 p-2 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Weight</span>
                      <span className="text-sm font-bold text-amber-300 font-mono">{entry.weightKg} kg</span>
                    </div>
                  )}

                  <div className="bg-slate-800/40 p-2 rounded-lg col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tide State</span>
                    <span className="text-xs font-semibold text-slate-200 truncate block">{entry.tideState}</span>
                  </div>
                </div>

                {/* Bait & Notes */}
                <div className="mt-3 space-y-1 text-xs text-slate-300">
                  <p>
                    <strong className="text-slate-400">Bait:</strong> {entry.baitOrLure}
                  </p>
                  {entry.notes && (
                    <p className="text-slate-400 italic">
                      "{entry.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Timestamp footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span>🇿🇦 SA Marine Log</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

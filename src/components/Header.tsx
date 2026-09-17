import React from 'react';
import { CoastalLocation, MoonPhaseInfo } from '../types';
import { SA_FISHING_LOCATIONS } from '../data/saLocations';
import { MapPin, Calendar, Waves, Moon, ShieldCheck, Compass, BookOpen, Camera, Fish } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'tides' | 'species' | 'ai-identify' | 'logbook' | 'regulations';
  setActiveTab: (tab: 'tides' | 'species' | 'ai-identify' | 'logbook' | 'regulations') => void;
  selectedLocation: CoastalLocation;
  setSelectedLocation: (loc: CoastalLocation) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  currentTideHeight: number;
  currentTideTrend: string;
  moonInfo: MoonPhaseInfo;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedLocation,
  setSelectedLocation,
  selectedDate,
  setSelectedDate,
  currentTideHeight,
  currentTideTrend,
  moonInfo,
}) => {
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-slate-900/95">
      {/* Top Banner / Location & Live Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand & Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-xl border border-cyan-400/30">
              <Fish className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-['Outfit',sans-serif]">
                  TideCast SA
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                  🇿🇦 South Africa Marine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-Time Tides, Coastal Weather & DFFE Species Guide
              </p>
            </div>
          </div>

          {/* Location Picker & Live Tidal Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* SA Coastal Spot Selector */}
            <div className="relative flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-sm hover:border-slate-600 transition">
              <MapPin className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Coastal Spot</span>
                <select
                  value={selectedLocation.id}
                  onChange={(e) => {
                    const found = SA_FISHING_LOCATIONS.find((l) => l.id === e.target.value);
                    if (found) setSelectedLocation(found);
                  }}
                  className="bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer pr-4"
                >
                  <optgroup label="West Coast & Cape Town">
                    {SA_FISHING_LOCATIONS.filter((l) => l.coast === 'west_coast').map((loc) => (
                      <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                        {loc.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="South Coast, False Bay & Garden Route">
                    {SA_FISHING_LOCATIONS.filter((l) => l.coast === 'south_coast').map((loc) => (
                      <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                        {loc.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Wild Coast & KwaZulu-Natal (East Coast)">
                    {SA_FISHING_LOCATIONS.filter((l) => l.coast === 'east_coast').map((loc) => (
                      <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                        {loc.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Date Selector */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-sm">
              <Calendar className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Date</span>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [year, month, day] = e.target.value.split('-').map(Number);
                      setSelectedDate(new Date(year, month - 1, day, 12, 0, 0));
                    }
                  }}
                  className="bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Current Real-time Tide Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl">
              <Waves className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-cyan-300 font-mono">{currentTideHeight}m</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-200 font-medium">
                    {currentTideTrend}
                  </span>
                </div>
                <span className="text-[10px] text-cyan-400/80 font-medium">
                  {moonInfo.icon} {moonInfo.springOrNeap}
                </span>
              </div>
            </div>

            {/* In-App PWA Install Button */}
            <PWAInstallButton />

          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="mt-3.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('tides')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === 'tides'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Waves className="w-4 h-4 text-cyan-400" />
            <span>Tide Charts & Weather</span>
          </button>

          <button
            onClick={() => setActiveTab('species')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === 'species'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Fish className="w-4 h-4 text-blue-400" />
            <span>SA Species Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-identify')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === 'ai-identify'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>AI Catch Identifier</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400/20 text-amber-300 font-bold">
              Gemini AI
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logbook')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === 'logbook'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Catch Logbook</span>
          </button>

          <button
            onClick={() => setActiveTab('regulations')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === 'regulations'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>Bait Limits & Rules</span>
          </button>
        </div>
      </div>
    </header>
  );
};

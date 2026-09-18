import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CoastalLocation, MarineWeatherData, CatchLogEntry } from './types';
import { SA_FISHING_LOCATIONS } from './data/saLocations';
import { calculateTidesForDay, getMoonPhaseInfo, getSolunarPeriods } from './utils/tideEngine';
import { fetchMarineWeather, getCachedMarineWeather } from './utils/weatherApi';

import { Header } from './components/Header';
import { TideChart } from './components/TideChart';
import { WeatherWidget } from './components/WeatherWidget';
import { SpeciesGuide } from './components/SpeciesGuide';
import { AiSpeciesIdentifier } from './components/AiSpeciesIdentifier';
import { CatchLogbook } from './components/CatchLogbook';
import { CatchInsights } from './components/CatchInsights';
import { FishingIntelligence } from './components/FishingIntelligence';
import { RegulationsView } from './components/RegulationsView';
import { OfflineIndicator } from './components/OfflineIndicator';

import { Waves, Sparkles, MapPin, Compass, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'sa_fishing_logbook_v1';

/* Legacy demo data removed: new installs and existing demo entries now start empty. */
/* Legacy demo data removed: new installs and existing demo entries now start empty. */

export default function App() {
  const [activeTab, setActiveTab] = useState<'tides' | 'species' | 'ai-identify' | 'logbook' | 'regulations'>('tides');
  const [selectedLocation, setSelectedLocation] = useState<CoastalLocation>(SA_FISHING_LOCATIONS[1]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weather, setWeather] = useState<MarineWeatherData | null>(() => getCachedMarineWeather(SA_FISHING_LOCATIONS[1].lat, SA_FISHING_LOCATIONS[1].lon));
  const [weatherLoading, setWeatherLoading] = useState(false);

  const [catches, setCatches] = useState<CatchLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CatchLogEntry[];
        return Array.isArray(parsed) ? parsed.filter((entry) => !String(entry.id).startsWith('sample-')) : [];
      }
    } catch (e) {
      console.error('Failed to parse saved catches:', e);
    }
    // Fresh installs start empty so Fishing Intelligence is based only on the angler's real catches.
    // Also remove the old built-in demo catches from existing local storage.
    return [];

  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(catches)); }
    catch (e) { console.error('Failed to save catches:', e); }
  }, [catches]);

  const tideData = useMemo(() => calculateTidesForDay(selectedLocation, selectedDate), [selectedLocation, selectedDate]);
  const moonInfo = useMemo(() => getMoonPhaseInfo(selectedDate), [selectedDate]);
  const solunarPeriods = useMemo(() => getSolunarPeriods(selectedDate), [selectedDate]);

  const loadWeatherForLocation = useCallback((lat: number, lon: number) => {
    const cached = getCachedMarineWeather(lat, lon);
    if (cached) setWeather(cached);
    setWeatherLoading(true);
    fetchMarineWeather(lat, lon)
      .then((data) => { setWeather(data); setWeatherLoading(false); })
      .catch((err) => { console.warn('Unable to reach live weather service, falling back to cache:', err); setWeatherLoading(false); });
  }, []);

  useEffect(() => { loadWeatherForLocation(selectedLocation.lat, selectedLocation.lon); }, [selectedLocation.lat, selectedLocation.lon, loadWeatherForLocation]);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.onLine) return;
    const timer = setTimeout(() => {
      const spotsToWarm = SA_FISHING_LOCATIONS.filter((l) => l.id !== selectedLocation.id).slice(0, 5);
      spotsToWarm.forEach((spot) => { fetchMarineWeather(spot.lat, spot.lon).catch(() => {}); });
    }, 4000);
    return () => clearTimeout(timer);
  }, [selectedLocation.id]);

  const handleAddCatch = (entry: CatchLogEntry) => setCatches((prev) => [entry, ...prev]);

  const handleLogFromAi = (partialEntry: Partial<CatchLogEntry>) => {
    const newEntry: CatchLogEntry = {
      id: `catch-${Date.now()}`,
      speciesName: partialEntry.speciesName || 'Unknown Fish',
      lengthCm: partialEntry.lengthCm,
      weightKg: partialEntry.weightKg,
      location: partialEntry.location || selectedLocation.name,
      baitOrLure: partialEntry.baitOrLure || 'Not specified',
      tideState: tideData.currentTrend,
      timestamp: new Date().toISOString(),
      notes: partialEntry.notes,
      photoUrl: partialEntry.photoUrl,
      isLegal: partialEntry.isLegal ?? true,
    };
    handleAddCatch(newEntry);
  };

  const handleDeleteCatch = (id: string) => setCatches((prev) => prev.filter((c) => c.id !== id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} selectedDate={selectedDate} setSelectedDate={setSelectedDate} currentTideHeight={tideData.currentHeight} currentTideTrend={tideData.currentTrend} moonInfo={moonInfo} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <OfflineIndicator isWeatherCached={weather?.isOfflineSnapshot} weatherCachedAt={weather?.cachedAt} onRefreshWeather={() => loadWeatherForLocation(selectedLocation.lat, selectedLocation.lon)} />

        {activeTab === 'tides' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <TideChart location={selectedLocation} selectedDate={selectedDate} curvePoints={tideData.curvePoints} extrema={tideData.extrema} currentHeight={tideData.currentHeight} currentTrend={tideData.currentTrend} nextExtremum={tideData.nextExtremum} moonInfo={moonInfo} solunarPeriods={solunarPeriods} sunrise={weather?.sunrise} sunset={weather?.sunset} />
            <WeatherWidget weather={weather} locationName={selectedLocation.name} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div onClick={() => setActiveTab('species')} className="bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 p-4 rounded-xl cursor-pointer transition flex items-center justify-between group">
                <div><span className="text-xs uppercase font-bold text-blue-400 block tracking-wider">Species Catalog</span><h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition">Explore {selectedLocation.name} Target Fish</h4><p className="text-xs text-slate-400 mt-0.5">{selectedLocation.keySpecies.join(' • ')}</p></div>
                <span className="text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition">View Guide →</span>
              </div>
              <div onClick={() => setActiveTab('ai-identify')} className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition flex items-center justify-between group">
                <div><span className="text-xs uppercase font-bold text-amber-400 block tracking-wider">Catch Analyzer</span><h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">Identify a Fish or Check Minimum Size</h4><p className="text-xs text-slate-400 mt-0.5">Snap a photo to verify DFFE legal requirements</p></div>
                <span className="text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition">Launch AI →</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'species' && <div className="animate-in fade-in duration-200"><SpeciesGuide /></div>}

        {activeTab === 'ai-identify' && <div className="animate-in fade-in duration-200"><AiSpeciesIdentifier onLogCatch={handleLogFromAi} defaultLocationName={selectedLocation.name} /></div>}

        {activeTab === 'logbook' && (
          <div className="animate-in fade-in duration-200">
            <CatchInsights entries={catches} />
            <FishingIntelligence entries={catches} />
            <CatchLogbook entries={catches} onAddEntry={handleAddCatch} onDeleteEntry={handleDeleteCatch} defaultLocation={selectedLocation.name} defaultTideState={tideData.currentTrend} />
          </div>
        )}

        {activeTab === 'regulations' && <div className="animate-in fade-in duration-200"><RegulationsView /></div>}
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 text-slate-500 text-xs py-5 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div><p className="font-medium text-slate-400">TideCast South Africa • Offline-Ready Marine Angling Tool</p><p className="text-[11px] text-slate-500 mt-0.5">Tide curve is a modeled estimate, not an official hydrographic tide table. Marine weather is live when available and cached locally for offline use.</p></div>
          <div className="flex items-center gap-4 text-slate-400"><button onClick={() => setActiveTab('regulations')} className="hover:text-cyan-400 transition cursor-pointer">Bait Limits</button><button onClick={() => setActiveTab('species')} className="hover:text-cyan-400 transition cursor-pointer">Species List</button><button onClick={() => setActiveTab('logbook')} className="hover:text-cyan-400 transition cursor-pointer">Catch Diary</button></div>
        </div>
      </footer>
    </div>
  );
}

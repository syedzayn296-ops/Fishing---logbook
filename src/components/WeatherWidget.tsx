import React, { useState } from 'react';
import { MarineWeatherData } from '../types';
import { getWindCompass } from '../utils/weatherApi';
import { Wind, Waves, Compass, Thermometer, Gauge, Sun, AlertTriangle, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface WeatherWidgetProps {
  weather: MarineWeatherData | null;
  locationName: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, locationName }) => {
  const [unit, setUnit] = useState<'knots' | 'kmh'>('knots');

  if (!weather) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center animate-pulse">
        <Waves className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-bounce" />
        <p className="text-sm text-slate-400">Live marine weather is unavailable for {locationName} right now.</p>
        <p className="text-xs text-slate-500 mt-1">The app will use a cached snapshot when one is available. No estimated conditions are shown as live data.</p>
      </div>
    );
  }

  const windValue = unit === 'knots' ? `${weather.windSpeedKnots} kts` : `${weather.windSpeed} km/h`;
  const gustValue = unit === 'knots' ? `${Math.round(weather.windGusts * 0.539957)} kts` : `${weather.windGusts} km/h`;
  const compassDir = getWindCompass(weather.windDirection);

  const getBiteBadgeClass = (label: string) => {
    switch (label) {
      case 'Prime Time':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-emerald-500/20';
      case 'Excellent':
        return 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 shadow-cyan-500/20';
      case 'Good':
        return 'bg-blue-950/90 text-blue-300 border-blue-500/60';
      case 'Fair':
        return 'bg-amber-950/90 text-amber-300 border-amber-500/60';
      case 'Poor':
      default:
        return 'bg-rose-950/90 text-rose-300 border-rose-500/60';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
      
      {/* Header with Unit Toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white font-['Outfit',sans-serif]">
              {weather.isOfflineSnapshot ? 'Marine & Weather (Offline Snapshot)' : 'Live Marine & Weather Updates'}
            </h2>
            {weather.isOfflineSnapshot ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Cached {weather.cachedAt ? new Date(weather.cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Offline'}
              </span>
            ) : (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {weather.isOfflineSnapshot
              ? `Stored telemetry for ${locationName} • Ready offline`
              : `Real-time telemetry for ${locationName}`}
          </p>
        </div>

        {/* Units Switcher */}
        <div className="flex items-center bg-slate-800 border border-slate-700/80 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setUnit('knots')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              unit === 'knots' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Knots
          </button>
          <button
            onClick={() => setUnit('kmh')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              unit === 'kmh' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Km/h
          </button>
        </div>
      </div>

      {/* Marine condition guidance — not a fish-activity forecast */}
      <div className={`mt-4 p-4 rounded-xl border shadow-lg ${getBiteBadgeClass(weather.biteRating.label)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <span className="text-xs uppercase tracking-wider font-bold block opacity-80">
                Marine Condition Rating
              </span>
              <span className="text-lg font-black font-['Outfit',sans-serif]">
                {weather.biteRating.label} ({weather.biteRating.score}/10)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-black/30 border border-white/10">
              Swell {weather.swellWaveHeight || weather.waveHeight}m @ {weather.swellWavePeriod || weather.wavePeriod}s
            </span>
          </div>
        </div>
        <p className="text-xs mt-2.5 leading-relaxed opacity-95">
          {weather.biteRating.summary}
        </p>
      </div>

      {/* Grid of Marine Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
        
        {/* Swell & Wave Height */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Ocean Swell</span>
            <Waves className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">
                {weather.swellWaveHeight ?? weather.waveHeight}m
              </span>
              <span className="text-xs text-cyan-400 font-mono">
                @ {weather.swellWavePeriod ?? weather.wavePeriod}s
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Dir: {getWindCompass(weather.swellWaveDirection ?? weather.waveDirection ?? 200)} ({weather.swellWaveDirection ?? 200}°)
            </span>
          </div>
        </div>

        {/* Coastal Wind */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Coastal Wind</span>
            <Wind className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">
                {windValue}
              </span>
              <span className="text-xs text-amber-400 font-mono">
                G: {gustValue}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>{compassDir} ({weather.windDirection}°)</span>
            </div>
          </div>
        </div>

        {/* Temperature & Air */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Air Temp</span>
            <Thermometer className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">
                {weather.temperature}°C
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Feels {weather.apparentTemperature}°C
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Max UV: {weather.uvIndex}
            </span>
          </div>
        </div>

        {/* Barometer / Pressure */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Barometer</span>
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">
                {weather.surfacePressure}
              </span>
              <span className="text-xs text-slate-400 font-mono">hPa</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {weather.surfacePressure >= 1018
                ? 'High Pressure'
                : weather.surfacePressure <= 1010
                ? 'Lower Pressure'
                : 'Mid-range Pressure'}
            </span>
          </div>
        </div>

      </div>

      {/* Sun & Coastal Safety Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>First Light / Sunrise: <strong className="text-slate-200">{weather.sunrise}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-orange-400" />
            <span>Last Light / Sunset: <strong className="text-slate-200">{weather.sunset}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Always watch for rogue sets and never turn your back to the ocean on South African rock ledges!</span>
        </div>
      </div>

    </div>
  );
};

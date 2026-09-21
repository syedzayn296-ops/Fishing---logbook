import React, { useMemo } from 'react';
import { Anchor, CalendarClock, Fish, ShieldCheck, Wind, Waves } from 'lucide-react';
import { CatchLogEntry, CoastalLocation, MarineWeatherData, MoonPhaseInfo, SolunarPeriod, TideExtremum } from '../types';

interface FishingPlannerProps {
  location: CoastalLocation;
  selectedDate: Date;
  extrema: TideExtremum[];
  solunarPeriods: SolunarPeriod[];
  moonInfo: MoonPhaseInfo;
  weather: MarineWeatherData | null;
  catches: CatchLogEntry[];
}

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const dayMatches = (date: Date, target: Date) =>
  date.getFullYear() === target.getFullYear() &&
  date.getMonth() === target.getMonth() &&
  date.getDate() === target.getDate();

export const FishingPlanner: React.FC<FishingPlannerProps> = ({
  location,
  selectedDate,
  extrema,
  solunarPeriods,
  moonInfo,
  weather,
  catches,
}) => {
  const upcomingTides = useMemo(
    () => extrema.filter((item) => dayMatches(item.time, selectedDate)).slice(0, 4),
    [extrema, selectedDate]
  );

  const personal = useMemo(() => {
    const local = catches.filter((entry) =>
      entry.location.toLowerCase().includes(location.name.split('(')[0].trim().toLowerCase())
    );
    if (!local.length) return null;
    const counts = new Map<string, number>();
    local.forEach((entry) => counts.set(entry.tideState, (counts.get(entry.tideState) ?? 0) + 1));
    let best = '';
    let highest = 0;
    counts.forEach((count, tide) => {
      if (count > highest) {
        best = tide;
        highest = count;
      }
    });
    return { count: local.length, bestTide: best, bestTideCount: highest };
  }, [catches, location.name]);

  const bestSolunar = useMemo(
    () => [...solunarPeriods].sort((a, b) => b.rating - a.rating)[0],
    [solunarPeriods]
  );

  const dataQuality = weather ? 'Live/cached weather + modeled tide + moon data' : 'Modeled tide + moon data; weather unavailable';

  const decision = useMemo(() => {
    const weatherScore = weather?.biteRating.score ?? 5;
    const solunarScore = bestSolunar?.rating ? bestSolunar.rating * 2 : 5;
    const tideScore = upcomingTides.length >= 2 ? 8 : upcomingTides.length === 1 ? 6 : 4;
    const score = Math.round((weatherScore + solunarScore + tideScore) / 3);
    if (score >= 8) return { label: 'Good window', tone: 'text-emerald-300', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', summary: 'Several useful signals line up. Conditions still need to be checked at the water.' };
    if (score >= 6) return { label: 'Worth a try', tone: 'text-cyan-300', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', summary: 'There are some useful signals, but the conditions are mixed.' };
    return { label: 'Caution', tone: 'text-amber-300', border: 'border-amber-500/30', bg: 'bg-amber-500/10', summary: 'The available signals are limited or mixed. Check local conditions before going.' };
  }, [weather, bestSolunar, upcomingTides.length]);

  return (
    <section className="rounded-2xl border border-cyan-900/50 bg-slate-900/80 p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Fishing Planner</p>
          <h2 className="mt-1 text-lg font-black text-white">Plan for {dayMatches(selectedDate, new Date()) ? 'today' : 'this day'}</h2>
          <p className="mt-1 text-xs text-slate-400">
            {location.name} • {selectedDate.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <span className="w-fit rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Decision support • not a catch guarantee
        </span>
      </div>

      <div className={`mt-4 rounded-xl border ${decision.border} ${decision.bg} p-3 sm:p-4`}>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Combined guidance from marine conditions, tide model, solunar timing and your logged history</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${decision.tone}`}>Planning signal</div>
            <div className={`mt-1 text-lg font-black ${decision.tone}`}>{decision.label}</div>
          </div>
          <div className="text-xs text-slate-300 sm:max-w-xl sm:text-right">{decision.summary}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <Waves className="mb-2 h-4 w-4 text-cyan-400" />
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tide pattern</div>
          <div className="mt-1 text-sm font-bold text-white">{moonInfo.springOrNeap}</div>
          <div className="mt-1 text-[11px] text-slate-400">{upcomingTides.length} modeled tide turns shown</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <Wind className="mb-2 h-4 w-4 text-blue-400" />
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Marine conditions</div>
          <div className="mt-1 text-sm font-bold text-white">{weather ? weather.biteRating.label : 'Unavailable'}</div>
          <div className="mt-1 text-[11px] text-slate-400">{weather ? `${weather.windSpeedKnots} kts wind • ${weather.swellWaveHeight ?? weather.waveHeight ?? '—'}m swell` : 'No live/cached marine weather'}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <CalendarClock className="mb-2 h-4 w-4 text-amber-400" />
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Next useful window</div>
          <div className="mt-1 text-sm font-bold text-white">{upcomingTides[0] ? `${upcomingTides[0].type === 'high' ? 'High' : 'Low'} • ${formatTime(upcomingTides[0].time)}` : '—'}</div>
          <div className="mt-1 text-[11px] text-slate-400">Modelled tide turn; combine with conditions</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <Fish className="mb-2 h-4 w-4 text-emerald-400" />
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your history</div>
          <div className="mt-1 text-sm font-bold text-white">{personal ? personal.bestTide : 'Not enough local data'}</div>
          <div className="mt-1 text-[11px] text-slate-400">{personal ? `${personal.count} logged catch${personal.count === 1 ? '' : 'es'} at this location` : 'Keep logging catches to build a pattern'}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Anchor className="h-4 w-4 text-cyan-400" /> Modeled tide windows
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {upcomingTides.map((item) => (
              <div key={item.time.toISOString()} className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
                <div className="text-xs font-bold text-white">{item.type === 'high' ? 'High' : 'Low'} • {formatTime(item.time)}</div>
                <div className="text-[10px] text-slate-500">{item.height.toFixed(2)} m</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Solunar timing
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            {bestSolunar
              ? `${bestSolunar.type} solunar window around ${formatTime(bestSolunar.startTime)}–${formatTime(bestSolunar.endTime)}. Treat it as approximate guidance and look for a tide/sea-condition overlap.`
              : 'No solunar window available.'}
          </p>
          <p className="mt-2 text-[10px] text-slate-500">{dataQuality}. Personal history is shown only when matching logbook data exists.</p>
        </div>
      </div>
    </section>
  );
};

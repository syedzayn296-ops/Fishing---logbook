import React, { useMemo } from 'react';
import { Anchor, Fish, MapPin, Waves } from 'lucide-react';
import { CatchLogEntry } from '../types';
import { getFishingIntelligence } from '../utils/fishingIntelligence';

interface FishingIntelligenceProps {
  entries: CatchLogEntry[];
}

export const FishingIntelligence: React.FC<FishingIntelligenceProps> = ({ entries }) => {
  const intelligence = useMemo(() => getFishingIntelligence(entries), [entries]);

  if (!entries.length) {
    return (
      <section className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Fishing Intelligence</p>
        <p className="mt-1 text-sm text-slate-400">Log a few catches and this section will learn your patterns.</p>
      </section>
    );
  }

  return (
    <section className="mb-4 rounded-2xl border border-cyan-900/50 bg-slate-900/70 p-4 sm:p-5">
      <div className="mb-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Fishing Intelligence</p>
        <h3 className="text-base font-bold text-white">Patterns from your own catches</h3>
        <p className="mt-1 text-xs text-slate-400">Offline analysis of your logbook — no cloud service required.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <Waves className="mb-2 h-4 w-4 text-cyan-400" />
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Common tide</div>
          <div className="mt-1 text-sm font-semibold text-white">{intelligence.bestTide ?? '—'}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <Anchor className="mb-2 h-4 w-4 text-cyan-400" />
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Common bait / lure</div>
          <div className="mt-1 text-sm font-semibold text-white">{intelligence.bestBait ?? '—'}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <MapPin className="mb-2 h-4 w-4 text-cyan-400" />
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Common spot</div>
          <div className="mt-1 text-sm font-semibold text-white">{intelligence.bestSpot ?? '—'}</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {intelligence.patterns.slice(0, 5).map((pattern) => (
          <div key={pattern.species} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Fish className="h-4 w-4 shrink-0 text-cyan-400" />
                <span className="truncate text-sm font-semibold text-slate-200">{pattern.species}</span>
              </div>
              <span className="shrink-0 text-xs font-bold text-cyan-300">{pattern.catchCount} catch{pattern.catchCount === 1 ? '' : 'es'}</span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-slate-400 sm:grid-cols-3">
              <span>Tide: {pattern.topTide ?? '—'}</span>
              <span>Bait: {pattern.topBait ?? '—'}</span>
              <span>Spot: {pattern.topSpot ?? '—'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-[11px] text-slate-500">
        Measurement coverage: {intelligence.measuredRate}% of logged catches include a length or weight.
      </div>
    </section>
  );
};

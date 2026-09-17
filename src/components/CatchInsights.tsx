import React, { useMemo } from 'react';
import { Fish, MapPin, Ruler, Scale, Trophy } from 'lucide-react';
import { CatchLogEntry } from '../types';
import { getCatchInsights } from '../utils/catchInsights';

interface CatchInsightsProps {
  entries: CatchLogEntry[];
}

export const CatchInsights: React.FC<CatchInsightsProps> = ({ entries }) => {
  const stats = useMemo(() => getCatchInsights(entries), [entries]);

  const cards = [
    { label: 'Total catches', value: stats.totalCatches, icon: Fish },
    { label: 'Species', value: stats.uniqueSpecies, icon: Trophy },
    { label: 'Spots', value: stats.uniqueLocations, icon: MapPin },
    { label: 'Longest', value: stats.longestCatchCm !== undefined ? `${stats.longestCatchCm} cm` : '—', icon: Ruler },
    { label: 'Heaviest', value: stats.heaviestCatchKg !== undefined ? `${stats.heaviestCatchKg.toFixed(1)} kg` : '—', icon: Scale },
  ];

  return (
    <section className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Catch Insights</p>
          <h3 className="text-base font-bold text-white">Your fishing record</h3>
        </div>
        {stats.flaggedCatches > 0 && (
          <span className="rounded-full border border-amber-700/50 bg-amber-950/30 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
            {stats.flaggedCatches} flagged
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <Icon className="mb-2 h-4 w-4 text-cyan-400" aria-hidden="true" />
            <div className="text-lg font-bold text-white">{value}</div>
            <div className="text-[11px] text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {(stats.mostCaughtSpecies || stats.mostProductiveLocation) && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {stats.mostCaughtSpecies && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Most caught</div>
              <div className="mt-1 text-sm font-semibold text-slate-200">{stats.mostCaughtSpecies}</div>
            </div>
          )}
          {stats.mostProductiveLocation && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Most productive spot</div>
              <div className="mt-1 text-sm font-semibold text-slate-200">{stats.mostProductiveLocation}</div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

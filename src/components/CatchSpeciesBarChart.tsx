import React, { useMemo, useState } from 'react';
import { CatchLogEntry } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Fish, Trophy, Award, BarChart3, Filter, ArrowUpDown, Sparkles } from 'lucide-react';

interface CatchSpeciesBarChartProps {
  entries: CatchLogEntry[];
  selectedSpeciesFilter?: string | null;
  onSelectSpeciesFilter?: (species: string | null) => void;
}

// Marine oceanic palette for species frequency bars
const BAR_COLORS = [
  '#06b6d4', // Cyan
  '#0ea5e9', // Sky blue
  '#14b8a6', // Teal
  '#3b82f6', // Ocean blue
  '#6366f1', // Indigo
  '#2dd4bf', // Emerald/Mint
  '#818cf8', // Periwinkle
  '#0284c7', // Deep sky
];

export const CatchSpeciesBarChart: React.FC<CatchSpeciesBarChartProps> = ({
  entries,
  selectedSpeciesFilter,
  onSelectSpeciesFilter,
}) => {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [sortBy, setSortBy] = useState<'count' | 'name'>('count');

  // Aggregate catches by species type
  const { speciesData, topSpecies, totalCatches, totalUniqueSpecies } = useMemo(() => {
    const total = entries.length;
    if (total === 0) {
      return {
        speciesData: [],
        topSpecies: null,
        totalCatches: 0,
        totalUniqueSpecies: 0,
      };
    }

    const map = new Map<
      string,
      {
        speciesName: string;
        count: number;
        legalCount: number;
        releasedCount: number;
        lengths: number[];
        weights: number[];
        locations: Record<string, number>;
      }
    >();

    entries.forEach((entry) => {
      const name = entry.speciesName.trim() || 'Unknown Species';
      if (!map.has(name)) {
        map.set(name, {
          speciesName: name,
          count: 0,
          legalCount: 0,
          releasedCount: 0,
          lengths: [],
          weights: [],
          locations: {},
        });
      }

      const item = map.get(name)!;
      item.count += 1;
      if (entry.isLegal) {
        item.legalCount += 1;
      } else {
        item.releasedCount += 1;
      }

      if (entry.lengthCm) item.lengths.push(entry.lengthCm);
      if (entry.weightKg) item.weights.push(entry.weightKg);

      const loc = entry.location || 'Unknown Spot';
      item.locations[loc] = (item.locations[loc] || 0) + 1;
    });

    const list = Array.from(map.values()).map((item) => {
      // Find top location for this species
      let topLoc = 'Various';
      let maxLocCount = 0;
      Object.entries(item.locations).forEach(([loc, cnt]) => {
        if (cnt > maxLocCount) {
          maxLocCount = cnt;
          topLoc = loc;
        }
      });

      // Shorter display label for charts (strips secondary parenthesized descriptions if long)
      const cleanName = item.speciesName.split('(')[0].split('/')[0].trim();

      const avgLen = item.lengths.length
        ? (item.lengths.reduce((a, b) => a + b, 0) / item.lengths.length).toFixed(1)
        : null;

      const avgWeight = item.weights.length
        ? (item.weights.reduce((a, b) => a + b, 0) / item.weights.length).toFixed(1)
        : null;

      const maxWeight = item.weights.length ? Math.max(...item.weights).toFixed(1) : null;

      return {
        speciesName: item.speciesName,
        displayName: cleanName,
        count: item.count,
        legalCount: item.legalCount,
        releasedCount: item.releasedCount,
        percentage: Math.round((item.count / total) * 100),
        avgLengthCm: avgLen,
        avgWeightKg: avgWeight,
        maxWeightKg: maxWeight,
        topLocation: topLoc,
      };
    });

    // Sorting
    if (sortBy === 'count') {
      list.sort((a, b) => b.count - a.count);
    } else {
      list.sort((a, b) => a.displayName.localeCompare(b.displayName));
    }

    const mostCaught = list.length > 0 ? list[0] : null;

    return {
      speciesData: list,
      topSpecies: mostCaught,
      totalCatches: total,
      totalUniqueSpecies: list.length,
    };
  }, [entries, sortBy]);

  // Empty state if no catches in logbook
  if (entries.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white font-['Outfit',sans-serif]">
          Species Frequency Visualization
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Record your first catches in the logbook above to generate frequency breakdown charts and identify your most targeted South African marine species.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">
              Catches by Species Frequency
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {totalUniqueSpecies} {totalUniqueSpecies === 1 ? 'Species' : 'Species Types'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Recharts visualization of your catch distribution along the South African coastline.
          </p>
        </div>

        {/* Chart View & Sort Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Sorting */}
          <button
            onClick={() => setSortBy(sortBy === 'count' ? 'name' : 'count')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition cursor-pointer"
            title="Sort species by frequency count or alphabetically"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>{sortBy === 'count' ? 'By Frequency' : 'Alphabetical'}</span>
          </button>

          {/* Orientation Toggle */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setOrientation('horizontal')}
              className={`px-2 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                orientation === 'horizontal'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Horizontal
            </button>
            <button
              onClick={() => setOrientation('vertical')}
              className={`px-2 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                orientation === 'vertical'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vertical
            </button>
          </div>

          {/* Clear filter if active */}
          {selectedSpeciesFilter && onSelectSpeciesFilter && (
            <button
              onClick={() => onSelectSpeciesFilter(null)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-semibold hover:bg-cyan-900 transition cursor-pointer"
            >
              <Filter className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Insight Badges & Top Fish Banner */}
      {topSpecies && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* #1 Most Caught Card */}
          <div className="sm:col-span-2 bg-gradient-to-r from-cyan-950/40 via-slate-800/40 to-slate-800/20 border border-cyan-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                    Most Frequently Caught
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                    #1 in Logbook
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white leading-tight mt-0.5">
                  {topSpecies.speciesName}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Top hotspot: <span className="text-slate-300 font-semibold">{topSpecies.topLocation}</span>
                  {topSpecies.avgWeightKg && ` • Avg: ${topSpecies.avgWeightKg} kg`}
                  {topSpecies.maxWeightKg && ` • PB: ${topSpecies.maxWeightKg} kg`}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {topSpecies.count}
              </span>
              <span className="text-[10px] text-slate-400 block font-semibold">
                {topSpecies.percentage}% of catches
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Fish Logged:</span>
              <span className="font-bold text-white font-mono">{totalCatches}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-slate-400">Species Types:</span>
              <span className="font-bold text-cyan-300 font-mono">{totalUniqueSpecies}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-slate-400">Legal Compliance:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {Math.round(
                  (speciesData.reduce((acc, curr) => acc + curr.legalCount, 0) / totalCatches) * 100
                )}
                %
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Recharts Bar Chart Container */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 pt-5">
        <div className="h-[280px] sm:h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {orientation === 'horizontal' ? (
              // HORIZONTAL BAR CHART (Best for readable species labels on Y-axis)
              <BarChart
                layout="vertical"
                data={speciesData}
                margin={{ top: 10, right: 30, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={{ stroke: '#334155' }}
                  domain={[0, 'dataMax + 1']}
                />
                <YAxis
                  dataKey="displayName"
                  type="category"
                  width={110}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(51, 65, 85, 0.25)' }}
                  content={<CustomTooltip totalCatches={totalCatches} />}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={32}
                  cursor="pointer"
                >
                  {speciesData.map((entry, index) => {
                    const isSelected = selectedSpeciesFilter === entry.speciesName;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        onClick={() => {
                          if (onSelectSpeciesFilter) {
                            onSelectSpeciesFilter(
                              selectedSpeciesFilter === entry.speciesName ? null : entry.speciesName
                            );
                          }
                        }}
                        fill={
                          isSelected
                            ? '#22d3ee'
                            : BAR_COLORS[index % BAR_COLORS.length]
                        }
                        stroke={isSelected ? '#ffffff' : 'transparent'}
                        strokeWidth={isSelected ? 2 : 0}
                        fillOpacity={
                          selectedSpeciesFilter
                            ? isSelected
                              ? 1
                              : 0.35
                            : 0.9
                        }
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            ) : (
              // VERTICAL BAR CHART
              <BarChart
                data={speciesData}
                margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="displayName"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={{ stroke: '#334155' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={{ stroke: '#334155' }}
                  domain={[0, 'dataMax + 1']}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(51, 65, 85, 0.25)' }}
                  content={<CustomTooltip totalCatches={totalCatches} />}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                  cursor="pointer"
                >
                  {speciesData.map((entry, index) => {
                    const isSelected = selectedSpeciesFilter === entry.speciesName;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        onClick={() => {
                          if (onSelectSpeciesFilter) {
                            onSelectSpeciesFilter(
                              selectedSpeciesFilter === entry.speciesName ? null : entry.speciesName
                            );
                          }
                        }}
                        fill={
                          isSelected
                            ? '#22d3ee'
                            : BAR_COLORS[index % BAR_COLORS.length]
                        }
                        stroke={isSelected ? '#ffffff' : 'transparent'}
                        strokeWidth={isSelected ? 2 : 0}
                        fillOpacity={
                          selectedSpeciesFilter
                            ? isSelected
                              ? 1
                              : 0.35
                            : 0.9
                        }
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart interaction hints & legend */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Click any bar to filter logbook entries for that specific fish.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-cyan-400 inline-block"></span>
              <span>High Frequency</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block"></span>
              <span>Moderate</span>
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

// Custom High-Contrast Recharts Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  totalCatches: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, totalCatches }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const count = data.count as number;
  const pct = Math.round((count / totalCatches) * 100);

  return (
    <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-[210px] text-xs">
      <div className="border-b border-slate-800 pb-1.5 mb-2">
        <h4 className="font-bold text-white font-['Outfit',sans-serif] text-sm">
          {data.speciesName}
        </h4>
        <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
          South African Marine Species
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Total Catches:</span>
          <span className="font-bold text-cyan-300 font-mono text-sm">
            {count} <span className="text-xs text-slate-400 font-normal">({pct}%)</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Legal vs Released:</span>
          <span className="font-medium text-slate-200">
            <span className="text-emerald-400">{data.legalCount} legal</span> •{' '}
            <span className="text-rose-400">{data.releasedCount} released</span>
          </span>
        </div>

        {data.topLocation && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Top Hotspot:</span>
            <span className="font-medium text-slate-200 truncate max-w-[120px]">
              {data.topLocation}
            </span>
          </div>
        )}

        {(data.avgLengthCm || data.avgWeightKg) && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
            <span className="text-slate-400">Averages:</span>
            <span className="font-mono text-slate-300">
              {data.avgLengthCm ? `${data.avgLengthCm}cm` : ''}
              {data.avgLengthCm && data.avgWeightKg ? ' / ' : ''}
              {data.avgWeightKg ? `${data.avgWeightKg}kg` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

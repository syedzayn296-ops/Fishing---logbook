import React, { useState } from 'react';
import { CoastalLocation, MoonPhaseInfo, SolunarPeriod, TideExtremum, TidePoint } from '../types';
import { Waves, ArrowUpRight, ArrowDownRight, Clock, Moon, Sun, Sparkles, Compass } from 'lucide-react';

interface TideChartProps {
  location: CoastalLocation;
  selectedDate: Date;
  curvePoints: TidePoint[];
  extrema: TideExtremum[];
  currentHeight: number;
  currentTrend: string;
  nextExtremum: TideExtremum | null;
  moonInfo: MoonPhaseInfo;
  solunarPeriods: SolunarPeriod[];
  sunrise?: string;
  sunset?: string;
}

export const TideChart: React.FC<TideChartProps> = ({
  location,
  selectedDate,
  curvePoints,
  extrema,
  currentHeight,
  currentTrend,
  nextExtremum,
  moonInfo,
  solunarPeriods,
  sunrise = '06:15',
  sunset = '18:45',
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TidePoint | null>(null);
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 260;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Display range for the current model. These heights are NOT calibrated to SANHO chart datum.
  const minHeight = 0.0;
  const maxHeight = 2.4;

  const getX = (date: Date) => {
    const hours = date.getHours() + date.getMinutes() / 60;
    return paddingLeft + (hours / 24) * chartWidth;
  };

  const getY = (height: number) => {
    const clamped = Math.max(minHeight, Math.min(maxHeight, height));
    const ratio = (clamped - minHeight) / (maxHeight - minHeight);
    return paddingTop + (1 - ratio) * chartHeight;
  };

  // Construct SVG Path
  let pathD = '';
  if (curvePoints.length > 0) {
    pathD = `M ${getX(curvePoints[0].time)} ${getY(curvePoints[0].height)}`;
    for (let i = 1; i < curvePoints.length; i++) {
      const p = curvePoints[i];
      pathD += ` L ${getX(p.time)} ${getY(p.height)}`;
    }
  }

  // Area under curve
  const areaD = `${pathD} L ${paddingLeft + chartWidth} ${paddingTop + chartHeight} L ${paddingLeft} ${paddingTop + chartHeight} Z`;

  // Current time position if viewing today
  const now = new Date();
  const currentNowX = isToday ? getX(now) : null;

  // Sunrise and sunset X coordinates
  const parseTimeString = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 6) + (m || 0) / 60;
  };
  const sunriseX = paddingLeft + (parseTimeString(sunrise) / 24) * chartWidth;
  const sunsetX = paddingLeft + (parseTimeString(sunset) / 24) * chartWidth;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
      
      {/* Top Header & Key Metrics */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white font-['Outfit',sans-serif]">
              Tide Conditions
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 font-mono">
              Modelled estimate
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reference station: <span className="text-slate-200 font-medium">{location.tideStationName}</span> · {location.regionName}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center rounded-full border border-amber-700/60 bg-amber-950/70 px-2 py-1 text-[10px] font-bold tracking-wider text-amber-300">
              ⚠ NOT FOR NAVIGATION
            </span>
            <span className="text-[11px] text-slate-500">
              Recreational fishing planning only · official tide tables remain the reference.
            </span>
          </div>
        </div>

        {/* Current Tide Quick Status Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${currentTrend.includes('Rising') ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-500/20 text-blue-400'}`}>
              {currentTrend.includes('Rising') ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Water Level</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-white font-mono">{currentHeight}m</span>
                <span className="text-xs text-cyan-300 font-medium">{currentTrend}</span>
              </div>
            </div>
          </div>

          {nextExtremum && (
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Next {nextExtremum.type === 'high' ? 'High Tide' : 'Low Tide'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-amber-300 font-mono">
                    {nextExtremum.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs text-slate-300 font-mono">({nextExtremum.height}m)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive SVG Tide Curve */}
      <div className="mt-5 relative overflow-hidden">
        
        {/* Floating tooltip on hover */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-slate-800/95 border border-cyan-500/40 px-3 py-1.5 rounded-lg shadow-lg text-xs z-10 pointer-events-none">
            <span className="text-slate-400 font-mono">
              {hoveredPoint.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:
            </span>{' '}
            <span className="text-cyan-300 font-bold font-mono">{hoveredPoint.height}m</span>
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[620px] select-none"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="tideGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.38" />
                <stop offset="70%" stopColor="#0284c7" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="daylightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Daylight Background Band (Sunrise to Sunset) */}
            <rect
              x={sunriseX}
              y={paddingTop}
              width={Math.max(0, sunsetX - sunriseX)}
              height={chartHeight}
              fill="url(#daylightGradient)"
            />
            {/* Sunrise line */}
            <line
              x1={sunriseX}
              y1={paddingTop}
              x2={sunriseX}
              y2={paddingTop + chartHeight}
              stroke="#d97706"
              strokeDasharray="3,3"
              strokeOpacity="0.4"
            />
            <text x={sunriseX + 4} y={paddingTop + 14} fill="#fbbf24" fontSize="9" opacity="0.8">
              ☀️ Sunrise {sunrise}
            </text>

            {/* Sunset line */}
            <line
              x1={sunsetX}
              y1={paddingTop}
              x2={sunsetX}
              y2={paddingTop + chartHeight}
              stroke="#d97706"
              strokeDasharray="3,3"
              strokeOpacity="0.4"
            />
            <text x={sunsetX - 65} y={paddingTop + 14} fill="#fbbf24" fontSize="9" opacity="0.8">
              🌅 Sunset {sunset}
            </text>

            {/* Horizontal Grid Lines & Y-axis labels */}
            {[0.5, 1.0, 1.5, 2.0].map((h) => {
              const y = getY(h);
              return (
                <g key={h}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={paddingLeft + chartWidth}
                    y2={y}
                    stroke="#334155"
                    strokeDasharray="2,4"
                    strokeOpacity="0.7"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {h.toFixed(1)}m
                  </text>
                </g>
              );
            })}

            {/* Time X-axis Grid Lines & labels (Every 3 hours) */}
            {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((hour) => {
              const x = paddingLeft + (hour / 24) * chartWidth;
              const label = `${hour.toString().padStart(2, '0')}:00`;
              return (
                <g key={hour}>
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + chartHeight}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={paddingTop + chartHeight + 16}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Shaded Area Under Tide Curve */}
            {areaD && <path d={areaD} fill="url(#tideGradient)" />}

            {/* Solid Tide Curve Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* High and Low Tide Extrema Badges on the Curve */}
            {extrema.map((ext, idx) => {
              const cx = getX(ext.time);
              const cy = getY(ext.height);
              const isHigh = ext.type === 'high';
              const timeStr = ext.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <g key={idx} className="cursor-pointer">
                  {/* Glowing ring */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="5"
                    fill={isHigh ? '#06b6d4' : '#38bdf8'}
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                  {/* Callout box */}
                  <g transform={`translate(${cx}, ${isHigh ? cy - 28 : cy + 18})`}>
                    <rect
                      x="-32"
                      y="-12"
                      width="64"
                      height="20"
                      rx="5"
                      fill={isHigh ? '#083344' : '#172554'}
                      stroke={isHigh ? '#06b6d4' : '#3b82f6'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {timeStr} • {ext.height}m
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Current Time Needle Marker */}
            {currentNowX !== null && currentNowX >= paddingLeft && currentNowX <= paddingLeft + chartWidth && (
              <g>
                <line
                  x1={currentNowX}
                  y1={paddingTop}
                  x2={currentNowX}
                  y2={paddingTop + chartHeight}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
                <circle
                  cx={currentNowX}
                  cy={getY(currentHeight)}
                  r="6"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <rect
                  x={currentNowX - 22}
                  y={paddingTop + chartHeight + 22}
                  width="44"
                  height="16"
                  rx="3"
                  fill="#ef4444"
                />
                <text
                  x={currentNowX}
                  y={paddingTop + chartHeight + 33}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                >
                  NOW
                </text>
              </g>
            )}

            {/* Transparent hover tracker overlay */}
            {curvePoints.map((pt, i) => {
              const x = getX(pt.time);
              return (
                <rect
                  key={i}
                  x={x - 4}
                  y={paddingTop}
                  width="8"
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredPoint(pt)}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Extrema Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {extrema.map((ext, idx) => {
          const isHigh = ext.type === 'high';
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border ${
                isHigh
                  ? 'bg-cyan-950/30 border-cyan-800/40 text-cyan-300'
                  : 'bg-blue-950/30 border-blue-800/40 text-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {isHigh ? 'High Tide' : 'Low Tide'}
                </span>
                {isHigh ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-blue-400" />
                )}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-bold font-mono text-white">
                  {ext.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-sm font-semibold text-cyan-400 font-mono">
                  {ext.height}m
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Row: Moon Phase & Solunar Bite Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 mt-5 pt-5 border-t border-slate-800/80 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
        
        {/* Moon & Tide Cycle */}
        <div className="py-4 md:pr-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{moonInfo.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-white font-['Outfit',sans-serif]">
                  {moonInfo.phaseName}
                </h3>
                <span className="text-xs text-slate-400">
                  {moonInfo.ageDays} days old · {moonInfo.illumination}% illuminated
                </span>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                moonInfo.isSpringTide
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                  : moonInfo.springOrNeap === 'Neap Tide'
                  ? 'bg-blue-950/80 text-blue-300 border border-blue-700/60'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {moonInfo.springOrNeap}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            {moonInfo.isSpringTide ? (
              <span>
                <strong className="text-amber-300">Spring Tide in South Africa:</strong> Highest tidal movement of the month. Massive water surge through estuary mouths (Breede, Swartkops, Knysna) and churning surf. Ideal for Galjoen, Kob, and bait gathering at extreme low water!
              </span>
            ) : moonInfo.springOrNeap === 'Neap Tide' ? (
              <span>
                <strong className="text-blue-300">Neap Tide in South Africa:</strong> Gentle tidal current with lower water exchange. Better for offshore boat fishing, bottom dropping over deep reefs, and clearer visibility.
              </span>
            ) : (
              <span>
                <strong className="text-slate-200">Moderate Tidal Range:</strong> Steady water flow ideal for rock and surf anglers working sandy gutters and estuary channel drop-offs.
              </span>
            )}
          </p>
        </div>

        {/* Fishing Windows */}
        <div className="py-4 md:pl-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-['Outfit',sans-serif]">
                Best Fishing Windows
              </h3>
            </div>
            <span className="text-[11px] text-amber-400/90 font-medium">
              Major & Minor
            </span>
          </div>

          <div className="space-y-2 mt-3">
            {solunarPeriods.slice(0, 2).map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-900/60 border border-slate-800 px-3 py-2 rounded-lg text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      p.type === 'Major'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {p.type}
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">
                    {p.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {p.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center text-amber-400">
                  {'★'.repeat(p.rating)}
                  <span className="text-slate-600">{'★'.repeat(5 - p.rating)}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 mt-2.5">
            Solunar windows are approximate guidance. Combine them with the actual tide, weather and your own catch history rather than treating them as a guaranteed bite forecast.
          </p>
        </div>

      </div>

    </div>
  );
};

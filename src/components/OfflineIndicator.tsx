import React, { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Wifi, Database, CheckCircle2, RefreshCw } from 'lucide-react';

interface OfflineIndicatorProps {
  isWeatherCached?: boolean;
  weatherCachedAt?: string;
  onRefreshWeather?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isWeatherCached,
  weatherCachedAt,
  onRefreshWeather,
}) => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  // If online and not serving an old snapshot, display subtle status or nothing
  if (isOnline && !isWeatherCached) {
    return null;
  }

  if (dismissed && isOnline) {
    return null;
  }

  const cachedTimeStr = weatherCachedAt
    ? new Date(weatherCachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border border-amber-500/40 rounded-xl p-3 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
            {!isOnline ? <WifiOff className="w-4 h-4" /> : <Database className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300">
                {!isOnline ? 'Offline Angling Mode Active' : 'Serving Cached Weather Snapshot'}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-500/30">
                100% Offline Capable
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {!isOnline
                ? `No internet connection detected. All 14 South African tide curves, solunar feeding windows, and cached weather for this spot (${cachedTimeStr ? `saved at ${cachedTimeStr}` : 'offline snapshot'}) remain fully accessible.`
                : `Network is online, using local cache (${cachedTimeStr ? `cached at ${cachedTimeStr}` : 'offline snapshot'}).`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onRefreshWeather && (
            <button
              onClick={onRefreshWeather}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Sync</span>
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

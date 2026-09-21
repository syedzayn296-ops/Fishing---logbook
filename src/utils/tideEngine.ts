import { MoonPhaseInfo, SolunarPeriod, TideExtremum, TidePoint, CoastalLocation } from '../types';

/**
 * Calculates Moon Phase and Spring/Neap status for any given Date.
 * Synodic month: ~29.53058867 days.
 * Known reference New Moon: Jan 11, 2024 at 11:57 UTC.
 */
export function getMoonPhaseInfo(date: Date): MoonPhaseInfo {
  const knownNewMoon = new Date(Date.UTC(2024, 0, 11, 11, 57, 0)).getTime();
  const diffMs = date.getTime() - knownNewMoon;
  const synodicMonthMs = 29.53058867 * 24 * 60 * 60 * 1000;
  
  let phaseProgress = (diffMs % synodicMonthMs) / synodicMonthMs;
  if (phaseProgress < 0) phaseProgress += 1;

  const ageDays = phaseProgress * 29.53058867;
  // Illumination calculation (0 to 100%)
  const illumination = Math.round((1 - Math.cos(phaseProgress * 2 * Math.PI)) / 2 * 100);

  let phaseName = 'New Moon';
  let icon = '🌑';

  if (phaseProgress < 0.03 || phaseProgress > 0.97) {
    phaseName = 'New Moon';
    icon = '🌑';
  } else if (phaseProgress < 0.22) {
    phaseName = 'Waxing Crescent';
    icon = '🌒';
  } else if (phaseProgress < 0.28) {
    phaseName = 'First Quarter';
    icon = '🌓';
  } else if (phaseProgress < 0.47) {
    phaseName = 'Waxing Gibbous';
    icon = '🌔';
  } else if (phaseProgress < 0.53) {
    phaseName = 'Full Moon';
    icon = '🌕';
  } else if (phaseProgress < 0.72) {
    phaseName = 'Waning Gibbous';
    icon = '🌖';
  } else if (phaseProgress < 0.78) {
    phaseName = 'Last Quarter';
    icon = '🌗';
  } else {
    phaseName = 'Waning Crescent';
    icon = '🌘';
  }

  // Spring tides occur during Full Moon and New Moon (approx days 0-2 and 14-16)
  const distFromNew = Math.min(ageDays, 29.53 - ageDays);
  const distFromFull = Math.abs(ageDays - 14.76);
  const minDistToSyzygy = Math.min(distFromNew, distFromFull);

  const isSpringTide = minDistToSyzygy <= 2.2;
  const isNeapTide = Math.abs(ageDays - 7.38) <= 2.0 || Math.abs(ageDays - 22.14) <= 2.0;

  const springOrNeap = isSpringTide ? 'Spring Tide' : isNeapTide ? 'Neap Tide' : 'Mid-Tide';

  return {
    phaseName,
    illumination,
    isSpringTide,
    springOrNeap,
    icon,
    ageDays: Math.round(ageDays * 10) / 10,
  };
}

/**
 * Calculates continuous tide height and extrema for a location and base date.
 * Uses South African tidal harmonic approximations (semi-diurnal M2 + S2).
 */
export function calculateTidesForDay(
  location: CoastalLocation,
  baseDate: Date
): {
  curvePoints: TidePoint[];
  extrema: TideExtremum[];
  currentHeight: number;
  currentTrend: 'Rising (Flood)' | 'Falling (Ebb)' | 'Slack High' | 'Slack Low';
  nextExtremum: TideExtremum | null;
} {
  const moonInfo = getMoonPhaseInfo(baseDate);
  const isSpring = moonInfo.isSpringTide;
  const isNeap = moonInfo.springOrNeap === 'Neap Tide';

  // Base range adjustment
  const springMultiplier = isSpring ? 1.25 : isNeap ? 0.75 : 1.0;
  const amplitude = (location.meanSpringRange / 2) * springMultiplier;
  // Fallback model is relative. Chart datum / mean sea level is port-specific and must not be invented.
  const meanSeaLevel = 0;

  // Semi-diurnal cycle: 12h 25m = 745.2 minutes
  const tidalPeriodHours = 12.4206; 

  // Location offset plus astronomical day offset
  // Reference anchor: Nov 1, 2024 03:30 SAST high tide in Table Bay
  const referenceTime = new Date('2024-11-01T03:30:00+02:00').getTime();
  const offsetMs = location.tideOffsetMinutes * 60 * 1000;

  // Generate 24 hours of data from start of selected day (00:00 to 23:59)
  const startOfDay = new Date(baseDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  const curvePoints: TidePoint[] = [];
  const stepMinutes = 15;
  const totalSteps = (24 * 60) / stepMinutes;

  for (let i = 0; i <= totalSteps; i++) {
    const pointTime = new Date(startOfDay.getTime() + i * stepMinutes * 60 * 1000);
    const elapsedHours = (pointTime.getTime() - referenceTime - offsetMs) / (1000 * 60 * 60);

    // Primary M2 tidal wave + S2 solar wave + diurnal inequality perturbation
    const m2Phase = (2 * Math.PI * elapsedHours) / tidalPeriodHours;
    const s2Phase = (2 * Math.PI * elapsedHours) / 12.0;
    const diurnalPhase = (2 * Math.PI * elapsedHours) / 24.84;

    const height =
      meanSeaLevel +
      amplitude * 0.85 * Math.cos(m2Phase) +
      amplitude * 0.20 * Math.cos(s2Phase) +
      0.08 * Math.sin(diurnalPhase);

    curvePoints.push({
      time: pointTime,
      height: Math.max(0.05, Math.round(height * 100) / 100),
    });
  }

  // Identify extrema (peaks and troughs)
  const extrema: TideExtremum[] = [];
  for (let i = 1; i < curvePoints.length - 1; i++) {
    const prev = curvePoints[i - 1].height;
    const curr = curvePoints[i].height;
    const next = curvePoints[i + 1].height;

    if (curr > prev && curr >= next) {
      extrema.push({
        time: curvePoints[i].time,
        height: curr,
        type: 'high',
      });
    } else if (curr < prev && curr <= next) {
      extrema.push({
        time: curvePoints[i].time,
        height: curr,
        type: 'low',
      });
    }
  }

  // Use real time only when viewing today. For another selected date, use the start of that selected day
  // so the chart's status and next-extremum belong to the date being displayed.
  const now = new Date();
  const sameCalendarDay =
    now.getFullYear() === startOfDay.getFullYear() &&
    now.getMonth() === startOfDay.getMonth() &&
    now.getDate() === startOfDay.getDate();
  const statusTime = sameCalendarDay ? now : startOfDay;
  const nowElapsedHours = (statusTime.getTime() - referenceTime - offsetMs) / (1000 * 60 * 60);
  const nowM2 = (2 * Math.PI * nowElapsedHours) / tidalPeriodHours;
  const nowS2 = (2 * Math.PI * nowElapsedHours) / 12.0;
  const nowDiurnal = (2 * Math.PI * nowElapsedHours) / 24.84;

  const currentHeight = Math.max(
    0.1,
    Math.round(
      (meanSeaLevel +
        amplitude * 0.85 * Math.cos(nowM2) +
        amplitude * 0.20 * Math.cos(nowS2) +
        0.08 * Math.sin(nowDiurnal)) *
        100
    ) / 100
  );

  // Velocity / derivative to determine trend
  const deriv =
    -(amplitude * 0.85 * (2 * Math.PI / tidalPeriodHours)) * Math.sin(nowM2) -
    (amplitude * 0.20 * (2 * Math.PI / 12.0)) * Math.sin(nowS2);

  let currentTrend: 'Rising (Flood)' | 'Falling (Ebb)' | 'Slack High' | 'Slack Low';
  if (Math.abs(deriv) < 0.05) {
    currentTrend = currentHeight > meanSeaLevel ? 'Slack High' : 'Slack Low';
  } else if (deriv > 0) {
    currentTrend = 'Rising (Flood)';
  } else {
    currentTrend = 'Falling (Ebb)';
  }

  // Find next upcoming extremum
  const futureExtrema = extrema.filter((e) => e.time.getTime() > statusTime.getTime());
  const nextExtremum = futureExtrema.length > 0 ? futureExtrema[0] : null;

  return {
    curvePoints,
    extrema,
    currentHeight,
    currentTrend,
    nextExtremum,
  };
}

/**
 * Calculates Solunar feeding periods (Major and Minor bite times)
 * Based on lunar transit, underfoot, moonrise, and moonset times.
 */
export function getSolunarPeriods(baseDate: Date): SolunarPeriod[] {
  const moonInfo = getMoonPhaseInfo(baseDate);
  const startOfDay = new Date(baseDate);
  startOfDay.setHours(0, 0, 0, 0);

  // Major feeding times occur when the moon is overhead (transit) or underfoot (nadir)
  // Shift by roughly 50 minutes each lunar day
  const transitOffsetHours = (moonInfo.ageDays * 0.84) % 24;
  const nadirOffsetHours = (transitOffsetHours + 12.4) % 24;

  const major1Start = new Date(startOfDay.getTime() + transitOffsetHours * 3600 * 1000);
  const major1End = new Date(major1Start.getTime() + 2 * 3600 * 1000); // 2-hour window

  const major2Start = new Date(startOfDay.getTime() + nadirOffsetHours * 3600 * 1000);
  const major2End = new Date(major2Start.getTime() + 2 * 3600 * 1000);

  // Minor feeding times occur during moonrise and moonset (roughly halfway between majors)
  const minor1Start = new Date(major1Start.getTime() + 6.2 * 3600 * 1000);
  const minor1End = new Date(minor1Start.getTime() + 1 * 3600 * 1000); // 1-hour window

  const minor2Start = new Date(major2Start.getTime() + 6.2 * 3600 * 1000);
  const minor2End = new Date(minor2Start.getTime() + 1 * 3600 * 1000);

  const baseRating = moonInfo.isSpringTide ? 5 : moonInfo.springOrNeap === 'Neap Tide' ? 2 : 3;

  return [
    {
      type: 'Major',
      startTime: major1Start,
      endTime: major1End,
      rating: baseRating,
      description: 'Lunar Transit: Peak feeding window. Fish actively hunt baitfish along surf gutters and reef drop-offs.',
    },
    {
      type: 'Major',
      startTime: major2Start,
      endTime: major2End,
      rating: baseRating,
      description: 'Lunar Underfoot: Secondary peak feeding window. Outstanding for night estuarine Kob and Grunter.',
    },
    {
      type: 'Minor',
      startTime: minor1Start,
      endTime: minor1End,
      rating: Math.max(1, baseRating - 1),
      description: 'Moonrise Window: Increased predatory activity around rocky ledges and estuary mouth.',
    },
    {
      type: 'Minor',
      startTime: minor2Start,
      endTime: minor2End,
      rating: Math.max(1, baseRating - 1),
      description: 'Moonset Window: Short burst of surface bites and schooling activity.',
    },
  ];
}

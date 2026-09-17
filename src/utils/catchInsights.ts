import { CatchLogEntry } from '../types';

export interface CatchInsights {
  totalCatches: number;
  uniqueSpecies: number;
  uniqueLocations: number;
  measuredCatches: number;
  heaviestCatchKg?: number;
  longestCatchCm?: number;
  mostCaughtSpecies?: string;
  mostProductiveLocation?: string;
  legalStatusRecorded: number;
  legalCatches: number;
  flaggedCatches: number;
}

/**
 * Builds lightweight, offline-safe statistics from the local catch diary.
 * Missing measurements and missing legal-status fields are not treated as zero
 * or illegal; they are simply excluded from those specific metrics.
 */
export function getCatchInsights(entries: CatchLogEntry[]): CatchInsights {
  const speciesCounts = new Map<string, number>();
  const locationCounts = new Map<string, number>();

  let measuredCatches = 0;
  let heaviestCatchKg: number | undefined;
  let longestCatchCm: number | undefined;
  let legalStatusRecorded = 0;
  let legalCatches = 0;
  let flaggedCatches = 0;

  for (const entry of entries) {
    const species = entry.speciesName.trim() || 'Unknown Species';
    const location = entry.location.trim() || 'Unknown Spot';

    speciesCounts.set(species, (speciesCounts.get(species) ?? 0) + 1);
    locationCounts.set(location, (locationCounts.get(location) ?? 0) + 1);

    if (typeof entry.lengthCm === 'number' && Number.isFinite(entry.lengthCm)) {
      measuredCatches += 1;
      longestCatchCm = longestCatchCm === undefined
        ? entry.lengthCm
        : Math.max(longestCatchCm, entry.lengthCm);
    }

    if (typeof entry.weightKg === 'number' && Number.isFinite(entry.weightKg)) {
      heaviestCatchKg = heaviestCatchKg === undefined
        ? entry.weightKg
        : Math.max(heaviestCatchKg, entry.weightKg);
    }

    // Undefined means the record predates/omits a legal-status decision.
    if (typeof entry.isLegal === 'boolean') {
      legalStatusRecorded += 1;
      if (entry.isLegal) {
        legalCatches += 1;
      } else {
        flaggedCatches += 1;
      }
    }
  }

  const mostCommon = (counts: Map<string, number>): string | undefined => {
    let winner: string | undefined;
    let highest = 0;

    for (const [name, count] of counts) {
      if (count > highest) {
        winner = name;
        highest = count;
      }
    }

    return winner;
  };

  return {
    totalCatches: entries.length,
    uniqueSpecies: speciesCounts.size,
    uniqueLocations: locationCounts.size,
    measuredCatches,
    heaviestCatchKg,
    longestCatchCm,
    mostCaughtSpecies: mostCommon(speciesCounts),
    mostProductiveLocation: mostCommon(locationCounts),
    legalStatusRecorded,
    legalCatches,
    flaggedCatches,
  };
}

import { CatchLogEntry } from '../types';

export interface FishingPattern {
  species: string;
  catchCount: number;
  topTide?: string;
  topBait?: string;
  topSpot?: string;
  confidence: 'low' | 'building' | 'strong';
}

export interface FishingIntelligence {
  patterns: FishingPattern[];
  bestTide?: string;
  bestBait?: string;
  bestSpot?: string;
  measuredRate: number;
}

const mostCommon = (values: string[]): string | undefined => {
  const counts = new Map<string, number>();
  values.map((value) => value.trim()).filter(Boolean).forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  let winner: string | undefined;
  let highest = 0;
  counts.forEach((count, value) => {
    if (count > highest) {
      winner = value;
      highest = count;
    }
  });
  return winner;
};

const getConfidence = (catchCount: number): FishingPattern['confidence'] => {
  if (catchCount >= 5) return 'strong';
  if (catchCount >= 3) return 'building';
  return 'low';
};

export function getFishingIntelligence(entries: CatchLogEntry[]): FishingIntelligence {
  const bySpecies = new Map<string, CatchLogEntry[]>();
  entries.forEach((entry) => {
    const species = entry.speciesName.trim() || 'Unknown Species';
    const list = bySpecies.get(species) ?? [];
    list.push(entry);
    bySpecies.set(species, list);
  });

  const patterns = Array.from(bySpecies.entries())
    .map(([species, catches]) => ({
      species,
      catchCount: catches.length,
      topTide: mostCommon(catches.map((catchEntry) => catchEntry.tideState)),
      topBait: mostCommon(catches.map((catchEntry) => catchEntry.baitOrLure)),
      topSpot: mostCommon(catches.map((catchEntry) => catchEntry.location)),
      confidence: getConfidence(catches.length),
    }))
    .sort((a, b) => b.catchCount - a.catchCount);

  const measured = entries.filter((entry) => typeof entry.lengthCm === 'number' || typeof entry.weightKg === 'number').length;

  return {
    patterns,
    bestTide: mostCommon(entries.map((entry) => entry.tideState)),
    bestBait: mostCommon(entries.map((entry) => entry.baitOrLure)),
    bestSpot: mostCommon(entries.map((entry) => entry.location)),
    measuredRate: entries.length ? Math.round((measured / entries.length) * 100) : 0,
  };
}

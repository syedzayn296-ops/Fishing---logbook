export type CoastRegion = 'west_coast' | 'south_coast' | 'east_coast' | 'all';

export interface CoastalLocation {
  id: string;
  name: string;
  regionName: string;
  coast: 'west_coast' | 'south_coast' | 'east_coast';
  lat: number;
  lon: number;
  description: string;
  keySpecies: string[];
  tideOffsetMinutes: number; // Fallback-model phase offset; calibration status is documented separately
  tideStationName: string;
  meanSpringRange: number; // Fallback-model spring range estimate in metres; not an official tide-table value
  tideCalibrationStatus: 'unverified'; // Until port-specific harmonic/official calibration is independently checked
  tideReferenceSource?: 'SANHO HO-2' | 'No direct HO-2 port'; // Validation/reference source only; not the app's prediction feed
  tideReferencePort?: boolean; // True only for locations represented directly in SANHO HO-2
}

export interface TidePoint {
  time: Date;
  height: number; // in meters
  type?: 'high' | 'low';
}

export interface TideExtremum {
  time: Date;
  height: number;
  type: 'high' | 'low';
}

export interface MoonPhaseInfo {
  phaseName: string; // e.g. "Full Moon", "New Moon", "Waxing Crescent"
  illumination: number; // 0 to 100%
  isSpringTide: boolean;
  springOrNeap: 'Spring Tide' | 'Neap Tide' | 'Mid-Tide';
  icon: string;
  ageDays: number;
}

export interface SolunarPeriod {
  type: 'Major' | 'Minor';
  startTime: Date;
  endTime: Date;
  rating: number; // 1-5 stars
  description: string;
}

export interface MarineWeatherData {
  temperature: number;
  apparentTemperature: number;
  windSpeed: number; // in km/h
  windSpeedKnots: number;
  windDirection: number; // degrees
  windGusts: number;
  surfacePressure: number; // hPa
  weatherCode: number;
  waveHeight?: number; // meters
  wavePeriod?: number; // seconds
  waveDirection?: number; // degrees
  swellWaveHeight?: number; // meters
  swellWavePeriod?: number; // seconds
  swellWaveDirection?: number;
  sunrise?: string;
  sunset?: string;
  uvIndex?: number;
  biteRating: {
    score: number; // 1 to 10
    label: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Prime Time';
    summary: string;
  };
  cachedAt?: string; // ISO string when data was fetched or cached
  isOfflineSnapshot?: boolean; // true when serving cached/offline data
}

export type SassiStatus = 'Green' | 'Orange' | 'Red';

export interface FishSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  localNames: string[]; // Afrikaans, Zulu, colloquial names
  coast: CoastRegion[];
  habitat: ('Rock & Surf' | 'Estuary / Lagoon' | 'Deep Sea / Boat' | 'Reef & Kelp')[];
  minLegalSizeCm: number | null; // null means no minimum size
  maxBagLimit: number | null; // null means no bag limit or closed
  legalRulesVerified?: boolean; // Only true after the current DFFE rule has been independently audited
  legalSizeLabel?: string; // Optional area-specific legal-size wording
  bagLimitLabel?: string; // Optional area-specific bag-limit wording
  closedSeason?: string;
  sassiStatus: SassiStatus;
  sassiReason: string;
  description: string;
  identifyingFeatures: string[];
  bestBait: string[];
  recommendedTackle: string;
  bestTideConditions: string;
  edibility: 'Excellent' | 'Good' | 'Fair' | 'Catch & Release Recommended' | 'Protected / Prohibited';
  imageUrl?: string;
}

export interface CatchLogEntry {
  id: string;
  speciesName: string;
  lengthCm?: number;
  weightKg?: number;
  location: string;
  baitOrLure: string;
  tideState: string;
  timestamp: string;
  notes?: string;
  photoUrl?: string;
  isLegal?: boolean;
}

export interface FishIdentificationResult {
  speciesName: string;
  scientificName: string;
  localNames: string[];
  confidence: string;
  keyFeatures: string[];
  southAfricanRegulations: {
    minimumSizeCm: string;
    dailyBagLimit: string;
    closedSeason: string;
    sassiStatus: string;
    isLegalSizeForUser: string;
  };
  habitatAndRange: string;
  bestBaitsAndTactics: string[];
  handlingAndConservation: string;
  summary: string;
}

export type TideDataSource = 'live' | 'model';

export interface TideSourceInfo {
  source: TideDataSource;
  provider: string;
  fetchedAt?: string;
  station?: string;
  distanceKm?: number;
  datum?: string;
  units?: string;
}

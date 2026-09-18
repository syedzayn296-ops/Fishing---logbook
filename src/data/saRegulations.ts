export interface BaitLimit {
  name: string;
  scientificName: string;
  dailyBagLimit: string;
  minimumSize?: string;
  collectionMethod: string;
  notes: string;
}

export const SA_BAIT_LIMITS: BaitLimit[] = [
  {
    name: 'Mud Prawn',
    scientificName: 'Upogebia africana',
    dailyBagLimit: 'Verify current permit condition',
    collectionMethod: 'Hand pump (prawn pump) only; no digging or disturbance of seagrass beds.',
    notes: 'Superb bait for Spotted Grunter, Kob, Stumpnose, and Steenbras in estuaries.',
  },
  {
    name: 'Sand Prawn / Pink Prawn',
    scientificName: 'Callichirus kraussi',
    dailyBagLimit: '50 per permit per day',
    collectionMethod: 'Hand pump or manual wading pump.',
    notes: 'Irresistible to Grunter, Blacktail, and Bronze Bream.',
  },
  {
    name: 'Bloodworm',
    scientificName: 'Arenicola loveni',
    dailyBagLimit: 'Verify current permit condition',
    collectionMethod: 'Hand suction pump or wire. No spade/fork digging allowed.',
    notes: 'High conservation value; top bait for White Steenbras and trophy Kob in surf gutters.',
  },
  {
    name: 'White Mussel',
    scientificName: 'Donax serra',
    dailyBagLimit: '50 per permit per day',
    minimumSize: 'Must not pass through a 35mm gauge ring',
    collectionMethod: 'Harvested by foot shuffling / hand collecting in intertidal surf sand.',
    notes: 'Prime bait for Galjoen, White Musselcracker, and Kob.',
  },
  {
    name: 'Red Bait',
    scientificName: 'Pyura stolonifera',
    dailyBagLimit: 'Verify current permit condition',
    collectionMethod: 'Cut free with a knife from drift cast or exposed rocks at extreme low spring tide.',
    notes: 'The legendary bait for Galjoen, Roman, Poenskop, and Blacktail.',
  },
  {
    name: 'Alikreukel (Giant Turban Snail)',
    scientificName: 'Turbo sarmaticus',
    dailyBagLimit: '5 per permit per day',
    minimumSize: 'Must not pass through a 63.5mm circular gauge',
    collectionMethod: 'Hand collecting only; strictly no diving with artificial breathing apparatus (SCUBA).',
    notes: 'Favorite rock bait for Poenskop (Black Musselcracker) and Brusher.',
  },
  {
    name: 'Chokka / Squid',
    scientificName: 'Loligo reynaudii',
    dailyBagLimit: 'Verify current permit condition',
    collectionMethod: 'Handline or rod with squid jig; no spears or nets.',
    notes: 'Universal South African marine bait used for Kob, Geelbek, Yellowtail, and Reef fish.',
  },
  {
    name: 'Crabs (Rock Crab / Shore Crab)',
    scientificName: 'Plagusia chabrus / Cyclograpsus punctatus',
    dailyBagLimit: 'Verify current permit condition',
    collectionMethod: 'Hand collection or baited drop net.',
    notes: 'Crucial for Musselcracker, Poenskop, and Bronze Bream.',
  },
];

export const SA_GENERAL_REGULATIONS = {
  permitRequirements: [
    'Every recreational angler aged 12 and above must carry a valid recreational fishing permit issued by DFFE (Department of Forestry, Fisheries and the Environment) or SA Post Office.',
    'Permit categories include: Angling (rock & surf / deep sea), Mollusc & bait collecting, Spearfishing, and Cast-netting.',
    'Maximum of two rods or handlines per angler at any one time, with up to 10 hooks total on a single trace (or single trace rules).',
    'Recreational catches may NOT be bartered, sold, or offered for sale under any circumstances (heavy fines and gear confiscation apply).',
  ],
  measuringRules: [
    'Fish must be measured in a straight line from the tip of the snout to the end of the tail (Total Length), or to the fork of the tail for species specified with Fork Length (e.g., Tuna/Billfish).',
    'Never stretch, curve, or distort the tape measure over the rounded body of the fish.',
    'Any undersized fish caught must be returned to the water immediately with minimal handling and wet hands.',
  ],
  conservationGuidelines: [
    'Practice Catch-and-Release for vulnerable endemic species such as White Steenbras, Poenskop, and mature Dusky Kob.',
    'Use barbless or circle hooks to reduce deep hooking mortality.',
    'Do not keep fish alive on strings or in warm tide pools if you plan to release them.',
    'Respect Marine Protected Areas (MPAs) such as Tsitsikamma, Table Mountain, Langebaan Zone B/C, Pondoland, and Aliwal Shoal sanctuary zones.',
  ],
};


export const SA_REGULATORY_SOURCES = [
  { title: 'DFFE / MLRA Regulations — Recreational Fishing (Annexure 7)', url: 'https://www.dffe.gov.za/sites/default/files/legislations/mlra_regulations_gnr1111.pdf', note: 'Primary legal reference for recreational fishing species, size limits, bag limits and closed seasons.' },
  { title: 'DFFE — Shad / Elf closed-season clarification (12 Sep 2025)', url: 'https://www.dffe.gov.za/mediarelease/george_shadclosedseason', note: 'DFFE confirms the closed season is 1 October to 30 November each year.' },
  { title: 'DFFE — Recreational fishing e-permit platform', url: 'https://www.fishing.dffe.gov.za/', note: 'Official permit platform; check the current permit conditions before fishing or retaining a catch.' }
];

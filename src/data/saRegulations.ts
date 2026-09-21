export interface BaitLimit {
  name: string;
  scientificName: string;
  limit: string;
  minimumSize?: string;
  collectionMethod: string;
  notes: string;
}

export const SA_BAIT_LIMITS: BaitLimit[] = [
  {
    name: 'Mud Prawn',
    scientificName: 'Upogebia africana',
    limit: '50',
    collectionMethod: 'Hand or hand-operated pumping device; follow the current permit and collection-method restrictions.',
    notes: 'Superb bait for Spotted Grunter, Kob, Stumpnose, and Steenbras in estuaries.',
  },
  {
    name: 'Sand Prawn / Pink Prawn',
    scientificName: 'Callichirus kraussi',
    limit: '50',
    collectionMethod: 'Hand or hand-operated pumping device; follow the current permit and collection-method restrictions.',
    notes: 'Irresistible to Grunter, Blacktail, and Bronze Bream.',
  },
  {
    name: 'Bloodworm',
    scientificName: 'Arenicola loveni',
    limit: '5',
    collectionMethod: 'By hand or permitted collection method; collection restrictions apply in some areas.',
    notes: 'High conservation value; top bait for White Steenbras and trophy Kob in surf gutters.',
  },
  {
    name: 'White Mussel',
    scientificName: 'Donax serra',
    limit: '50',
    minimumSize: 'Must not pass through a 35 mm gauge ring',
    collectionMethod: 'Hand collecting in the intertidal zone; follow the current permit and area-specific collection rules.',
    notes: 'Prime bait for Galjoen, White Musselcracker, and Kob.',
  },
  {
    name: 'Red Bait',
    scientificName: 'Pyura stolonifera',
    limit: '2 kg (without tunic)',
    collectionMethod: 'Cut from rocks with a knife as permitted; leave the base covering in situ and follow current permit conditions.',
    notes: 'The legendary bait for Galjoen, Roman, Poenskop, and Blacktail.',
  },
  {
    name: 'Alikreukel (Giant Turban Snail)',
    scientificName: 'Turbo sarmaticus',
    limit: '5',
    minimumSize: 'Must not pass through a 63.5mm circular gauge',
    collectionMethod: 'Hand collecting only; strictly no diving with artificial breathing apparatus (SCUBA).',
    notes: 'Favorite rock bait for Poenskop (Black Musselcracker) and Brusher.',
  },
  {
    name: 'Chokka / Squid',
    scientificName: 'Loligo reynaudii',
    limit: '20',
    collectionMethod: 'Rod and/or line; follow the current permit conditions.',
    notes: 'Universal South African marine bait used for Kob, Geelbek, Yellowtail, and Reef fish.',
  },
  {
    name: 'Crabs (Rock Crab / Shore Crab)',
    scientificName: 'Plagusia chabrus / Cyclograpsus punctatus',
    limit: '15',
    collectionMethod: 'Collection method depends on crab type; mud crab has separate rules and size restrictions.',
    notes: 'Crucial for Musselcracker, Poenskop, and Bronze Bream.',
  },
];

export const SA_GENERAL_REGULATIONS = {
  permitRequirements: [
    'A recreational fishing permit is required to engage in recreational fishing; permits are obtained through an authorised issuing channel and are subject to the prescribed fee.',
    'The permit type and endorsement must match the activity being undertaken, such as angling, spearfishing or cast-netting.',
    'A recreational permit holder may not sell fish caught under the authority of a recreational fishing permit.',
    'Before keeping a catch, check the current MLRA species list, size limits, closed seasons, bag limits and permit conditions for the area and activity.'
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
  { title: 'DFFE — 2026 Fishing Permit Conditions', url: 'https://www.dffe.gov.za/sites/default/files/docs/licensesandpermits/conditions2026sectionBgeneral.pdf', note: 'Current 2026 permit-condition reference. Check the conditions that apply to your permit before fishing.' }
];

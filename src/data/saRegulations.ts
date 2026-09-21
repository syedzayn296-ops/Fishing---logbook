export interface BaitLimit {
  name: string;
  scientificName: string;
  limit: string;
  minimumSize?: string;
  collectionMethod: string;
  notes: string;
  verified: boolean;
  verificationNote: string;
}

export const SA_BAIT_LIMITS: BaitLimit[] = [
  {
    name: 'Mud Prawn',
    scientificName: 'Upogebia africana',
    limit: '50',
    collectionMethod: 'Hand or hand-operated pumping device; follow the current permit and collection-method restrictions.',
    notes: 'Bait commonly used for estuarine and surf species.',
    verified: true,
    verificationNote: 'Verified against MLRA Regulations, Annexure 13 (Regulation 55).',
  },
  {
    name: 'Sand Prawn / Pink Prawn',
    scientificName: 'Callichirus kraussi',
    limit: '50',
    collectionMethod: 'Hand or hand-operated pumping device; follow the current permit and collection-method restrictions.',
    notes: 'Common bait for grunter and other inshore species.',
    verified: true,
    verificationNote: 'Verified against MLRA Regulations, Annexure 13 (Regulation 55).',
  },
  {
    name: 'Bloodworm',
    scientificName: 'Arenicola loveni',
    limit: '5',
    collectionMethod: 'By hand; additional area restrictions apply. Do not collect north of the Mtamvuna River.',
    notes: 'Check the current regulations and permit conditions before collecting.',
    verified: true,
    verificationNote: 'Bag limit verified against Annexure 13; collection method and area restriction verified against Regulation 56.',
  },
  {
    name: 'White Mussel',
    scientificName: 'Donax serra',
    limit: '50',
    minimumSize: 'Must not pass through a 35 mm gauge ring',
    collectionMethod: 'Hand, hand-operated pumping device, or permitted implement within the legal method restrictions.',
    notes: 'Check the current area and permit conditions before collecting.',
    verified: true,
    verificationNote: 'Bag limit verified against Annexure 13; 35 mm size restriction verified against Regulation 56.',
  },
  {
    name: 'Red Bait',
    scientificName: 'Pyura stolonifera',
    limit: '2 kg (without tunic)',
    collectionMethod: 'Collection method is restricted; follow the current regulation and permit conditions.',
    notes: 'Do not treat this entry as permission to collect outside the permitted method or area.',
    verified: true,
    verificationNote: 'Bag limit verified against MLRA Regulations, Annexure 13 (Regulation 55).',
  },
  {
    name: 'Alikreukel (Giant Periwinkle)',
    scientificName: 'Turbo sarmaticus',
    limit: '5',
    minimumSize: 'Must not pass through a 63.5 mm circular gauge',
    collectionMethod: 'Hand collection only; additional collection restrictions apply.',
    notes: 'Check the current permit and local restrictions before collecting.',
    verified: true,
    verificationNote: 'Bag limit verified against Annexure 13; 63.5 mm size restriction verified against Regulation 56.',
  },
  {
    name: 'Crab',
    scientificName: 'Various species',
    limit: '15',
    collectionMethod: 'Collection method depends on species. Mud crab has separate restrictions and a separate bag/size limit.',
    notes: 'Important: mud crab is not covered by the generic 15-crab figure; verify the mud-crab rules before collecting.',
    verified: true,
    verificationNote: 'Generic crab bag limit verified against Annexure 13. Mud crab is separately regulated at 6 with a 140 mm minimum carapace width.',
  },
  {
    name: 'Chokka / Squid',
    scientificName: 'Loligo vulgaris reynaudii',
    limit: 'VERIFY WITH DFFE',
    collectionMethod: 'Do not rely on a hard recreational bait limit in this app until the applicable current rule is confirmed.',
    notes: 'We have deliberately removed the previous hard-coded number because it was not verified against Annexure 13 as a recreational invertebrate bait limit.',
    verified: false,
    verificationNote: 'Official verification required before displaying a legal number.',
  },
];

export const SA_GENERAL_REGULATIONS = {
  permitRequirements: [
    'A recreational fishing permit is required to engage in recreational fishing; permits are obtained from an authorised issuing channel and are subject to the prescribed fee.',
    'The permit type and endorsement must match the activity being undertaken, such as angling, spearfishing or cast-netting.',
    'A recreational permit holder may not sell fish caught under the authority of a recreational fishing permit.',
    'Before keeping a catch, check the current MLRA species list, size limits, closed seasons, bag limits and permit conditions for the area and activity.'
  ],
  measuringRules: [
    'Fish must be measured in a straight line from the tip of the snout to the extreme end of the tail.',
    'Never stretch, curve, or distort the tape measure over the rounded body of the fish.',
    'Any undersized fish caught must be returned to the water immediately with minimal handling and wet hands.',
  ],
  conservationGuidelines: [
    'Practice Catch-and-Release for vulnerable species and follow any species-specific release requirements.',
    'Use appropriate hooks and handling practices to reduce deep-hooking and release mortality.',
    'Do not keep fish alive on strings or in warm tide pools if you plan to release them.',
    'Respect Marine Protected Areas (MPAs) and sanctuary zones; check the rules for the exact area before fishing.',
  ],
};

export const SA_REGULATORY_SOURCES = [
  { title: 'DFFE / MLRA Regulations — Recreational Fishing (Annexure 7)', url: 'https://www.dffe.gov.za/sites/default/files/legislations/mlra_regulations_gnr1111.pdf', note: 'Primary legal reference for recreational fishing species, size limits, bag limits and closed seasons.' },
  { title: 'DFFE — MLRA Regulations: Annexure 13', url: 'https://www.dffe.gov.za/sites/default/files/legislations/mlra_regulations_gnr1111.pdf', note: 'Official source for recreational/subsistence invertebrate possession limits and related collection restrictions.' },
  { title: 'DFFE — Shad / Elf closed-season clarification (12 Sep 2025)', url: 'https://www.dffe.gov.za/mediarelease/george_shadclosedseason', note: 'DFFE confirms the closed season is 1 October to 30 November each year.' },
  { title: 'DFFE — Recreational fishing e-permit platform', url: 'https://www.fishing.dffe.gov.za/', note: 'Official permit platform; check the current permit conditions before fishing or retaining a catch.' },
  { title: 'DFFE — 2026 Fishing Permit Conditions', url: 'https://www.dffe.gov.za/sites/default/files/docs/licensesandpermits/conditions2026sectionBgeneral.pdf', note: 'Current 2026 permit-condition reference. Check the conditions that apply to your permit before fishing.' }
];

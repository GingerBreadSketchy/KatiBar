export const CHAPTER_META = {
  1: {
    color: 'green',
    shortTitle: 'Sovereignty & Supremacy',
    swTitle: 'Mamlaka na Ukuu wa Katiba',
    description: 'Who holds power in Kenya',
    swDescription: 'Nani anashikilia mamlaka Kenya',
  },
  2: {
    color: 'gold',
    shortTitle: 'The Republic',
    swTitle: 'Jamhuri',
    description: 'What defines Kenya as a state',
    swDescription: 'Kinachofafanua Kenya kama taifa',
  },
  3: {
    color: 'red',
    shortTitle: 'Citizenship',
    swTitle: 'Uraia',
    description: 'Who is Kenyan and what that means',
    swDescription: 'Nani ni Mkenya na maana yake',
  },
  4: {
    color: 'purple',
    shortTitle: 'The Bill of Rights',
    swTitle: 'Muswada wa Haki',
    description: 'The rights and freedoms that protect you',
    swDescription: 'Haki na uhuru unaokulinda',
  },
  5: {
    color: 'teal',
    shortTitle: 'Land & Environment',
    swTitle: 'Ardhi na Mazingira',
    description: 'How land, housing, and nature are protected',
    swDescription: 'Jinsi ardhi, makazi na mazingira hulindwa',
  },
  6: {
    color: 'black',
    shortTitle: 'Leadership & Integrity',
    swTitle: 'Uongozi na Uadilifu',
    description: 'Standards for honest public leadership',
    swDescription: 'Viwango vya uongozi wa umma ulio safi',
  },
  7: {
    color: 'orange',
    shortTitle: 'Representation of the People',
    swTitle: 'Uwakilishi wa Wananchi',
    description: 'How citizens choose and replace leaders',
    swDescription: 'Jinsi wananchi huchagua na kubadilisha viongozi',
  },
  8: {
    color: 'blue',
    shortTitle: 'The Legislature',
    swTitle: 'Bunge',
    description: 'How laws are made',
    swDescription: 'Jinsi sheria hutungwa',
  },
  9: {
    color: 'red',
    shortTitle: 'The Executive',
    swTitle: 'Utendaji wa Serikali',
    description: 'How national executive power works',
    swDescription: 'Jinsi mamlaka ya utendaji hufanya kazi',
  },
  10: {
    color: 'purple',
    shortTitle: 'Judiciary',
    swTitle: 'Mahakama',
    description: 'How courts and justice work',
    swDescription: 'Jinsi mahakama na haki hufanya kazi',
  },
  11: {
    color: 'green',
    shortTitle: 'Devolved Government',
    swTitle: 'Serikali ya Ugatuzi',
    description: 'How county and national government share power',
    swDescription: 'Jinsi kaunti na serikali kuu hushirikiana mamlaka',
  },
  12: {
    color: 'gold',
    shortTitle: 'Public Finance',
    swTitle: 'Fedha za Umma',
    description: 'How public money should be raised and used',
    swDescription: 'Jinsi pesa za umma zinapaswa kukusanywa na kutumiwa',
  },
  13: {
    color: 'black',
    shortTitle: 'The Public Service',
    swTitle: 'Utumishi wa Umma',
    description: 'Rules for public officers and service delivery',
    swDescription: 'Sheria za watumishi wa umma na utoaji huduma',
  },
  14: {
    color: 'blue',
    shortTitle: 'National Security',
    swTitle: 'Usalama wa Taifa',
    description: 'How the country is kept secure',
    swDescription: 'Jinsi nchi inalindwa',
  },
  15: {
    color: 'teal',
    shortTitle: 'Commissions & Independent Offices',
    swTitle: 'Tume na Ofisi Huru',
    description: 'Independent watchdogs and oversight bodies',
    swDescription: 'Taasisi huru za uangalizi na usimamizi',
  },
  16: {
    color: 'purple',
    shortTitle: 'Amendment of the Constitution',
    swTitle: 'Mabadiliko ya Katiba',
    description: 'How the Constitution can be changed',
    swDescription: 'Jinsi Katiba inaweza kubadilishwa',
  },
  17: {
    color: 'black',
    shortTitle: 'General Provisions',
    swTitle: 'Masharti ya Jumla',
    description: 'Definitions and general rules',
    swDescription: 'Maana za maneno na masharti ya jumla',
  },
  18: {
    color: 'black',
    shortTitle: 'Transition & Consequential Provisions',
    swTitle: 'Masharti ya Mpito na Matokeo',
    description: 'How the 2010 Constitution took effect',
    swDescription: 'Jinsi Katiba ya 2010 ilianza kutumika',
  },
}

export function stripLeadingHash(tag) {
  return String(tag || '').replace(/^#+/, '').trim()
}

export function articleCountLabel(count) {
  return `${count} Article${count === 1 ? '' : 's'}`
}

export function swArticleCountLabel(count) {
  return `${count} Ibara`
}

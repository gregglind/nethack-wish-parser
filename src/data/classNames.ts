import type { ObjClass } from '../parser/types';

/** Curated subset of wrp[]/wrpsym[] (objnam.c:2546-2555). */
export const CLASS_NAME_WORDS: { word: string; oclass: ObjClass }[] = [
  { word: 'wand', oclass: 'wand' },
  { word: 'ring', oclass: 'ring' },
  { word: 'potion', oclass: 'potion' },
  { word: 'scroll', oclass: 'scroll' },
  { word: 'gem', oclass: 'gem' },
  { word: 'stone', oclass: 'gem' },
  { word: 'amulet', oclass: 'amulet' },
  { word: 'spellbook', oclass: 'spellbook' },
  { word: 'spell book', oclass: 'spellbook' },
  { word: 'weapon', oclass: 'weapon' },
  { word: 'armor', oclass: 'armor' },
  { word: 'tool', oclass: 'tool' },
  { word: 'food', oclass: 'food' },
  { word: 'comestible', oclass: 'food' },
];

/** False-positive guards -- these substrings must NOT trigger a class-name match. */
export const CLASS_NAME_EXCLUSIONS = [
  'enchant ',
  'destroy ',
  'detect food',
  'food detection',
  'ring mail',
  'studded leather armor',
  'leather armor',
  'tooled horn',
  'food ration',
  'meat ring',
];

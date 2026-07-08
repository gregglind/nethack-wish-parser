import type { ArtifactDef } from '../parser/types';

/** Curated subset of artilist.h (~46 real artifacts). */
export const ARTIFACTS: ArtifactDef[] = [
  { name: 'Eye of the Aethiopica', baseOtyp: 'AMULET_OF_ESP', alignment: 'neutral', isQuestArtifact: true },
  { name: 'Platinum Yendorian Express Card', baseOtyp: 'CREDIT_CARD', alignment: 'neutral', isQuestArtifact: true },
  { name: 'Eyes of the Overworld', baseOtyp: 'LENSES', alignment: 'neutral', isQuestArtifact: true },
  { name: 'Orb of Fate', baseOtyp: 'CRYSTAL_BALL', alignment: 'neutral', isQuestArtifact: true },
  { name: 'Sceptre of Might', baseOtyp: 'FLAIL', alignment: 'lawful', isQuestArtifact: true },
  { name: 'Orb of Detection', baseOtyp: 'CRYSTAL_BALL', alignment: 'lawful', isQuestArtifact: true },
  { name: 'Magic Mirror of Merlin', baseOtyp: 'CRYSTAL_BALL', alignment: 'lawful', isQuestArtifact: true },
  { name: 'Mitre of Holiness', baseOtyp: 'HELM_OF_BRILLIANCE', alignment: 'lawful', isQuestArtifact: true },
  { name: 'Master Key of Thievery', baseOtyp: 'SKELETON_KEY', alignment: 'chaotic', isQuestArtifact: true },
  { name: 'Longbow of Diana', baseOtyp: 'LONG_SWORD', alignment: 'chaotic', isQuestArtifact: true },
  { name: 'Excalibur', baseOtyp: 'LONG_SWORD', alignment: 'lawful', isQuestArtifact: false },
  { name: 'Stormbringer', baseOtyp: 'BROADSWORD', alignment: 'chaotic', isQuestArtifact: false },
  { name: 'Mjollnir', baseOtyp: 'FLAIL', alignment: 'neutral', isQuestArtifact: false },
  { name: 'Sunsword', baseOtyp: 'LONG_SWORD', alignment: 'lawful', isQuestArtifact: false },
  { name: 'Magicbane', baseOtyp: 'ATHAME', alignment: 'neutral', isQuestArtifact: false },
  { name: 'Grimtooth', baseOtyp: 'KNIFE', alignment: 'chaotic', isQuestArtifact: false },
  { name: 'Frost Brand', baseOtyp: 'LONG_SWORD', alignment: 'unaligned', isQuestArtifact: false },
  { name: 'Fire Brand', baseOtyp: 'LONG_SWORD', alignment: 'unaligned', isQuestArtifact: false },
  { name: 'Vorpal Blade', baseOtyp: 'LONG_SWORD', alignment: 'unaligned', isQuestArtifact: false },
  { name: 'Snickersnee', baseOtyp: 'SHORT_SWORD', alignment: 'unaligned', isQuestArtifact: false },
];

export const ARTIFACTS_BY_NAME: Map<string, ArtifactDef> = new Map(
  ARTIFACTS.map((a) => [a.name.toLowerCase(), a])
);

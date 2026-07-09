import type { ArtifactDef } from '../parser/types';

/**
 * Full artifact roster extracted from include/artilist.h at the pinned
 * NetHack 5.0.0 release commit. This build has exactly 33 real artifacts
 * (20 ordinary + 13 quest artifacts, one per role) -- there is no ~46-entry
 * list in this source tree, so this replaces the earlier "~20 curated"
 * placeholder with the complete set rather than a larger curated subset.
 */
export const ARTIFACTS: ArtifactDef[] = [
  // ---- Ordinary artifacts (20) ----
  { name: 'Excalibur', baseOtyp: 'LONG_SWORD', alignment: 'lawful', isQuestArtifact: false },
  { name: 'Stormbringer', baseOtyp: 'RUNESWORD', alignment: 'chaotic', isQuestArtifact: false },
  { name: 'Mjollnir', baseOtyp: 'WAR_HAMMER', alignment: 'neutral', isQuestArtifact: false },
  { name: 'Cleaver', baseOtyp: 'BATTLE_AXE', alignment: 'neutral', isQuestArtifact: false },
  { name: 'Grimtooth', baseOtyp: 'ORCISH_DAGGER', alignment: 'chaotic', isQuestArtifact: false },
  { name: 'Orcrist', baseOtyp: 'ELVEN_BROADSWORD', alignment: 'chaotic', isQuestArtifact: false },
  { name: 'Sting', baseOtyp: 'ELVEN_DAGGER', alignment: 'chaotic', isQuestArtifact: false },
  { name: 'Magicbane', baseOtyp: 'ATHAME', alignment: 'neutral', isQuestArtifact: false },
  { name: 'Frost Brand', baseOtyp: 'LONG_SWORD', alignment: 'unaligned', isQuestArtifact: false },
  { name: 'Fire Brand', baseOtyp: 'LONG_SWORD', alignment: 'unaligned', isQuestArtifact: false },
  { name: 'Dragonbane', baseOtyp: 'BROADSWORD', alignment: 'unaligned', isQuestArtifact: false },
  { name: 'Demonbane', baseOtyp: 'SILVER_MACE', alignment: 'lawful', isQuestArtifact: false },
  { name: 'Werebane', baseOtyp: 'SILVER_SABER', alignment: 'unaligned', isQuestArtifact: false },
  { name: 'Grayswandir', baseOtyp: 'SILVER_SABER', alignment: 'lawful', isQuestArtifact: false },
  { name: 'Giantslayer', baseOtyp: 'LONG_SWORD', alignment: 'neutral', isQuestArtifact: false },
  { name: 'Ogresmasher', baseOtyp: 'WAR_HAMMER', alignment: 'unaligned', isQuestArtifact: false },
  { name: 'Trollsbane', baseOtyp: 'MORNING_STAR', alignment: 'unaligned', isQuestArtifact: false },
  { name: 'Vorpal Blade', baseOtyp: 'LONG_SWORD', alignment: 'neutral', isQuestArtifact: false },
  { name: 'Snickersnee', baseOtyp: 'KATANA', alignment: 'lawful', isQuestArtifact: false },
  { name: 'Sunsword', baseOtyp: 'LONG_SWORD', alignment: 'lawful', isQuestArtifact: false },

  // ---- Quest artifacts (13, one per role) ----
  { name: 'Orb of Detection', baseOtyp: 'CRYSTAL_BALL', alignment: 'lawful', isQuestArtifact: true, role: 'Archeologist' },
  { name: 'Heart of Ahriman', baseOtyp: 'LUCKSTONE', alignment: 'neutral', isQuestArtifact: true, role: 'Barbarian' },
  { name: 'Sceptre of Might', baseOtyp: 'MACE', alignment: 'lawful', isQuestArtifact: true, role: 'Caveman' },
  { name: 'Staff of Aesculapius', baseOtyp: 'QUARTERSTAFF', alignment: 'neutral', isQuestArtifact: true, role: 'Healer' },
  { name: 'Magic Mirror of Merlin', baseOtyp: 'MIRROR', alignment: 'lawful', isQuestArtifact: true, role: 'Knight' },
  { name: 'Eyes of the Overworld', baseOtyp: 'LENSES', alignment: 'neutral', isQuestArtifact: true, role: 'Monk' },
  { name: 'Mitre of Holiness', baseOtyp: 'HELM_OF_BRILLIANCE', alignment: 'lawful', isQuestArtifact: true, role: 'Priest' },
  { name: 'Longbow of Diana', baseOtyp: 'BOW', alignment: 'chaotic', isQuestArtifact: true, role: 'Ranger' },
  { name: 'Master Key of Thievery', baseOtyp: 'SKELETON_KEY', alignment: 'chaotic', isQuestArtifact: true, role: 'Rogue' },
  { name: 'Tsurugi of Muramasa', baseOtyp: 'TSURUGI', alignment: 'lawful', isQuestArtifact: true, role: 'Samurai' },
  { name: 'Platinum Yendorian Express Card', baseOtyp: 'CREDIT_CARD', alignment: 'neutral', isQuestArtifact: true, role: 'Tourist' },
  { name: 'Orb of Fate', baseOtyp: 'CRYSTAL_BALL', alignment: 'neutral', isQuestArtifact: true, role: 'Valkyrie' },
  { name: 'Eye of the Aethiopica', baseOtyp: 'AMULET_OF_ESP', alignment: 'neutral', isQuestArtifact: true, role: 'Wizard' },
];

export const ARTIFACTS_BY_NAME: Map<string, ArtifactDef> = new Map(
  ARTIFACTS.map((a) => [a.name.toLowerCase(), a])
);

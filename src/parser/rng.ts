/**
 * A small seeded PRNG standing in for illustrating probabilities. This is
 * NOT a reimplementation of NetHack's own RNG (rn2/rnd use a different
 * generator seeded per-game) -- it exists only so "Roll it" is reproducible
 * for a given seed within this tool.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  private next: () => number;

  constructor(seed: number) {
    this.next = mulberry32(seed);
  }

  /** NetHack rn2(x): uniform random integer in [0, x). */
  rn2(x: number): number {
    if (x <= 0) return 0;
    return Math.floor(this.next() * x);
  }

  /** NetHack rnd(x): uniform random integer in [1, x]. */
  rnd(x: number): number {
    return this.rn2(x) + 1;
  }

  /** NetHack d(n, x): sum of n rnd(x) rolls. */
  d(n: number, x: number): number {
    let total = 0;
    for (let i = 0; i < n; i++) total += this.rnd(x);
    return total;
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }

  pick<T>(items: T[]): T {
    return items[this.rn2(items.length)];
  }

  weightedPick<T>(items: T[], weight: (item: T) => number): T {
    const total = items.reduce((sum, item) => sum + Math.max(weight(item), 0), 0);
    if (total <= 0) return this.pick(items);
    let roll = this.next() * total;
    for (const item of items) {
      roll -= Math.max(weight(item), 0);
      if (roll < 0) return item;
    }
    return items[items.length - 1];
  }
}

export function newSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

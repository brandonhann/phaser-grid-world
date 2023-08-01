declare module 'simplex-noise' {
    export function createNoise2D(): (x: number, y: number) => number;
    export function createNoise2D(seed: string): (x: number, y: number) => number;
    export function createNoise3D(seed: string): (x: number, y: number, z: number) => number;
    export function createNoise4D(seed: string): (x: number, y: number, z: number, w: number) => number;
}

declare module 'seedrandom' {
    const seedrandom: (seed?: string) => () => number;
    export = seedrandom;
}
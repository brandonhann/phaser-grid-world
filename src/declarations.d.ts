declare module 'perlin-noise' {
    export function generatePerlinNoise(width: number, height: number, options: PerlinOptions): number[];
    export function generateWhiteNoise(width: number, height: number, options?: WhiteNoiseOptions): number[];

    interface PerlinOptions {
        octaveCount: number;
        amplitude: number;
        persistence: number;
        random: () => number;
        seed: number;
    }

    interface WhiteNoiseOptions {
        random?: () => number;
    }
}

declare module 'seedrandom' {
    const seedrandom: (seed?: string) => () => number;
    export = seedrandom;
}
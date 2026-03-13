declare module "gradient-seed-generator" {
  interface GradientShapesOptions {
    blur: number;
    alpha: number;
    minCount: number;
    maxCount: number;
    baseRadiusMin: number;
    baseRadiusMax: number;
    radiusVariance: number;
  }

  interface GradientOptions {
    size?: number;
    shapes?: boolean | GradientShapesOptions;
    theme?: "pastel" | "vibrant" | "monochrome" | "duotone";
    gradientType?: "linear" | "radial" | "conic";
    colorCount?: number;
    noise?: boolean;
  }

  export function gradient(seed: string, options?: GradientOptions): string;
}

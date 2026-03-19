import React, { useEffect, useState } from "react";

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

interface GradientImageProps {
  src?: string;
  seed?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  options?: Partial<GradientOptions>;
}

export const GradientImage: React.FC<GradientImageProps> = ({
  src,
  seed,
  alt = "",
  width = 800,
  height = 450,
  className = "",
  options = {},
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src || "");

  useEffect(() => {
    if (src) {
      return;
    }

    const generateGradient = async () => {
      const gradientModule = await import("gradient-seed-generator").catch(() => null);

      const result = gradientModule
        ? (() => {
            const { gradient } = gradientModule;
            const defaultOptions: GradientOptions = {
              size: Math.max(width, height),
              shapes: {
                blur: 40,
                alpha: 0.25,
                minCount: 4,
                maxCount: 6,
                baseRadiusMin: 0.5,
                baseRadiusMax: 0.9,
                radiusVariance: 1.0,
              },
              theme: "pastel",
              gradientType: "radial",
              ...options,
            };
            return gradient(seed || "", defaultOptions);
          })()
        : (() => {
            const hash = (seed || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const hue1 = hash % 360;
            const hue2 = (hash + 60) % 360;

            // SVG グラデーションを生成
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${String(width)}" height="${String(height)}" viewBox="0 0 ${String(width)} ${String(height)}">
              <defs>
                <radialGradient id="grad">
                  <stop offset="0%" stop-color="hsl(${String(hue1)}, 70%, 80%)" />
                  <stop offset="100%" stop-color="hsl(${String(hue2)}, 70%, 60%)" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grad)" />
            </svg>`;
            return `data:image/svg+xml,${encodeURIComponent(svg)}`;
          })();

      setImageSrc(result);
    };

    void generateGradient();
  }, [seed, width, height, options]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
};

export default GradientImage;

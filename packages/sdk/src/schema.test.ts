import { describe, it, expect } from "vitest";
import { define, getSchemaById } from "./schema";

type RawWeather = { weather: string; temperature: number; city: string };
type NormWeather = { weather_bucket: string; temperature_bucket: string };

describe("define / getSchemaById", () => {
  it("registers and retrieves a schema with normalize", () => {
    const schema = define<RawWeather, NormWeather>({
      id: "test:weather-v1",
      normalize: (raw) => ({
        weather_bucket: raw.weather === "rain" ? "wet" : "dry",
        temperature_bucket: raw.temperature < 10 ? "cold" : "mild",
      }),
    });

    expect(schema.id).toBe("test:weather-v1");

    const retrieved = getSchemaById<RawWeather, NormWeather>("test:weather-v1");
    expect(retrieved).toBeDefined();
    expect(retrieved!.normalize({ weather: "rain", temperature: 5, city: "Tokyo" }))
      .toEqual({ weather_bucket: "wet", temperature_bucket: "cold" });
  });

  it("returns undefined for unknown schemaId", () => {
    expect(getSchemaById("nonexistent")).toBeUndefined();
  });
});

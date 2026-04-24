import { create } from "@lemmaoracle/sdk/client";

export const buildClient = (_void?: undefined) =>
  create({
    ...(process.env.LEMMA_API_BASE ? { apiBase: process.env.LEMMA_API_BASE } : {}),
    ...(process.env.LEMMA_API_KEY ? { apiKey: process.env.LEMMA_API_KEY } : {}),
    ...(process.env.LEMMA_DEFAULT_CHAIN_ID
      ? { defaultChainId: Number(process.env.LEMMA_DEFAULT_CHAIN_ID) }
      : {}),
  });

"use client";

import { useMemo } from "react";
import { useServices } from "@/container/ServicesProvider.tsx";
import type { AddressSearchLevel, AddressSearchParts } from "@/domain/Address.ts";
import { useDataVersion } from "./useDataVersion.ts";

// Підказки для рівня адреси на основі Trie; порожні, доки не заповнені попередні рівні
export function useAddressSuggestions(level: AddressSearchLevel, parts: AddressSearchParts): string[] {
  // Дані лежать у змінних репозиторіях: без цього React Compiler відкидає залежність від version
  "use no memo";

  const { listings } = useServices();
  const version = useDataVersion();
  const { country, city, street, building } = parts;

  return useMemo(() => {
    void version;

    return listings.suggestAddress(level, { country, city, street, building });
  }, [listings, level, country, city, street, building, version]);
}

"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth, db } from "@/lib/firebase.ts";
import { ServiceContainer } from "./ServiceContainer.ts";

const ServicesContext = createContext<ServiceContainer | null>(null);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [container] = useState(() => new ServiceContainer(db, auth));

  // Оголошення публічні, тому завантажуються одразу, ще до входу
  useEffect(() => {
    container.sync.startPublic();
  }, [container]);

  return <ServicesContext value={container}>{children}</ServicesContext>;
}

export function useServices(): ServiceContainer {
  const container = useContext(ServicesContext);
  if (!container) throw new Error("useServices має використовуватись усередині ServicesProvider");
  return container;
}

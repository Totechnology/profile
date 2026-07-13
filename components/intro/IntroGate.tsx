"use client";

import { useCallback, useEffect, useState } from "react";
import { IntroOverlay } from "@/components/intro/IntroOverlay";
import { cn } from "@/lib/utils";

const INTRO_STORAGE_KEY = "gcy-intro-seen";
let introPlayedInRuntime = false;

export function IntroGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "playing" | "done">("checking");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let introSeen = false;

    try {
      introSeen = window.localStorage.getItem(INTRO_STORAGE_KEY) === "true";
    } catch {
      introSeen = false;
    }

    setState(reduceMotion || introPlayedInRuntime || introSeen ? "done" : "playing");
  }, []);

  const handleDone = useCallback(() => {
    introPlayedInRuntime = true;

    try {
      window.localStorage.setItem(INTRO_STORAGE_KEY, "true");
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }

    setState("done");
  }, []);

  return (
    <>
      <div
        className={cn(
          "transition duration-1000",
          state === "playing" ? "pointer-events-none opacity-0 blur-sm" : "opacity-100"
        )}
      >
        {children}
      </div>
      {state === "playing" ? <IntroOverlay onDone={handleDone} /> : null}
    </>
  );
}

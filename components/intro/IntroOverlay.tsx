"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SpiralAnimation } from "@/components/intro/SpiralAnimation";
import { cn } from "@/lib/utils";

export function IntroOverlay({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setExiting(true);
    window.setTimeout(onDone, 760);
  }, [onDone]);

  useEffect(() => {
    const fallback = window.setTimeout(finish, 7000);
    return () => window.clearTimeout(fallback);
  }, [finish]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 overflow-hidden bg-black transition duration-700",
        exiting && "pointer-events-none opacity-0 blur-xl"
      )}
      role="presentation"
    >
      <SpiralAnimation onComplete={finish} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgb(0_0_0_/_0.18)_46%,rgb(0_0_0_/_0.74)_100%)]" />
      <div className="absolute left-5 top-5 md:left-8 md:top-8">
        <div className="mono rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-xs text-sky-100/80 backdrop-blur-md">
          INITIALIZING PERSONAL ARCHIVE
        </div>
      </div>
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 md:bottom-8 md:left-8 md:right-8">
        <div className="hidden max-w-sm text-sm leading-6 text-zinc-500 md:block">
          Entering a working space for visuals, sound, hardware and AI systems.
        </div>
        <button className="secondary-button focus-ring ml-auto" type="button" onClick={finish}>
          Skip Intro
        </button>
      </div>
    </div>
  );
}

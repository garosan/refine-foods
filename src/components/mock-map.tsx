"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapPoint } from "@/lib/maps";

const BOUNDS = { latMin: 40.5, latMax: 40.9, lngMin: -74.1, lngMax: -73.7 };

// Mocked map surface — see src/lib/maps.ts for why. Swap for a real
// Google Maps component later; keep the `points` prop shape the same.
export function MockMap({ points, className }: { points: MapPoint[]; className?: string }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-lg border bg-muted",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      {points.map((point) => {
        const x = ((point.lng - BOUNDS.lngMin) / (BOUNDS.lngMax - BOUNDS.lngMin)) * 100;
        const y = 100 - ((point.lat - BOUNDS.latMin) / (BOUNDS.latMax - BOUNDS.latMin)) * 100;
        return (
          <button
            key={point.id}
            type="button"
            className="absolute -translate-x-1/2 -translate-y-full outline-none"
            style={{ left: `${x}%`, top: `${y}%` }}
            onMouseEnter={() => setActive(point.id)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(point.id)}
            onBlur={() => setActive(null)}
          >
            <MapPin className="size-6 fill-primary text-primary-foreground drop-shadow" />
            {active === point.id && (
              <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md">
                {point.label}
              </span>
            )}
          </button>
        );
      })}
      <p className="absolute bottom-2 right-2 text-xs text-muted-foreground">
        Map preview (mocked — no Google Maps API key configured)
      </p>
    </div>
  );
}

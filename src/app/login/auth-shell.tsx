import { Logo } from "@/components/logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-neutral-950 p-4">
      {/* Original branded background — warm radial glows, not a photo asset */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 900px 600px at 15% 20%, oklch(0.35 0.09 41.5 / 0.55), transparent 60%),
            radial-gradient(ellipse 800px 700px at 85% 80%, oklch(0.3 0.08 41.5 / 0.5), transparent 60%),
            radial-gradient(ellipse 1200px 900px at 50% 50%, oklch(0.18 0.02 41.5), oklch(0.09 0 0))
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, white 0, white 1px, transparent 1px, transparent 14px)",
        }}
      />

      <Logo className="relative [&_span:last-child]:text-white" />

      {children}
    </div>
  );
}

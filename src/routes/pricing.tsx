import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PricingTiers } from "@/components/PricingTiers";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing & Credits — FrameFlow" },
      {
        name: "description",
        content: "Simple one-time credit packs for FrameFlow: Basic, Pro and Creator. Credits never expire.",
      },
      { property: "og:title", content: "Pricing & Credits — FrameFlow" },
      { property: "og:description", content: "Buy FrameFlow credits: Basic, Pro or Creator packs." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-8">
        <div className="mb-10 text-center">
          <Badge variant="secondary" className="mb-3 gap-1">
            <Sparkles className="size-3" /> Credits
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Pick your pack</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            One credit renders one storyboard frame. Pay once, use whenever inspiration hits.
          </p>
        </div>
        <PricingTiers />
      </div>
    </AppShell>
  );
}

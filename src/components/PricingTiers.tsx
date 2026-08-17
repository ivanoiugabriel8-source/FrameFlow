import { Check, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tiers = [
  {
    name: "Basic",
    price: "$9",
    credits: 50,
    features: ["50 image credits", "720p frame exports", "3 saved projects", "Email support"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    credits: 200,
    features: [
      "200 image credits",
      "1080p frame exports",
      "Unlimited projects",
      "Style presets library",
      "Priority rendering",
    ],
    highlighted: true,
  },
  {
    name: "Creator",
    price: "$79",
    credits: 700,
    features: [
      "700 image credits",
      "4K frame exports",
      "Team seats (up to 5)",
      "Character consistency lock",
      "Dedicated support",
    ],
    highlighted: false,
  },
];

export function PricingTiers() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {tiers.map((tier) => (
        <Card
          key={tier.name}
          className={cn(
            "relative flex flex-col rounded-2xl border-border/60 bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:border-accent-foreground/20 hover:shadow-lg",
            tier.highlighted && "border-primary/50 shadow-glow ring-1 ring-primary/30",
          )}
        >
          {tier.highlighted && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
          )}
          <CardHeader className="space-y-2 pb-2">
            <p className="text-sm font-medium text-muted-foreground">{tier.name}</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-semibold tracking-tight">{tier.price}</span>
              <span className="pb-1 text-sm text-muted-foreground">one-time</span>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Coins className="size-4" />
              {tier.credits} credits
            </p>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2.5 text-sm">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={tier.highlighted ? "default" : "outline"}
              onClick={() => toast.success(`${tier.name} selected`, { description: "Checkout coming soon." })}
            >
              Buy {tier.name}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

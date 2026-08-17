import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PricingTiers } from "@/components/PricingTiers";

export function PricingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl border-border/60 bg-card">
        <DialogHeader className="items-center text-center">
          <Badge variant="secondary" className="mx-auto mb-2 gap-1">
            <Sparkles className="size-3" /> Top up
          </Badge>
          <DialogTitle className="text-2xl tracking-tight">Buy credits</DialogTitle>
          <DialogDescription>
            One credit renders one storyboard frame. No subscription required.
          </DialogDescription>
        </DialogHeader>
        <PricingTiers />
        <p className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
          <Check className="size-3" /> Secure checkout · Credits never expire
        </p>
      </DialogContent>
    </Dialog>
  );
}

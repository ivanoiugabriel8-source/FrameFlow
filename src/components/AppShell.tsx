import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Clapperboard, Coins, LogOut, Menu, Plus, Sparkles, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { PricingDialog } from "@/components/PricingDialog";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const recentProjects = [
  { name: "Episode 1", frames: 12 },
  { name: "Funny Short", frames: 6 },
  { name: "Coffee Ad — v3", frames: 9 },
  { name: "Pilot Teaser", frames: 4 },
  { name: "Neon City Intro", frames: 18 },
];

function SidebarBody() {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Button
        className="w-full justify-start gap-2"
        onClick={() => toast.success("New project created", { description: "Untitled project" })}
      >
        <Plus /> New Project
      </Button>

      <div className="min-h-0 flex-1 space-y-1">
        <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Recent projects
        </p>
        {recentProjects.map((p) => (
          <button
            key={p.name}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Film className="size-4 shrink-0 opacity-70" />
            <span className="min-w-0 flex-1 truncate">{p.name}</span>
            <span className="shrink-0 text-xs opacity-60">{p.frames}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [pricingOpen, setPricingOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarBody />
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex min-w-0 items-center gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Clapperboard className="size-4" />
              </span>
              <span className="truncate text-lg font-bold tracking-tight">FrameFlow</span>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="secondary" className="hidden gap-1.5 px-3 py-1.5 sm:inline-flex">
              <Coins className="size-3.5" /> 10 Credits
            </Badge>
            <Button size="sm" className="gap-1.5" onClick={() => setPricingOpen(true)}>
              <Sparkles /> <span className="hidden sm:inline">Buy Credits</span>
            </Button>
            {user && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/auth" });
                }}
              >
                <LogOut />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-[61px] hidden h-[calc(100vh-61px)] w-72 shrink-0 border-r border-border/60 lg:block">
          <SidebarBody />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <PricingDialog open={pricingOpen} onOpenChange={setPricingOpen} />
    </div>
  );
}

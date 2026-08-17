import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Wand2, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AppShell } from "@/components/AppShell";
import { FrameCard, type Frame } from "@/components/FrameCard";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FrameFlow — Script to Storyboard Editor" },
      {
        name: "description",
        content:
          "Paste your script and generate a shot-by-shot animation storyboard with characters, dialogue and emotion.",
      },
      { property: "og:title", content: "FrameFlow — Script to Storyboard Editor" },
      {
        property: "og:description",
        content: "Turn raw scripts into cinematic storyboard frames in seconds.",
      },
    ],
  }),
  component: EditorPage,
});

const mockFrames: Frame[] = [
  {
    id: "1",
    character: "MAYA",
    dialogue: "We only get one shot at this.",
    action: "Maya leans over the console, city lights flickering across her visor.",
    emotion: "determined",
  },
  {
    id: "2",
    character: "RILEY",
    dialogue: "You said that last time. And the time before.",
    action: "Riley spins a wrench between his fingers, refusing to look up.",
    emotion: "sarcastic",
  },
  {
    id: "3",
    character: "NARRATOR",
    dialogue: "Below them, the tunnel began to hum.",
    action: "Wide shot pulling back through steam vents into the dark shaft.",
    emotion: "ominous",
  },
  {
    id: "4",
    character: "MAYA",
    dialogue: "Then let's make this one count.",
    action: "Close-up on Maya's hand slamming the ignition lever down.",
    emotion: "resolute",
  },
];

function EditorPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [script, setScript] = useState("");
  const [frames, setFrames] = useState<Frame[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  function generate() {
    if (!script.trim()) { toast.error("Paste a script first"); return; }
    setGenerating(true);
    setTimeout(() => {
      setFrames(mockFrames);
      setGenerating(false);
      toast.success("Storyboard generated", { description: `${mockFrames.length} frames ready.` });
    }, 900);
  }

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Storyboard editor</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste a raw script — FrameFlow breaks it into shots with character, dialogue and action.
          </p>
        </header>

        <Card className="rounded-2xl border-border/60 bg-card/60 p-4 shadow-sm sm:p-6">
          <Textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="INT. UNDERGROUND HANGAR — NIGHT&#10;&#10;MAYA&#10;We only get one shot at this..."
            className="min-h-56 resize-y rounded-xl border-border/60 bg-background/60 font-mono text-sm leading-relaxed focus-visible:ring-primary/40"
          />
          <Button size="lg" className="mt-4 w-full gap-2" disabled={generating} onClick={generate}>
            {generating ? <Loader2 className="animate-spin" /> : <Wand2 />}
            {generating ? "Generating…" : "Generate Storyboard"}
          </Button>
        </Card>

        <section className="mt-10">
          {frames.length > 0 ? (
            <>
              <h2 className="mb-4 text-lg font-semibold tracking-tight">
                Frames <span className="text-muted-foreground">({frames.length})</span>
              </h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {frames.map((frame, i) => (
                  <FrameCard
                    key={frame.id}
                    frame={frame}
                    index={i}
                    onDelete={(id) => setFrames((f) => f.filter((x) => x.id !== id))}
                    onGenerate={() => toast.info("Image generation coming soon")}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-border/70 py-20 text-center">
              <LayoutGrid className="size-7 text-muted-foreground/70" />
              <p className="text-sm font-medium">No frames yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Your generated storyboard frames will appear here in a responsive grid.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

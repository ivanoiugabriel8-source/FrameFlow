import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Wand2, LayoutGrid, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppShell } from "@/components/AppShell";
import { FrameCard, type Frame } from "@/components/FrameCard";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/integrations/supabase/tables";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FrameFlow — Script to Storyboard Editor" },
      {
        name: "description",
        content:
          "Paste your script and generate a shot-by-shot animation storyboard with characters, dialogue and action.",
      },
      { property: "og:title", content: "FrameFlow — Script to Storyboard Editor" },
      {
        property: "og:description",
        content: "Turn raw scripts into cinematic storyboard frames in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditorPage,
});

type AiModel = { id: string | number; name: string; provider: string };

function EditorPage() {
  const [script, setScript] = useState("");
  const [frames, setFrames] = useState<Frame[]>([]);
  const [generating, setGenerating] = useState(false);
  const [models, setModels] = useState<AiModel[]>([]);
  const [provider, setProvider] = useState<string>("");
  const [loadingModels, setLoadingModels] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await db
        .from("ai_models")
        .select("*")
        .eq("model_type", "text");
      if (!active) return;
      if (error) {
        toast.error("Could not load AI models", { description: error.message });
      } else {
        const list = ((data ?? []) as unknown as AiModel[]).filter((m) => m?.provider);
        setModels(list);
        if (list[0]) setProvider(list[0].provider);
      }
      setLoadingModels(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function generate() {
    if (!script.trim()) {
      toast.error("Paste a script first");
      return;
    }
    if (!provider) {
      toast.error("Pick an AI model first");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-storyboard", {
        body: { script, provider },
      });
      if (error) throw new Error(error.message);
      const payload = (data ?? {}) as { frames?: unknown[]; error?: string };
      if (payload.error) throw new Error(payload.error);

      const parsed: Frame[] = (payload.frames ?? []).map((raw, i) => {
        const f = raw as Partial<Frame>;
        return {
          id: `${Date.now()}-${i}`,
          shot_number: Number(f.shot_number ?? i + 1),
          character: f.character ?? null,
          dialogue: f.dialogue ?? null,
          action: f.action ?? "",
          image_prompt: f.image_prompt ?? null,
        };
      });
      setFrames(parsed);
      toast.success("Storyboard generated", { description: `${parsed.length} frames ready.` });
    } catch (error) {
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setGenerating(false);
    }
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

          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Cpu className="size-3.5" /> AI model
            </label>
            <Select value={provider} onValueChange={setProvider} disabled={loadingModels}>
              <SelectTrigger className="h-11 w-full rounded-xl border-border/60 bg-background/60">
                <SelectValue
                  placeholder={loadingModels ? "Loading models…" : "Select an AI model"}
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {models.map((m) => (
                  <SelectItem key={String(m.id ?? m.provider)} value={m.provider}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                {frames.map((frame) => (
                  <FrameCard
                    key={frame.id}
                    frame={frame}
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

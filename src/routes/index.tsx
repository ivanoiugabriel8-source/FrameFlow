import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Wand2, LayoutGrid, Cpu, Clock } from "lucide-react";
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
import { AppShell, type RecentProject } from "@/components/AppShell";
import { FrameCard, type Frame } from "@/components/FrameCard";
import { db, type FrameRow } from "@/integrations/supabase/tables";
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

function rowToFrame(row: FrameRow): Frame {
  return {
    id: row.id,
    shot_number: row.frame_number,
    character: row.character_name,
    dialogue: row.dialogue,
    action: row.action_description ?? "",
    image_prompt: row.image_prompt,
    image_url: row.image_url,
  };
}

function EditorPage() {
  const [script, setScript] = useState("");
  const [frames, setFrames] = useState<Frame[]>([]);
  const [generating, setGenerating] = useState(false);
  const [models, setModels] = useState<AiModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [loadingModels, setLoadingModels] = useState(true);
  const [imageModelProvider, setImageModelProvider] = useState<string>("");
  const [generatingImages, setGeneratingImages] = useState<Set<string>>(new Set());
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

  const selectedProvider = models.find((m) => String(m.id) === selectedModelId)?.provider ?? "";

  const loadRecentProjects = useCallback(async () => {
    const { data, error } = await db
      .from("projects")
      .select("id, title, created_at, frames(count)")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) return;
    const list = ((data ?? []) as unknown as Array<{
      id: string;
      title: string;
      frames?: { count: number }[] | null;
    }>).map((p) => ({
      id: p.id,
      title: p.title || "Untitled project",
      frameCount: p.frames?.[0]?.count ?? 0,
    }));
    setRecentProjects(list);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await db.from("ai_models").select("*").eq("model_type", "text");
      if (!active) return;
      if (error) {
        toast.error("Could not load AI models", { description: error.message });
      } else {
        const list = ((data ?? []) as unknown as AiModel[]).filter((m) => m?.provider);
        setModels(list);
        if (list[0]) setSelectedModelId(String(list[0].id));
      }
      setLoadingModels(false);

      const { data: imageData } = await db.from("ai_models").select("*").eq("model_type", "image");
      if (!active) return;
      const firstImage = ((imageData ?? []) as unknown as AiModel[]).find((m) => m?.provider);
      if (firstImage) setImageModelProvider(firstImage.provider);
    })();
    void loadRecentProjects();
    return () => {
      active = false;
    };
  }, [loadRecentProjects]);

  async function openProject(projectId: string) {
    try {
      const { data: project, error: projectError } = await db
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();
      if (projectError) throw new Error(projectError.message);

      const { data: frameRows, error: framesError } = await db
        .from("frames")
        .select("*")
        .eq("project_id", projectId)
        .order("frame_number", { ascending: true });
      if (framesError) throw new Error(framesError.message);

      setCurrentProjectId(projectId);
      setScript(project?.raw_script ?? "");
      setFrames(((frameRows ?? []) as FrameRow[]).map(rowToFrame));
    } catch (err) {
      toast.error("Could not load project", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  function newProject() {
    setCurrentProjectId(null);
    setScript("");
    setFrames([]);
  }

  async function generateImage(frameId: string) {
    const frame = frames.find((f) => f.id === frameId);
    if (!frame) return;
    if (!imageModelProvider) {
      toast.error("No image model available");
      return;
    }
    setGeneratingImages((s) => new Set(s).add(frameId));
    try {
      const { data, error } = await db.functions.invoke("generate-image", {
        body: { prompt: frame.image_prompt || frame.action, provider: imageModelProvider },
      });
      if (error) throw new Error(error.message);
      const payload = (data ?? {}) as { image?: string; error?: string };
      if (payload.error) throw new Error(payload.error);
      const image = payload.image;
      if (!image) throw new Error("No image returned");
      setFrames((prev) => prev.map((f) => (f.id === frameId ? { ...f, image_url: image } : f)));

      const { error: updateError } = await db
        .from("frames")
        .update({ image_url: image })
        .eq("id", frameId);
      if (updateError) {
        toast.error("Image not saved", { description: updateError.message });
      }
    } catch (err) {
      toast.error("Image generation failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setGeneratingImages((s) => {
        const next = new Set(s);
        next.delete(frameId);
        return next;
      });
    }
  }

  async function generate() {
    if (!script.trim()) {
      toast.error("Paste a script first");
      return;
    }
    if (!selectedProvider) {
      toast.error("Pick an AI model first");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await db.functions.invoke("generate-storyboard", {
        body: { script, provider: selectedProvider },
      });
      if (error) throw new Error(error.message);
      const payload = data as { frames?: unknown; error?: unknown } | undefined;
      if (payload && !Array.isArray(payload) && typeof payload === "object" && "error" in payload) {
        throw new Error(String(payload.error));
      }
      const rawFrames: unknown[] =
        payload && Array.isArray(payload.frames) ? payload.frames : [];

      const userId = (await db.auth.getUser()).data.user?.id ?? null;

      const title = script.trim() ? script.trim().slice(0, 40) : "Untitled project";
      const { data: project, error: projectError } = await db
        .from("projects")
        .insert({ user_id: userId, title, raw_script: script })
        .select("id")
        .single();
      if (projectError) throw new Error(projectError.message);
      const projectId = project.id;

      const inserts = rawFrames.map((raw, i) => {
        const f = raw as Partial<Frame>;
        return {
          project_id: projectId,
          user_id: userId,
          frame_number: Number(f.shot_number ?? i + 1),
          character_name: f.character ?? null,
          dialogue: f.dialogue ?? null,
          action_description: f.action ?? "",
          image_prompt: f.image_prompt ?? null,
          image_url: null,
        };
      });

      let insertedFrames: FrameRow[] = [];
      if (inserts.length > 0) {
        const { data: rows, error: framesError } = await db
          .from("frames")
          .insert(inserts)
          .select("*");
        if (framesError) throw new Error(framesError.message);
        insertedFrames = ((rows ?? []) as FrameRow[]).sort(
          (a, b) => a.frame_number - b.frame_number,
        );
      }

      setCurrentProjectId(projectId);
      setFrames(insertedFrames.map(rowToFrame));
      void loadRecentProjects();
      toast.success("Storyboard generated", { description: `${rawFrames.length} frames ready.` });
    } catch (error) {
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <AppShell
      projects={recentProjects}
      onSelectProject={(id) => void openProject(id)}
      onNewProject={newProject}
    >
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
            <Select value={selectedModelId} onValueChange={setSelectedModelId} disabled={loadingModels}>
              <SelectTrigger className="h-11 w-full rounded-xl border-border/60 bg-background/60">
                <SelectValue
                  placeholder={loadingModels ? "Loading models…" : "Select an AI model"}
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {models.map((m) => (
                  <SelectItem key={String(m.id)} value={String(m.id)}>
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
                    onGenerate={generateImage}
                    isGenerating={generatingImages.has(frame.id)}
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

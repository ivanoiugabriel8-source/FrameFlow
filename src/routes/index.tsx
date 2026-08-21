import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Wand2, LayoutGrid, Cpu, Clock, PlusCircle } from "lucide-react";
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
import { db, type FrameRow, type EpisodeDurationRow } from "@/integrations/supabase/tables";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FrameFlow — Episodic Script Generator" },
      {
        name: "description",
        content:
          "Generate detailed episodic scripts for 2D limited-animation YouTube videos, shot by shot.",
      },
      { property: "og:title", content: "FrameFlow — Episodic Script Generator" },
      {
        property: "og:description",
        content: "Turn raw ideas into detailed, shot-by-shot animation scripts in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditorPage,
});

type AiModel = { id: string | number; name: string; provider: string };

type GeneratedFrame = {
  frame_number?: number;
  landscape_description?: string | null;
  characters_present?: string | null;
  action_and_movement?: string | null;
  dialogue?: string | null;
  background_sounds?: string | null;
  manual_image_prompt?: string | null;
};

const FALLBACK_DURATIONS: EpisodeDurationRow[] = [
  { id: "1", label: "1 minute", minutes: 1, sort_order: 1 },
  { id: "2", label: "3 minutes", minutes: 3, sort_order: 2 },
  { id: "3", label: "5 minutes", minutes: 5, sort_order: 3 },
  { id: "4", label: "10 minutes", minutes: 10, sort_order: 4 },
];

function rowToFrame(row: FrameRow): Frame {
  return {
    id: row.id,
    frame_number: row.frame_number,
    landscape_description: row.landscape_description,
    characters_present: row.characters_present,
    action_and_movement: row.action_and_movement,
    dialogue: row.dialogue,
    background_sounds: row.background_sounds,
    manual_image_prompt: row.manual_image_prompt,
    image_url: row.image_url,
  };
}

function EditorPage() {
  const [script, setScript] = useState("");
  const [frames, setFrames] = useState<Frame[]>([]);
  const [generating, setGenerating] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [models, setModels] = useState<AiModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [loadingModels, setLoadingModels] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [durations, setDurations] = useState<EpisodeDurationRow[]>([]);
  const [durationMinutes, setDurationMinutes] = useState<number>(5);

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

      const { data: durationData } = await db
        .from("episode_durations")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!active) return;
      const rows = ((durationData ?? []) as unknown as EpisodeDurationRow[]).filter(
        (d) => d?.label != null,
      );
      const finalRows = rows.length > 0 ? rows : FALLBACK_DURATIONS;
      setDurations(finalRows);
      const preferred = finalRows.find((d) => Number(d.minutes) === 5) ?? finalRows[0];
      if (preferred) setDurationMinutes(Number(preferred.minutes));
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

  async function setFrameImageUrl(frameId: string, url: string) {
    const value = url.length > 0 ? url : null;
    setFrames((prev) => prev.map((f) => (f.id === frameId ? { ...f, image_url: value } : f)));
    const { error } = await db.from("frames").update({ image_url: value }).eq("id", frameId);
    if (error) {
      toast.error("Image not saved", { description: error.message });
    } else {
      toast.success(value ? "Image updated" : "Image removed");
    }
  }

  async function callGenerator(previousFrames?: Frame[]) {
    const body: Record<string, unknown> = {
      script,
      provider: selectedProvider,
      durationMinutes,
    };
    if (previousFrames) {
      body["previousFrames"] = previousFrames.map((f) => ({
        frame_number: f.frame_number,
        characters_present: f.characters_present,
        action_and_movement: f.action_and_movement,
        dialogue: f.dialogue,
      }));
    }
    const { data, error } = await db.functions.invoke("generate-storyboard", { body });
    if (error) throw new Error(error.message);
    const payload = data as { frames?: unknown; error?: unknown } | undefined;
    if (payload && typeof payload === "object" && "error" in payload && payload.error) {
      throw new Error(String(payload.error));
    }
    return (payload && Array.isArray(payload.frames)
      ? payload.frames
      : []) as GeneratedFrame[];
  }

  function toInsert(
    raw: GeneratedFrame,
    index: number,
    projectId: string,
    userId: string | null,
    offset: number,
  ) {
    return {
      project_id: projectId,
      user_id: userId,
      frame_number: Number(raw.frame_number ?? offset + index + 1),
      landscape_description: raw.landscape_description ?? null,
      characters_present: raw.characters_present ?? null,
      action_and_movement: raw.action_and_movement ?? null,
      dialogue: raw.dialogue ?? null,
      background_sounds: raw.background_sounds ?? null,
      manual_image_prompt: raw.manual_image_prompt ?? null,
      image_url: null,
    };
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
      const rawFrames = await callGenerator();
      const userId = (await db.auth.getUser()).data.user?.id ?? null;

      const title = script.trim() ? script.trim().slice(0, 40) : "Untitled project";
      const { data: project, error: projectError } = await db
        .from("projects")
        .insert({ user_id: userId, title, raw_script: script })
        .select("id")
        .single();
      if (projectError) throw new Error(projectError.message);
      const projectId = project.id;

      const inserts = rawFrames.map((raw, i) => toInsert(raw, i, projectId, userId, 0));

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
      toast.success("Script generated", { description: `${rawFrames.length} frames ready.` });
    } catch (error) {
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setGenerating(false);
    }
  }

  async function continueStory() {
    if (frames.length === 0) return;
    if (!selectedProvider) {
      toast.error("Pick an AI model first");
      return;
    }
    if (!currentProjectId) {
      toast.error("Generate a script first");
      return;
    }
    setContinuing(true);
    try {
      const rawFrames = await callGenerator(frames);
      const userId = (await db.auth.getUser()).data.user?.id ?? null;
      const offset = frames.reduce((max, f) => Math.max(max, f.frame_number), 0);

      const inserts = rawFrames.map((raw, i) => ({
        ...toInsert(raw, i, currentProjectId, userId, offset),
        frame_number: offset + i + 1,
      }));

      if (inserts.length > 0) {
        const { data: rows, error: framesError } = await db
          .from("frames")
          .insert(inserts)
          .select("*");
        if (framesError) throw new Error(framesError.message);
        const appended = ((rows ?? []) as FrameRow[])
          .sort((a, b) => a.frame_number - b.frame_number)
          .map(rowToFrame);
        setFrames((prev) => [...prev, ...appended]);
      }

      void loadRecentProjects();
      toast.success("Story continued", { description: `${rawFrames.length} new frames added.` });
    } catch (error) {
      toast.error("Continuation failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setContinuing(false);
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
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Episode script editor</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste your premise — FrameFlow writes a detailed, shot-by-shot 2D limited-animation
            script.
          </p>
        </header>

        <Card className="rounded-2xl border-border/60 bg-card/60 p-4 shadow-sm sm:p-6">
          <Textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="INT. UNDERGROUND HANGAR — NIGHT&#10;&#10;MAYA&#10;We only get one shot at this..."
            className="min-h-56 resize-y rounded-xl border-border/60 bg-background/60 font-mono text-sm leading-relaxed focus-visible:ring-primary/40"
          />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Cpu className="size-3.5" /> AI model
              </label>
              <Select
                value={selectedModelId}
                onValueChange={setSelectedModelId}
                disabled={loadingModels}
              >
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

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Clock className="size-3.5" /> Episode duration
              </label>
              <Select
                value={String(durationMinutes)}
                onValueChange={(v) => setDurationMinutes(Number(v))}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-border/60 bg-background/60">
                  <SelectValue placeholder="Select episode duration" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {durations.map((d) => (
                    <SelectItem key={String(d.id ?? d.minutes)} value={String(d.minutes)}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 gap-2"
              disabled={generating || continuing}
              onClick={generate}
            >
              {generating ? <Loader2 className="animate-spin" /> : <Wand2 />}
              {generating ? "Generating…" : "Generate Storyboard"}
            </Button>

            {frames.length > 0 ? (
              <Button
                size="lg"
                variant="secondary"
                className="flex-1 gap-2"
                disabled={generating || continuing}
                onClick={continueStory}
              >
                {continuing ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                {continuing ? "Continuing…" : "Continue Story"}
              </Button>
            ) : null}
          </div>
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
                    onSetImageUrl={(id, url) => void setFrameImageUrl(id, url)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-border/70 py-20 text-center">
              <LayoutGrid className="size-7 text-muted-foreground/70" />
              <p className="text-sm font-medium">No frames yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Your generated episode frames will appear here in a responsive grid.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

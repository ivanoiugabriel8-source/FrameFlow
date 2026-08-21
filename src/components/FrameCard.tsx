import { useState } from "react";
import {
  AudioLines,
  Check,
  ChevronDown,
  Copy,
  ImageIcon,
  Link2,
  MapPin,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export type Frame = {
  id: string;
  frame_number: number;
  landscape_description?: string | null;
  characters_present?: string | null;
  action_and_movement?: string | null;
  dialogue?: string | null;
  background_sounds?: string | null;
  manual_image_prompt?: string | null;
  image_url?: string | null;
};

export function FrameCard({
  frame,
  onDelete,
  onSetImageUrl,
}: {
  frame: Frame;
  onDelete: (id: string) => void;
  onSetImageUrl: (id: string, url: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [urlDraft, setUrlDraft] = useState(frame.image_url ?? "");
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    if (!frame.manual_image_prompt) return;
    await navigator.clipboard.writeText(frame.manual_image_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card className="group overflow-hidden rounded-2xl border-border/60 bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <div className="relative aspect-video w-full overflow-hidden bg-muted/60">
        {frame.image_url ? (
          <img
            src={frame.image_url}
            alt={frame.manual_image_prompt ?? frame.action_and_movement ?? "Frame image"}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground">
            <ImageIcon className="size-7 opacity-60 transition-transform duration-300 group-hover:scale-110" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
          Shot {frame.frame_number}
        </span>
      </div>

      {editing ? (
        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 p-3">
          <Input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Paste image URL…"
            className="h-9 rounded-lg text-sm"
          />
          <Button
            size="sm"
            onClick={() => {
              onSetImageUrl(frame.id, urlDraft.trim());
              setEditing(false);
            }}
          >
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      ) : null}

      <CardContent className="space-y-2.5 pt-5">
        {frame.landscape_description ? (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span>{frame.landscape_description}</span>
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <h3 className="min-w-0 truncate text-base font-bold tracking-tight">
            {frame.characters_present || "No characters"}
          </h3>
          <Badge variant="secondary" className="shrink-0">
            #{frame.frame_number}
          </Badge>
        </div>

        {frame.dialogue ? (
          <p className="text-sm italic text-foreground/90">&ldquo;{frame.dialogue}&rdquo;</p>
        ) : null}

        {frame.action_and_movement ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {frame.action_and_movement}
          </p>
        ) : null}

        {frame.background_sounds ? (
          <Badge variant="outline" className="gap-1.5 font-normal">
            <AudioLines className="size-3.5" />
            {frame.background_sounds}
          </Badge>
        ) : null}

        {frame.manual_image_prompt ? (
          <Collapsible className="rounded-xl border border-border/60 bg-muted/30">
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              Image prompt
              <ChevronDown className="size-3.5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 px-3 pb-3">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-foreground/80">
                {frame.manual_image_prompt}
              </pre>
              <Button size="sm" variant="secondary" className="gap-1.5" onClick={copyPrompt}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy prompt"}
              </Button>
            </CollapsibleContent>
          </Collapsible>
        ) : null}
      </CardContent>

      <CardFooter className="flex items-center gap-2 border-t border-border/60 pt-4">
        <Button
          variant="secondary"
          className="flex-1 gap-2"
          onClick={() => {
            setUrlDraft(frame.image_url ?? "");
            setEditing((v) => !v);
          }}
        >
          <Link2 className="size-4" />
          {frame.image_url ? "Change image" : "Add image URL"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete frame"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(frame.id)}
        >
          <Trash2 />
        </Button>
      </CardFooter>
    </Card>
  );
}

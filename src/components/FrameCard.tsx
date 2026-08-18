import { ImageIcon, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export type Frame = {
  id: string;
  shot_number: number;
  character: string | null;
  dialogue: string | null;
  action: string;
  image_prompt?: string | null;
};

export function FrameCard({
  frame,
  onDelete,
  onGenerate,
}: {
  frame: Frame;
  onDelete: (id: string) => void;
  onGenerate: (id: string) => void;
}) {
  return (
    <Card className="group overflow-hidden rounded-2xl border-border/60 bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <div className="relative aspect-video w-full overflow-hidden bg-muted/60">
        <div className="absolute inset-0 grid place-items-center gap-2 text-muted-foreground">
          <ImageIcon className="size-7 opacity-60 transition-transform duration-300 group-hover:scale-110" />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
          Shot {frame.shot_number}
        </span>
      </div>

      <CardContent className="space-y-2.5 pt-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="min-w-0 truncate text-base font-bold tracking-tight">
            {frame.character ?? "No character"}
          </h3>
          <Badge variant="secondary" className="shrink-0">
            #{frame.shot_number}
          </Badge>
        </div>
        {frame.dialogue ? (
          <p className="text-sm italic text-foreground/90">&ldquo;{frame.dialogue}&rdquo;</p>
        ) : null}
        <p className="text-sm leading-relaxed text-muted-foreground">{frame.action}</p>
      </CardContent>

      <CardFooter className="flex items-center gap-2 border-t border-border/60 pt-4">
        <Button className="flex-1" onClick={() => onGenerate(frame.id)}>
          <Sparkles /> Generate Image
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

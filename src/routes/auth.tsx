import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clapperboard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — FrameFlow Storyboard Studio" },
      {
        name: "description",
        content: "Log in or create your FrameFlow account to turn scripts into animation storyboards.",
      },
      { property: "og:title", content: "Sign in — FrameFlow" },
      { property: "og:description", content: "Access your FrameFlow storyboard workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    navigate({ to: "/" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created", { description: "You're all set — welcome to FrameFlow." });
    navigate({ to: "/" });
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) return toast.error("Google sign-in failed");
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <Clapperboard className="size-5" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">FrameFlow</h1>
          <p className="text-sm text-muted-foreground">
            Turn raw scripts into cinematic storyboards in seconds.
          </p>
        </div>

        <Card className="rounded-2xl border-border/60 bg-card/70 shadow-lg backdrop-blur">
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {(["login", "register"] as const).map((tab) => (
                <TabsContent key={tab} value={tab} className="pt-6">
                  <form onSubmit={tab === "login" ? signIn : signUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${tab}-email`}>Email</Label>
                      <Input
                        id={`${tab}-email`}
                        type="email"
                        required
                        placeholder="you@studio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${tab}-password`}>Password</Label>
                      <Input
                        id={`${tab}-password`}
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy && <Loader2 className="animate-spin" />}
                      {tab === "login" ? "Log in" : "Create account"}
                    </Button>
                  </form>
                </TabsContent>
              ))}
            </Tabs>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or continue with
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" className="w-full" onClick={google}>
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                <path
                  fill="currentColor"
                  d="M21.35 11.1H12v2.9h5.35c-.23 1.4-1.66 4.1-5.35 4.1a5.9 5.9 0 1 1 0-11.8c1.7 0 2.85.73 3.5 1.35l2.4-2.31A9 9 0 1 0 12 21c5.2 0 8.63-3.65 8.63-8.8 0-.59-.07-1.04-.28-1.1Z"
                />
              </svg>
              Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

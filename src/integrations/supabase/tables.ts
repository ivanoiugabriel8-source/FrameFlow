import { createClient } from "@supabase/supabase-js";

/**
 * Client for the user-owned Supabase project (custom database + Edge Functions).
 * The managed client in `client.ts` is pinned to the platform project, so this
 * one carries the custom project credentials explicitly.
 */
const CUSTOM_SUPABASE_URL = "https://oadqoonxxkuqqtqntgdk.supabase.co";
const CUSTOM_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZHFvb254eGt1cXF0cW50Z2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODU2OTIsImV4cCI6MjEwMjU2MTY5Mn0.RxOR45xoc_NdVapQ3o3r1wIblXFv1ZQusMlceTeMmms";

export type AiModelRow = {
  id: string;
  name: string;
  provider: string;
  model_type: string;
  credit_cost: number;
  is_active: boolean;
};

type CustomDatabase = {
  public: {
    Tables: {
      ai_models: {
        Row: AiModelRow;
        Insert: Partial<AiModelRow> & { name: string; provider: string; model_type: string };
        Update: Partial<AiModelRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export const db = createClient<CustomDatabase>(CUSTOM_SUPABASE_URL, CUSTOM_SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
  },
});

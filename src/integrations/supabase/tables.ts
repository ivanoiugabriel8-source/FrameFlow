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

export type ProjectRow = {
  id: string;
  user_id: string | null;
  title: string;
  raw_script: string | null;
  created_at: string;
};

export type FrameRow = {
  id: string;
  project_id: string;
  user_id: string | null;
  frame_number: number;
  character_name: string | null;
  dialogue: string | null;
  action_description: string | null;
  image_prompt: string | null;
  image_url: string | null;
  landscape_description: string | null;
  characters_present: string | null;
  action_and_movement: string | null;
  background_sounds: string | null;
  manual_image_prompt: string | null;
  created_at?: string;
};

export type EpisodeDurationRow = {
  id: string;
  label: string;
  minutes: number;
  sort_order: number;
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
      projects: {
        Row: ProjectRow;
        Insert: Partial<ProjectRow> & { title: string };
        Update: Partial<ProjectRow>;
        Relationships: [];
      };
      frames: {
        Row: FrameRow;
        Insert: Partial<FrameRow> & { project_id: string; frame_number: number };
        Update: Partial<FrameRow>;
        Relationships: [];
      };
      episode_durations: {
        Row: EpisodeDurationRow;
        Insert: Partial<EpisodeDurationRow> & { label: string; minutes: number };
        Update: Partial<EpisodeDurationRow>;
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

import { createClient } from "@supabase/supabase-js";

/**
 * Client for the user-owned Supabase project.
 * Reads credentials strictly from Vite environment variables.
 */
const SUPABASE_URL = import.meta.env['VITE_SUPABASE_URL'];
const SUPABASE_ANON_KEY = import.meta.env['VITE_SUPABASE_ANON_KEY'];

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

export const db = createClient<CustomDatabase>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
  },
});

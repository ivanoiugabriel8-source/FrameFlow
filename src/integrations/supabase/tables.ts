import { supabase } from "./client";

/**
 * Local schema shim for tables that live in the connected database but are not
 * part of the generated `types.ts` (which is managed automatically).
 */
export type AiModelRow = {
  id: string;
  name: string;
  provider: string;
  model_type: string;
  credit_cost: number;
  is_active: boolean;
};

type ExtraTables = {
  ai_models: AiModelRow;
};

type UntypedFrom = {
  from<K extends keyof ExtraTables>(
    table: K,
  ): {
    select(columns?: string): {
      eq(
        column: keyof ExtraTables[K] & string,
        value: unknown,
      ): PromiseLike<{ data: ExtraTables[K][] | null; error: { message: string } | null }>;
    };
  };
};

export const db = supabase as unknown as UntypedFrom;

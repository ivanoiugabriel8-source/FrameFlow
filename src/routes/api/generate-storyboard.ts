import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT =
  "You are an expert storyboard artist. Break this script into distinct camera shots. Return ONLY a valid JSON array of objects. Each object must have these exact keys: 'shot_number' (integer), 'character' (string, or null), 'dialogue' (string, or null), 'action' (string, describe what happens), 'image_prompt' (string, a highly detailed prompt to generate an image for this shot).";

function stripMarkdown(raw: string): string {
  let text = raw.trim();
  text = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) text = text.slice(start, end + 1);
  return text;
}

async function callOpenAICompatible(
  url: string,
  apiKey: string,
  model: string,
  script: string,
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: script },
      ],
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Upstream error (${res.status}): ${body.slice(0, 400)}`);
  const json = JSON.parse(body);
  return json?.choices?.[0]?.message?.content ?? "";
}

export const Route = createFileRoute("/api/generate-storyboard")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { script, provider } = (await request.json()) as {
            script?: string;
            provider?: string;
          };

          if (!script?.trim()) {
            return Response.json({ error: "Missing 'script'." }, { status: 400 });
          }
          if (!provider) {
            return Response.json({ error: "Missing 'provider'." }, { status: 400 });
          }

          let content = "";

          if (provider === "google") {
            const key = process.env["GEMINI_API_KEY"];
            if (!key) throw new Error("GEMINI_API_KEY is not configured.");
            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: `${SYSTEM_PROMPT} Script: ${script}` }] }],
                }),
              },
            );
            const body = await res.text();
            if (!res.ok) throw new Error(`Gemini error (${res.status}): ${body.slice(0, 400)}`);
            const json = JSON.parse(body);
            content = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          } else if (provider.includes(":free")) {
            const key = process.env["OPENROUTER_API_KEY"];
            if (!key) throw new Error("OPENROUTER_API_KEY is not configured.");
            content = await callOpenAICompatible(
              "https://openrouter.ai/api/v1/chat/completions",
              key,
              provider,
              script,
            );
          } else if (provider.includes("/")) {
            const key = process.env["HUGGINGFACE_API_KEY"];
            if (!key) throw new Error("HUGGINGFACE_API_KEY is not configured.");
            content = await callOpenAICompatible(
              `https://api-inference.huggingface.co/models/${provider}/v1/chat/completions`,
              key,
              provider,
              script,
            );
          } else {
            const key = process.env["GROQ_API_KEY"];
            if (!key) throw new Error("GROQ_API_KEY is not configured.");
            content = await callOpenAICompatible(
              "https://api.groq.com/openai/v1/chat/completions",
              key,
              provider,
              script,
            );
          }

          let frames: unknown;
          try {
            frames = JSON.parse(stripMarkdown(content));
          } catch {
            throw new Error("The model did not return valid JSON.");
          }
          if (!Array.isArray(frames)) throw new Error("Model response was not a JSON array.");

          return Response.json({ frames });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("[generate-storyboard]", message);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});

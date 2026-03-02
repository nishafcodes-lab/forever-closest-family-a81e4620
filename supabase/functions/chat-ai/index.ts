import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODERATION_SYSTEM_PROMPT = `You are a content moderation AI for a school reunion platform.

Your job is to evaluate if a message is appropriate. 

BLOCK messages that contain:
- Bullying, harassment, or threats
- Offensive, abusive, or hateful language
- Personal contact info shared without context (phone numbers, addresses)
- Academic cheating assistance
- Sexually explicit content
- Discrimination or hate speech

ALLOW messages that are:
- Friendly greetings and catch-ups
- Sharing memories and experiences
- Professional communication with teachers
- Event planning and reunion discussions
- General small talk

Respond with ONLY a JSON object (no markdown, no code blocks):
{"allowed": true} or {"allowed": false, "reason": "brief reason"}`;

const CHATBOT_SYSTEM_PROMPT = `You are an AI assistant inside a school reunion platform.

Your role is to:
- Help students reconnect respectfully
- Help students communicate professionally with teachers
- Maintain polite, safe, and appropriate communication
- Suggest conversation starters for reconnecting with old classmates
- Help draft professional messages to teachers
- Provide reunion event information and tips

Adjust tone based on conversation type:
- Student-to-Student → Friendly, casual, respectful
- Student-to-Teacher → Formal, respectful, professional

Never generate:
- Offensive or abusive language
- Personal contact sharing without consent
- Academic cheating assistance
- Sensitive personal data

Keep responses short, clear, and relevant to the conversation context.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, message, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (action === "moderate") {
      // Fast moderation check using lightweight model
      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              { role: "system", content: MODERATION_SYSTEM_PROMPT },
              { role: "user", content: `Evaluate this message: "${message}"` },
            ],
            stream: false,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const t = await response.text();
        console.error("Moderation gateway error:", response.status, t);
        // On moderation failure, allow message through (fail-open)
        return new Response(
          JSON.stringify({ allowed: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      try {
        // Try to parse JSON from the response, handling potential markdown wrapping
        const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
        const result = JSON.parse(cleanContent);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        // If parsing fails, allow message through
        console.error("Failed to parse moderation response:", content);
        return new Response(
          JSON.stringify({ allowed: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (action === "chat") {
      // Streaming chatbot response
      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: CHATBOT_SYSTEM_PROMPT },
              ...(messages || []),
            ],
            stream: true,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const t = await response.text();
        console.error("Chat gateway error:", response.status, t);
        return new Response(
          JSON.stringify({ error: "AI service unavailable" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'moderate' or 'chat'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("chat-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

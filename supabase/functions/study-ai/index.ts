import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompts: Record<string, string> = {
  explain: `You are an expert educator and tutor. Your role is to explain complex topics in a clear, engaging, and easy-to-understand way. 
  
  When explaining a topic:
  - Start with a brief overview
  - Break down key concepts step by step
  - Use analogies and real-world examples
  - Highlight important terms and definitions
  - Conclude with practical applications
  
  Format your response with markdown: use ## for headers, **bold** for key terms, and bullet points for lists.`,
  
  quiz: `You are an expert quiz creator for educational purposes. Generate practice questions that test understanding of the given topic.
  
  Create a quiz with:
  - 3-5 multiple choice questions with 4 options each (mark the correct answer with ✓)
  - 2 short answer questions
  - 1 critical thinking question
  
  Format with markdown. Use ## for section headers and number each question clearly. Include an answer key at the end.`,
  
  summarize: `You are an expert at summarizing and condensing information. Create clear, comprehensive summaries of the provided content.
  
  Your summary should include:
  - A brief TL;DR (1-2 sentences)
  - Main points organized by theme
  - Key terms and definitions
  - Important takeaways
  
  Format with markdown: use ## for headers, **bold** for key terms, and bullet points for organized lists.`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, mode } = await req.json();
    
    if (!message || !mode) {
      return new Response(JSON.stringify({ error: "Message and mode are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    const systemPrompt = systemPrompts[mode] || systemPrompts.explain;

    console.log(`Processing ${mode} request for: ${message.substring(0, 50)}...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service requires payment. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("study-ai error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

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
  
  summarize: `You are an expert at summarizing and condensing information. Create clear, comprehensive summaries of the provided content.
  
  Your summary should include:
  - A brief TL;DR (1-2 sentences)
  - Main points organized by theme
  - Key terms and definitions
  - Important takeaways
  
  Format with markdown: use ## for headers, **bold** for key terms, and bullet points for organized lists.`
};

const quizSystemPrompt = `You are an expert quiz creator. Generate exactly 5 multiple choice questions about the given topic.
Each question must have exactly 4 options (A, B, C, D) with only one correct answer.
Make the questions progressively harder.
Include a mix of factual recall, understanding, and application questions.`;

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

    console.log(`Processing ${mode} request for: ${message.substring(0, 50)}...`);

    // For quiz mode, use tool calling to get structured output
    if (mode === "quiz") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: quizSystemPrompt },
            { role: "user", content: `Create a quiz about: ${message}` },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_quiz",
                description: "Create a structured quiz with multiple choice questions",
                parameters: {
                  type: "object",
                  properties: {
                    title: { 
                      type: "string",
                      description: "A short title for the quiz"
                    },
                    questions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string", description: "The question text" },
                          options: {
                            type: "object",
                            properties: {
                              A: { type: "string" },
                              B: { type: "string" },
                              C: { type: "string" },
                              D: { type: "string" }
                            },
                            required: ["A", "B", "C", "D"]
                          },
                          correctAnswer: { 
                            type: "string", 
                            enum: ["A", "B", "C", "D"],
                            description: "The letter of the correct answer"
                          },
                          explanation: { 
                            type: "string",
                            description: "Explanation of why this answer is correct"
                          }
                        },
                        required: ["question", "options", "correctAnswer", "explanation"]
                      }
                    }
                  },
                  required: ["title", "questions"]
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "create_quiz" } }
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

      const data = await response.json();
      console.log("Quiz response received");
      
      // Extract the quiz data from tool call
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall && toolCall.function?.arguments) {
        try {
          const quizData = JSON.parse(toolCall.function.arguments);
          return new Response(JSON.stringify({ type: "quiz", data: quizData }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (parseError) {
          console.error("Failed to parse quiz data:", parseError);
          return new Response(JSON.stringify({ error: "Failed to generate quiz" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
      
      return new Response(JSON.stringify({ error: "Failed to generate quiz structure" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For explain and summarize modes, use streaming
    const systemPrompt = systemPrompts[mode] || systemPrompts.explain;

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

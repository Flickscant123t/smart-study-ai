import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

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

// Helper function to authenticate user and validate credits
async function authenticateAndValidate(req: Request) {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Unauthorized - No valid token provided", status: 401 };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
    return { error: "Server configuration error", status: 500 };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  // Validate the JWT token and get user
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

  if (claimsError || !claimsData?.claims) {
    console.error("Auth validation failed:", claimsError);
    return { error: "Unauthorized - Invalid token", status: 401 };
  }

  const userId = claimsData.claims.sub;
  if (!userId) {
    return { error: "Unauthorized - No user ID in token", status: 401 };
  }

  // Fetch user profile and validate credits
  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_premium, credits_remaining")
    .eq("id", userId)
    .single();

  // If profile doesn't exist, create one with default credits
  if (profileError && profileError.code === "PGRST116") {
    console.log("Profile not found, creating one for user:", userId);
    
    // Get user email from claims
    const userEmail = claimsData.claims.email as string || "";
    
    // Use service role to create profile (bypasses RLS)
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (serviceRoleKey) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey);
      const { error: insertError } = await adminClient
        .from("profiles")
        .insert({ 
          id: userId, 
          email: userEmail, 
          is_premium: false, 
          credits_remaining: 10 
        });
      
      if (insertError) {
        console.error("Failed to create profile:", insertError);
        return { error: "Failed to create user profile", status: 500 };
      }
      
      // Fetch the newly created profile
      const { data: newProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("is_premium, credits_remaining")
        .eq("id", userId)
        .single();
      
      if (fetchError || !newProfile) {
        console.error("Failed to fetch new profile:", fetchError);
        return { error: "Failed to fetch user profile", status: 500 };
      }
      
      profile = newProfile;
    } else {
      console.error("Service role key not available for profile creation");
      return { error: "Profile not found - please sign out and sign in again", status: 403 };
    }
  } else if (profileError) {
    console.error("Profile fetch error:", profileError);
    return { error: "Failed to fetch user profile", status: 500 };
  }

  // Check if user has credits (premium users have unlimited)
  if (!profile) {
    return { error: "Failed to fetch user profile", status: 500 };
  }
  
  if (!profile.is_premium && (profile.credits_remaining || 0) <= 0) {
    return { error: "Insufficient credits - please upgrade to Premium", status: 402 };
  }

  return { userId, profile, supabase };
}

// Helper function to decrement credits after successful AI response
async function decrementCredits(supabase: any, userId: string, isPremium: boolean, currentCredits: number) {
  if (isPremium) return; // Premium users don't use credits

  const newCredits = Math.max(0, currentCredits - 1);
  const { error } = await supabase
    .from("profiles")
    .update({ credits_remaining: newCredits })
    .eq("id", userId);

  if (error) {
    console.error("Failed to decrement credits:", error);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user and validate credits
    const authResult = await authenticateAndValidate(req);
    if ("error" in authResult) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userId, profile, supabase } = authResult;

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

    console.log(`Processing ${mode} request for user ${userId}: ${message.substring(0, 50)}...`);

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
          
          // Decrement credits server-side after successful response
          await decrementCredits(supabase, userId, profile.is_premium, profile.credits_remaining);
          
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
    
    // Decrement credits server-side for streaming responses
    // Note: We decrement at the start of streaming since we can't easily track completion
    await decrementCredits(supabase, userId, profile.is_premium, profile.credits_remaining);
    
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppSidebar from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Sparkles, FileText, HelpCircle, Loader2, Crown, Zap, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import UsageCounter from "@/components/study/UsageCounter";
import { InteractiveQuiz } from "@/components/quiz/InteractiveQuiz";

const studyModes = [
  {
    id: "explain",
    title: "Explain Topic",
    description: "Get a simple, clear explanation of any topic",
    icon: Brain,
    placeholder: "Enter a topic you want to understand better...",
    prompt: "Explain this topic in simple terms: "
  },
  {
    id: "summarize",
    title: "Summarize Notes",
    description: "Condense your notes into key points",
    icon: FileText,
    placeholder: "Paste your notes here to get a summary...",
    prompt: "Summarize these notes into key points: "
  },
  {
    id: "quiz",
    title: "Practice Questions",
    description: "Generate practice questions to test yourself",
    icon: HelpCircle,
    placeholder: "Enter a topic to generate practice questions...",
    prompt: "Generate 5 practice questions about: "
  },
  {
    id: "flashcards",
    title: "Create Flashcards",
    description: "Turn your material into study flashcards",
    icon: Sparkles,
    placeholder: "Enter content to convert into flashcards...",
    prompt: "Create flashcards from this content: "
  }
];

const Study = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading: profileLoading, refetch } = useUserProfile();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);

  const handleStudy = async () => {
    if (!input.trim() || !selectedMode) return;

    const mode = studyModes.find(m => m.id === selectedMode);
    if (!mode) return;

    // Check usage limit for free users
    if (profile && !profile.isPremium && profile.dailyUses >= 15) {
      toast({
        title: "Daily Limit Reached",
        description: "You've used all 15 free uses today. Upgrade to Premium for unlimited access!",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResponse("");
    setQuizData(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const fetchResponse = await fetch(`${supabaseUrl}/functions/v1/study-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: mode.prompt + input, mode: mode.id }),
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json();
        if (fetchResponse.status === 402) {
          toast({
            title: "Daily Limit Reached",
            description: errorData.error || "Upgrade to Premium for unlimited access!",
            variant: "destructive"
          });
          return;
        }
        throw new Error(errorData.error || "Request failed");
      }

      const contentType = fetchResponse.headers.get("content-type");
      
      // Handle quiz (JSON) response
      if (contentType?.includes("application/json")) {
        const data = await fetchResponse.json();
        if (data.type === "quiz") {
          setQuizData(data.data);
        } else {
          setResponse(data.response || JSON.stringify(data, null, 2));
        }
      } 
      // Handle streaming response (SSE)
      else if (contentType?.includes("text/event-stream")) {
        const reader = fetchResponse.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullText += content;
                    setResponse(fullText);
                  }
                } catch {
                  // Skip non-JSON lines
                }
              }
            }
          }
        }
      } else {
        const text = await fetchResponse.text();
        setResponse(text);
      }

      // Refresh profile to update usage counter
      refetch();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedModeData = studyModes.find(m => m.id === selectedMode);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 ml-64 p-6 lg:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header with Usage Counter */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">StudyCap</h1>
                </div>
                <p className="text-muted-foreground mt-2">Your AI-powered study partner</p>
              </div>
              {!profileLoading && profile && (
                <UsageCounter 
                  isPremium={profile.isPremium} 
                  dailyUses={profile.dailyUses}
                />
              )}
            </div>

            {/* Premium Banner for Free Users */}
            {!profileLoading && profile && !profile.isPremium && (
              <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Unlock Unlimited Learning</p>
                      <p className="text-sm text-muted-foreground">Get longer responses, advanced features, and no daily limits</p>
                    </div>
                  </div>
                  <Button variant="premium" onClick={() => navigate("/pricing")}>
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyModes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;
                return (
                  <Card
                    key={mode.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary border-primary" : ""
                    }`}
                    onClick={() => {
                      setSelectedMode(mode.id);
                      setResponse("");
                      setQuizData(null);
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{mode.title}</CardTitle>
                          <CardDescription>{mode.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            {/* Input Area */}
            {selectedMode && selectedModeData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <selectedModeData.icon className="h-5 w-5 text-primary" />
                    {selectedModeData.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={selectedModeData.placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {profile?.isPremium ? (
                        <span className="flex items-center gap-1">
                          <Crown className="w-4 h-4 text-primary" />
                          Premium: Advanced AI with longer responses
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          Free: Basic responses (15/day)
                        </span>
                      )}
                    </div>
                    <Button 
                      onClick={handleStudy} 
                      disabled={isLoading || !input.trim() || (!profile?.isPremium && profile?.dailyUses >= 15)}
                      className="min-w-[120px]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quiz Response */}
            {quizData && (
              <InteractiveQuiz quizData={quizData} onRetry={() => setQuizData(null)} onNewQuiz={() => { setQuizData(null); setInput(""); }} />
            )}

            {/* Text Response Area */}
            {response && !quizData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    StudyCap Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                    {response}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Study;

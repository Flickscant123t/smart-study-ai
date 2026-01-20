import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppSidebar from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Sparkles, FileText, HelpCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleStudy = async () => {
    if (!input.trim() || !selectedMode) return;

    const mode = studyModes.find(m => m.id === selectedMode);
    if (!mode) return;

    setIsLoading(true);
    setResponse("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const result = await supabase.functions.invoke("study-ai", {
        body: { prompt: mode.prompt + input }
      });

      if (result.error) throw result.error;
      setResponse(result.data.response || "No response received");

      // Credits are now decremented server-side - no client-side update needed

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
            <div>
              <h1 className="text-3xl font-bold text-foreground">Study Mode</h1>
              <p className="text-muted-foreground mt-2">Choose a study mode and start learning</p>
            </div>

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
                    onClick={() => setSelectedMode(mode.id)}
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
                  <Button 
                    onClick={handleStudy} 
                    disabled={isLoading || !input.trim()}
                    className="w-full"
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
                </CardContent>
              </Card>
            )}

            {/* Response Area */}
            {response && (
              <Card>
                <CardHeader>
                  <CardTitle>Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
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

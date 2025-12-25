import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  BookOpen, 
  FileText, 
  Send, 
  Crown, 
  AlertCircle,
  CheckCircle2,
  Zap,
  StopCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InteractiveQuiz } from "@/components/quiz/InteractiveQuiz";
import AppSidebar from "@/components/layout/AppSidebar";
import SocialProof from "@/components/dashboard/SocialProof";
import RecentActivity from "@/components/dashboard/RecentActivity";
import StudyModeCard from "@/components/dashboard/StudyModeCard";
import NeuralNetworkLoader from "@/components/loading/NeuralNetworkLoader";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  email: string;
  isPremium: boolean;
  creditsRemaining: number;
}

type StudyMode = "explain" | "quiz" | "summarize";

interface QuizData {
  title: string;
  questions: Array<{
    question: string;
    options: { A: string; B: string; C: string; D: string };
    correctAnswer: string;
    explanation: string;
  }>;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<StudyMode>("explain");
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Set up auth listener and check session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Fetch profile after auth state change
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    setIsLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create one with defaults
        if (error.code === 'PGRST116') {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            setUserProfile({
              email: userData.user.email || '',
              isPremium: false,
              creditsRemaining: 10,
            });
          }
        }
      } else if (data) {
        setUserProfile({
          email: data.email || '',
          isPremium: data.is_premium || false,
          creditsRemaining: data.credits_remaining || 0,
        });
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const updateCredits = async () => {
    if (!userProfile || !session) return;
    
    const newCredits = Math.max(0, userProfile.creditsRemaining - 1);
    
    const { error } = await supabase
      .from('profiles')
      .update({ credits_remaining: newCredits })
      .eq('id', session.user.id);

    if (!error) {
      setUserProfile(prev => prev ? { ...prev, creditsRemaining: newCredits } : null);
    }
  };

  const handleStop = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsProcessing(false);
    }
  }, [abortController]);

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter something to study",
        variant: "destructive",
      });
      return;
    }

    if (!userProfile || !session) return;

    if (!userProfile.isPremium && userProfile.creditsRemaining <= 0) {
      toast({
        title: "No credits remaining",
        description: "Upgrade to Premium for unlimited access!",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setResponse("");
    setQuizData(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      const resp = await fetch(`https://bcbzfuvswrvlmgnegliv.supabase.co/functions/v1/study-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentSession?.access_token || ''}`,
        },
        body: JSON.stringify({ message: input, mode }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        
        if (resp.status === 429) {
          toast({
            title: "Rate Limited",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (resp.status === 402) {
          toast({
            title: "Credits Required",
            description: "Please add credits to continue using AI features.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorData.error || "Failed to get AI response",
            variant: "destructive",
          });
        }
        setIsProcessing(false);
        setAbortController(null);
        return;
      }

      const contentType = resp.headers.get("content-type");
      
      if (contentType?.includes("application/json")) {
        const data = await resp.json();
        if (data.type === "quiz" && data.data) {
          setQuizData(data.data);
          await updateCredits();
        } else if (data.error) {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
        }
        setIsProcessing(false);
        setAbortController(null);
        return;
      }

      if (!resp.body) {
        throw new Error("No response body");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullResponse = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullResponse += content;
              setResponse(fullResponse);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullResponse += content;
              setResponse(fullResponse);
            }
          } catch { /* ignore partial leftovers */ }
        }
      }

      await updateCredits();

    } catch (error) {
      if ((error as Error).name === "AbortError") {
        toast({
          title: "Stopped",
          description: "ThinkCap response was stopped.",
        });
      } else {
        console.error("Stream error:", error);
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
      setAbortController(null);
    }
  };

  const handleQuizRetry = () => {
    // Keep the same quiz data, the component handles resetting state
  };

  const handleNewQuiz = () => {
    setQuizData(null);
    setInput("");
  };

  if (isLoadingProfile || !userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <NeuralNetworkLoader />
      </div>
    );
  }

  const usagePercentage = userProfile.isPremium ? 0 : ((10 - userProfile.creditsRemaining) / 10) * 100;

  const studyModes = [
    { id: "explain" as StudyMode, icon: Brain, title: "Explain Topic", description: "Get clear explanations of complex concepts" },
    { id: "quiz" as StudyMode, icon: BookOpen, title: "Generate Quiz", description: "Test your knowledge with AI-generated questions" },
    { id: "summarize" as StudyMode, icon: FileText, title: "Summarize", description: "Get concise summaries of your notes" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back{userProfile.email.split("@")[0] ? `, ${userProfile.email.split("@")[0]}` : ""}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">What would you like to learn today?</p>
          </div>
          {!userProfile.isPremium && (
            <Button variant="default" className="gap-2" asChild>
              <Link to="/pricing">
                <Zap className="w-4 h-4" />
                Upgrade to Pro
              </Link>
            </Button>
          )}
        </motion.div>

        {/* Social Proof */}
        <SocialProof />

        {/* Usage Stats for Free Users */}
        {!userProfile.isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 p-5 rounded-2xl bg-card border border-border shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-foreground">Credits Remaining</span>
              <span className="text-sm text-muted-foreground">
                {userProfile.creditsRemaining} / 10 credits
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${100 - usagePercentage}%` }}
                className={`h-full rounded-full transition-all ${
                  userProfile.creditsRemaining <= 2 ? "bg-destructive" : "bg-primary"
                }`}
              />
            </div>
            {userProfile.creditsRemaining <= 2 && (
              <p className="mt-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Running low! Upgrade to Pro for unlimited access.
              </p>
            )}
          </motion.div>
        )}

        {/* Upgrade Banner for Free Users */}
        {!userProfile.isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary-dark/10 border border-primary/20"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Unlock Your Full Potential</h3>
                  <p className="text-sm text-muted-foreground">
                    Get unlimited AI queries, advanced features, and priority support.
                  </p>
                </div>
              </div>
              <Button className="whitespace-nowrap" asChild>
                <Link to="/pricing">Upgrade Now</Link>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Quiz Display */}
        {quizData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-card border border-border shadow-sm"
          >
            <InteractiveQuiz
              quizData={quizData}
              onRetry={handleQuizRetry}
              onNewQuiz={handleNewQuiz}
            />
          </motion.div>
        )}

        {/* Study Mode Selection - Hide when quiz is active */}
        {!quizData && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-8"
            >
              <h2 className="text-lg font-semibold mb-4 text-foreground">Choose Study Mode</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {studyModes.map((item, index) => (
                  <StudyModeCard
                    key={item.id}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    isActive={mode === item.id}
                    onClick={() => setMode(item.id)}
                    delay={0.3 + index * 0.1}
                    disabled={isProcessing}
                  />
                ))}
              </div>
            </motion.div>

            {/* Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="relative">
                <Textarea
                  placeholder={
                    mode === "explain"
                      ? "Enter a topic you'd like explained..."
                      : mode === "quiz"
                      ? "Enter a topic to generate practice questions..."
                      : "Paste your notes to summarize..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[150px] pr-16 resize-none rounded-2xl border-border focus:border-primary/50 bg-card text-foreground placeholder:text-muted-foreground"
                  disabled={isProcessing}
                />
                {isProcessing ? (
                  mode !== "quiz" && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute bottom-4 right-4 rounded-xl"
                      onClick={handleStop}
                    >
                      <StopCircle className="w-5 h-5" />
                    </Button>
                  )
                ) : (
                  <Button
                    size="icon"
                    className="absolute bottom-4 right-4 rounded-xl shadow-lg"
                    onClick={handleSubmit}
                    disabled={!userProfile.isPremium && userProfile.creditsRemaining <= 0}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {userProfile.isPremium ? "Unlimited queries" : `${userProfile.creditsRemaining} credits remaining`}
                {!userProfile.isPremium && " • Upgrade for unlimited"}
              </p>
            </motion.div>

            {/* Loading Animation */}
            {isProcessing && mode === "quiz" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <NeuralNetworkLoader />
              </motion.div>
            )}

            {/* Response Area for explain/summarize */}
            {(response || (isProcessing && mode !== "quiz")) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-card border border-border shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">ThinkCap Response</span>
                  {isProcessing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full ml-auto"
                    />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-success ml-auto" />
                  )}
                </div>
                <div className="prose prose-sm max-w-none">
                  {response ? (
                    response.split("\n").map((line, i) => {
                      if (line.startsWith("## ")) {
                        return <h2 key={i} className="text-xl font-bold mt-4 mb-2 text-foreground">{line.replace("## ", "")}</h2>;
                      }
                      if (line.startsWith("### ")) {
                        return <h3 key={i} className="text-lg font-semibold mt-3 mb-2 text-foreground">{line.replace("### ", "")}</h3>;
                      }
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return <p key={i} className="font-semibold text-foreground">{line.replace(/\*\*/g, "")}</p>;
                      }
                      if (line.startsWith("- ")) {
                        return <li key={i} className="text-muted-foreground ml-4">{line.replace("- ", "")}</li>;
                      }
                      if (line.trim()) {
                        return <p key={i} className="text-muted-foreground mb-2">{line}</p>;
                      }
                      return <br key={i} />;
                    })
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>ThinkCap is thinking...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Recent Activity */}
        {!quizData && !response && !isProcessing && <RecentActivity />}
      </main>
    </div>
  );
};

export default Dashboard;

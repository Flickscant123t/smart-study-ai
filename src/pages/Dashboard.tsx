import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  Brain, 
  BookOpen, 
  FileText, 
  Send, 
  Crown, 
  LogOut,
  AlertCircle,
  CheckCircle2,
  Zap,
  StopCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InteractiveQuiz } from "@/components/quiz/InteractiveQuiz";

interface User {
  email: string;
  isPremium: boolean;
  usageToday: number;
  maxUsage: number;
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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-ai`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<StudyMode>("explain");
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("studyai_user");
    if (!storedUser) {
      navigate("/auth");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("studyai_user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/");
  };

  const handleStop = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsProcessing(false);
    }
  }, [abortController]);

  const updateUsage = () => {
    if (!user) return;
    const newUsage = user.usageToday + 1;
    const updatedUser = { ...user, usageToday: newUsage };
    setUser(updatedUser);
    localStorage.setItem("studyai_user", JSON.stringify(updatedUser));
  };

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter something to study",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    // Check usage limits for free users
    if (!user.isPremium && user.usageToday >= user.maxUsage) {
      toast({
        title: "Daily limit reached",
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
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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

      // Check if it's a quiz response (JSON) or streaming response
      const contentType = resp.headers.get("content-type");
      
      if (contentType?.includes("application/json")) {
        // Quiz mode - parse JSON response
        const data = await resp.json();
        if (data.type === "quiz" && data.data) {
          setQuizData(data.data);
          updateUsage();
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

      // Streaming response for explain/summarize modes
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

      // Final flush
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

      updateUsage();

    } catch (error) {
      if ((error as Error).name === "AbortError") {
        toast({
          title: "Stopped",
          description: "AI response was stopped.",
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

  if (!user) return null;

  const usagePercentage = user.isPremium ? 0 : (user.usageToday / user.maxUsage) * 100;
  const remainingQueries = user.isPremium ? "∞" : user.maxUsage - user.usageToday;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Study<span className="gradient-text">.ai</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user.isPremium ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-accent to-purple-600 text-accent-foreground text-sm font-medium">
                <Crown className="w-4 h-4" />
                Premium
              </div>
            ) : (
              <Button variant="premium" size="sm" asChild>
                <Link to="/pricing">
                  <Zap className="w-4 h-4" />
                  Upgrade
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </motion.div>

        {/* Usage Stats for Free Users */}
        {!user.isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Daily Usage</span>
              <span className="text-sm text-muted-foreground">
                {user.usageToday} / {user.maxUsage} queries
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercentage}%` }}
                className={`h-full rounded-full ${
                  usagePercentage >= 80 ? "bg-destructive" : "bg-primary"
                }`}
              />
            </div>
            {usagePercentage >= 80 && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Running low! Upgrade to Premium for unlimited access.
              </p>
            )}
          </motion.div>
        )}

        {/* Upgrade Banner for Free Users */}
        {!user.isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 p-6 rounded-xl bg-gradient-to-r from-accent/10 via-purple-500/10 to-accent/10 border border-accent/20"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-accent" />
                  Unlock Your Full Potential
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get unlimited AI queries, advanced features, and no ads with Premium.
                </p>
              </div>
              <Button variant="premium" asChild>
                <Link to="/pricing">
                  Upgrade Now
                </Link>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Quiz Display */}
        {quizData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-card border border-border"
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
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <h2 className="text-lg font-semibold mb-4">What would you like to do?</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "explain" as StudyMode, icon: Brain, label: "Explain Topic" },
                  { id: "quiz" as StudyMode, icon: BookOpen, label: "Generate Quiz" },
                  { id: "summarize" as StudyMode, icon: FileText, label: "Summarize" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMode(item.id)}
                    disabled={isProcessing}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 ${
                      mode === item.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <item.icon className={`w-6 h-6 mx-auto mb-2 ${
                      mode === item.id ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <span className={`text-sm font-medium ${
                      mode === item.id ? "text-primary" : ""
                    }`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
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
                  className="min-h-[150px] pr-20 resize-none"
                  disabled={isProcessing}
                />
                {isProcessing ? (
                  mode === "quiz" ? (
                    <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                    </div>
                  ) : (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute bottom-4 right-4"
                      onClick={handleStop}
                    >
                      <StopCircle className="w-5 h-5" />
                    </Button>
                  )
                ) : (
                  <Button
                    variant="hero"
                    size="icon"
                    className="absolute bottom-4 right-4"
                    onClick={handleSubmit}
                    disabled={!user.isPremium && user.usageToday >= user.maxUsage}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {remainingQueries} queries remaining today
                {!user.isPremium && " • Upgrade for unlimited"}
              </p>
            </motion.div>

            {/* Response Area for explain/summarize */}
            {(response || (isProcessing && mode !== "quiz")) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl bg-card border border-border"
              >
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-semibold">AI Response</span>
                  {isProcessing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full ml-auto"
                    />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                  )}
                </div>
                <div className="prose prose-sm max-w-none text-foreground">
                  {response ? (
                    response.split("\n").map((line, i) => {
                      if (line.startsWith("## ")) {
                        return <h2 key={i} className="text-xl font-bold mt-4 mb-2 text-foreground">{line.replace("## ", "")}</h2>;
                      }
                      if (line.startsWith("### ")) {
                        return <h3 key={i} className="text-lg font-semibold mt-3 mb-2 text-foreground">{line.replace("### ", "")}</h3>;
                      }
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return <p key={i} className="font-semibold mt-3 text-foreground">{line.replace(/\*\*/g, "")}</p>;
                      }
                      if (line.startsWith("- ") || line.startsWith("* ")) {
                        return <li key={i} className="ml-4 text-foreground">{line.replace(/^[-*] /, "")}</li>;
                      }
                      if (/^\d+\./.test(line)) {
                        return <li key={i} className="ml-4 list-decimal text-foreground">{line.replace(/^\d+\.\s*/, "")}</li>;
                      }
                      if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
                        return <p key={i} className="italic text-muted-foreground mt-2">{line.replace(/\*/g, "")}</p>;
                      }
                      return line ? <p key={i} className="text-foreground">{line}</p> : <br key={i} />;
                    })
                  ) : (
                    <p className="text-muted-foreground">Generating response...</p>
                  )}
                  {isProcessing && (
                    <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

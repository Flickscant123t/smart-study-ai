import { useState, useEffect } from "react";
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
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  email: string;
  isPremium: boolean;
  usageToday: number;
  maxUsage: number;
}

type StudyMode = "explain" | "quiz" | "summarize";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<StudyMode>("explain");
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<string>("");

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

    // Simulate AI processing
    // TODO: Replace with actual AI API integration
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockResponses: Record<StudyMode, string> = {
      explain: `## Understanding: ${input.slice(0, 50)}...\n\nHere's a clear explanation of this topic:\n\n**Key Concepts:**\n- This is a placeholder for AI-generated explanations\n- Connect your preferred AI API (OpenAI, Anthropic, etc.) to enable real responses\n- The explanation would break down complex topics into simple terms\n\n**Why it matters:**\nUnderstanding this concept helps you build a strong foundation for advanced topics.\n\n**Example:**\nImagine you're trying to explain this to a friend...`,
      quiz: `## Practice Questions on: ${input.slice(0, 50)}...\n\n**Question 1:** What is the main concept behind this topic?\n- A) Option one\n- B) Option two\n- C) Option three\n- D) Option four\n\n**Question 2:** How would you apply this in a real-world scenario?\n\n**Question 3:** What are the three key components of this concept?\n\n*Connect an AI API to generate real practice questions!*`,
      summarize: `## Summary of Your Notes\n\n**Main Points:**\n1. First key takeaway from your text\n2. Second important concept\n3. Third critical point\n\n**Key Terms:**\n- Term 1: Definition placeholder\n- Term 2: Definition placeholder\n\n**Bottom Line:**\nThis is a placeholder summary. Connect your AI API to get real summaries of your study materials!`,
    };

    setResponse(mockResponses[mode]);
    
    // Update usage
    const newUsage = user.usageToday + 1;
    const updatedUser = { ...user, usageToday: newUsage };
    setUser(updatedUser);
    localStorage.setItem("studyai_user", JSON.stringify(updatedUser));

    setIsProcessing(false);
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

        {/* Study Mode Selection */}
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
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
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
            />
            <Button
              variant="hero"
              size="icon"
              className="absolute bottom-4 right-4"
              onClick={handleSubmit}
              disabled={isProcessing || (!user.isPremium && user.usageToday >= user.maxUsage)}
            >
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {remainingQueries} queries remaining today
            {!user.isPremium && " • Upgrade for unlimited"}
          </p>
        </motion.div>

        {/* Response Area */}
        {response && (
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
              <CheckCircle2 className="w-4 h-4 text-success ml-auto" />
            </div>
            <div className="prose prose-sm max-w-none text-foreground">
              {response.split("\n").map((line, i) => {
                if (line.startsWith("## ")) {
                  return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace("## ", "")}</h2>;
                }
                if (line.startsWith("**") && line.endsWith("**")) {
                  return <p key={i} className="font-semibold mt-3">{line.replace(/\*\*/g, "")}</p>;
                }
                if (line.startsWith("- ")) {
                  return <li key={i} className="ml-4">{line.replace("- ", "")}</li>;
                }
                if (line.startsWith("*") && line.endsWith("*")) {
                  return <p key={i} className="italic text-muted-foreground mt-4">{line.replace(/\*/g, "")}</p>;
                }
                return line ? <p key={i}>{line}</p> : <br key={i} />;
              })}
            </div>
          </motion.div>
        )}

        {/* API Integration Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border"
        >
          <p className="text-sm text-muted-foreground text-center">
            <strong>Developer Note:</strong> Connect your AI API (OpenAI, Anthropic, etc.) 
            and payment system (Stripe) to enable full functionality. 
            API keys should be stored securely on the backend only.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;

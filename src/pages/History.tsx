import AppSidebar from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, HelpCircle, Sparkles, Clock } from "lucide-react";

interface HistoryItem {
  id: string;
  type: "explain" | "summarize" | "quiz" | "flashcards";
  title: string;
  preview: string;
  timestamp: Date;
}

const historyItems: HistoryItem[] = [
  {
    id: "1",
    type: "explain",
    title: "Photosynthesis Process",
    preview: "Photosynthesis is the process by which plants convert sunlight into energy...",
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: "2",
    type: "quiz",
    title: "World War II Quiz",
    preview: "Generated 5 practice questions about major events of WWII...",
    timestamp: new Date(Date.now() - 7200000)
  },
  {
    id: "3",
    type: "summarize",
    title: "Chapter 5: Thermodynamics",
    preview: "Key points: First law of thermodynamics, entropy, heat transfer...",
    timestamp: new Date(Date.now() - 86400000)
  },
  {
    id: "4",
    type: "flashcards",
    title: "Spanish Vocabulary",
    preview: "Created 10 flashcards for common Spanish phrases...",
    timestamp: new Date(Date.now() - 172800000)
  },
  {
    id: "5",
    type: "explain",
    title: "Machine Learning Basics",
    preview: "Machine learning is a subset of artificial intelligence that enables...",
    timestamp: new Date(Date.now() - 259200000)
  }
];

const typeConfig = {
  explain: { icon: Brain, label: "Explanation", color: "bg-blue-100 text-blue-700" },
  summarize: { icon: FileText, label: "Summary", color: "bg-green-100 text-green-700" },
  quiz: { icon: HelpCircle, label: "Quiz", color: "bg-purple-100 text-purple-700" },
  flashcards: { icon: Sparkles, label: "Flashcards", color: "bg-orange-100 text-orange-700" }
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
};

const History = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">History</h1>
              <p className="text-muted-foreground mt-1">Your recent study sessions</p>
            </div>

            {historyItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No history yet</h3>
                  <p className="text-muted-foreground">Your study sessions will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {historyItems.map((item) => {
                  const config = typeConfig[item.type];
                  const Icon = config.icon;
                  return (
                    <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <CardTitle className="text-base truncate">{item.title}</CardTitle>
                                <Badge variant="secondary" className={config.color}>
                                  {config.label}
                                </Badge>
                              </div>
                              <CardDescription className="line-clamp-2">
                                {item.preview}
                              </CardDescription>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default History;

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, Trophy, Target, RefreshCw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
}

interface QuizResultsProps {
  title: string;
  questions: QuizQuestion[];
  userAnswers: Record<number, string>;
  onRetry: () => void;
  onNewQuiz: () => void;
}

export const QuizResults = ({
  title,
  questions,
  userAnswers,
  onRetry,
  onNewQuiz,
}: QuizResultsProps) => {
  const correctCount = questions.filter(
    (q, i) => userAnswers[i] === q.correctAnswer
  ).length;
  const percentage = Math.round((correctCount / questions.length) * 100);

  const getScoreMessage = () => {
    if (percentage === 100) return "Perfect Score! 🎉";
    if (percentage >= 80) return "Excellent Work! 🌟";
    if (percentage >= 60) return "Good Job! 👍";
    if (percentage >= 40) return "Keep Practicing! 💪";
    return "Don't Give Up! 📚";
  };

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Score Card */}
      <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-purple-500/10 border border-primary/20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4"
        >
          <Trophy className={cn("w-10 h-10", getScoreColor())} />
        </motion.div>
        
        <h2 className="text-2xl font-bold mb-2">{getScoreMessage()}</h2>
        <p className="text-muted-foreground mb-4">{title}</p>
        
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className={cn("text-4xl font-bold", getScoreColor())}>
              {percentage}%
            </div>
            <div className="text-sm text-muted-foreground">Score</div>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground flex items-center gap-1">
              <Check className="w-6 h-6 text-green-500" />
              {correctCount}
            </div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground flex items-center gap-1">
              <X className="w-6 h-6 text-destructive" />
              {questions.length - correctCount}
            </div>
            <div className="text-sm text-muted-foreground">Incorrect</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry Quiz
        </Button>
        <Button variant="hero" onClick={onNewQuiz} className="gap-2">
          New Topic
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Detailed Review */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Review Your Answers
        </h3>

        {questions.map((q, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === q.correctAnswer;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-5 rounded-xl border-2",
                isCorrect
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-destructive/30 bg-destructive/5"
              )}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    isCorrect ? "bg-green-500" : "bg-destructive"
                  )}
                >
                  {isCorrect ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <X className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-1">
                    Question {index + 1}
                  </p>
                  <p className="text-foreground">{q.question}</p>
                </div>
              </div>

              <div className="ml-11 space-y-3">
                {/* User's answer vs correct answer */}
                {!isCorrect && (
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Your answer:</span>
                      <span className="px-2 py-1 rounded bg-destructive/20 text-destructive font-medium">
                        {userAnswer}: {q.options[userAnswer as keyof typeof q.options]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Correct answer:</span>
                      <span className="px-2 py-1 rounded bg-green-500/20 text-green-600 font-medium">
                        {q.correctAnswer}: {q.options[q.correctAnswer as keyof typeof q.options]}
                      </span>
                    </div>
                  </div>
                )}
                {isCorrect && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Your answer: </span>
                    <span className="text-green-600 font-medium">
                      {userAnswer}: {q.options[userAnswer as keyof typeof q.options]}
                    </span>
                  </div>
                )}

                {/* Explanation */}
                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-sm font-medium text-primary mb-1">Explanation</p>
                  <p className="text-sm text-muted-foreground">{q.explanation}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface QuizQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  selectedAnswer: string | null;
  correctAnswer?: string;
  showResult?: boolean;
  onSelectAnswer: (answer: string) => void;
}

const optionLabels = ["A", "B", "C", "D"] as const;

export const QuizQuestion = ({
  questionNumber,
  totalQuestions,
  question,
  options,
  selectedAnswer,
  correctAnswer,
  showResult = false,
  onSelectAnswer,
}: QuizQuestionProps) => {
  const getOptionStyles = (option: string) => {
    if (!showResult) {
      return selectedAnswer === option
        ? "border-primary bg-primary/10 ring-2 ring-primary"
        : "border-border hover:border-primary/50 hover:bg-primary/5";
    }

    if (option === correctAnswer) {
      return "border-green-500 bg-green-500/10 ring-2 ring-green-500";
    }
    if (selectedAnswer === option && option !== correctAnswer) {
      return "border-destructive bg-destructive/10 ring-2 ring-destructive";
    }
    return "border-border opacity-50";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {questionNumber} of {totalQuestions}</span>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i < questionNumber ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <h3 className="text-xl font-semibold text-foreground leading-relaxed">
        {question}
      </h3>

      {/* Options */}
      <div className="grid gap-3">
        {optionLabels.map((label) => (
          <button
            key={label}
            onClick={() => !showResult && onSelectAnswer(label)}
            disabled={showResult}
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left",
              getOptionStyles(label),
              !showResult && "cursor-pointer"
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-colors",
                showResult && label === correctAnswer
                  ? "bg-green-500 text-white"
                  : showResult && selectedAnswer === label && label !== correctAnswer
                  ? "bg-destructive text-destructive-foreground"
                  : selectedAnswer === label
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {showResult && label === correctAnswer ? (
                <Check className="w-5 h-5" />
              ) : showResult && selectedAnswer === label && label !== correctAnswer ? (
                <X className="w-5 h-5" />
              ) : (
                label
              )}
            </div>
            <span className="text-foreground pt-2 flex-1">{options[label]}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

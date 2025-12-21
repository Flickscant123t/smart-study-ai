import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "./QuizQuestion";
import { QuizResults } from "./QuizResults";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

interface Question {
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

interface QuizData {
  title: string;
  questions: Question[];
}

interface InteractiveQuizProps {
  quizData: QuizData;
  onRetry: () => void;
  onNewQuiz: () => void;
}

export const InteractiveQuiz = ({
  quizData,
  onRetry,
  onNewQuiz,
}: InteractiveQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectAnswer = (answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
    onRetry();
  };

  const handleNewQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
    onNewQuiz();
  };

  const isLastQuestion = currentQuestion === quizData.questions.length - 1;
  const allAnswered = quizData.questions.every((_, i) => userAnswers[i] !== undefined);
  const currentAnswered = userAnswers[currentQuestion] !== undefined;

  if (showResults) {
    return (
      <QuizResults
        title={quizData.title}
        questions={quizData.questions}
        userAnswers={userAnswers}
        onRetry={handleRetry}
        onNewQuiz={handleNewQuiz}
      />
    );
  }

  const question = quizData.questions[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Quiz Title */}
      <div className="text-center pb-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">{quizData.title}</h2>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <QuizQuestion
          key={currentQuestion}
          questionNumber={currentQuestion + 1}
          totalQuestions={quizData.questions.length}
          question={question.question}
          options={question.options}
          selectedAnswer={userAnswers[currentQuestion] || null}
          onSelectAnswer={handleSelectAnswer}
        />
      </AnimatePresence>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between pt-4 border-t border-border"
      >
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          {Object.keys(userAnswers).length} of {quizData.questions.length} answered
        </div>

        {isLastQuestion ? (
          <Button
            variant="hero"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Submit Quiz
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={handleNext}
            disabled={!currentAnswered}
            className="gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </motion.div>
    </div>
  );
};

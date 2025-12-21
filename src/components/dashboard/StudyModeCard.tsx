import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StudyModeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
  delay?: number;
  disabled?: boolean;
}

const StudyModeCard = ({
  icon: Icon,
  title,
  description,
  isActive,
  onClick,
  delay = 0,
  disabled = false,
}: StudyModeCardProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={!disabled ? { y: -4, scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`relative p-6 rounded-2xl text-left transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? "bg-primary text-primary-foreground shadow-lg"
          : "bg-card border border-border hover:border-primary/30 hover:shadow-md"
      }`}
      style={{
        boxShadow: isActive ? "0 8px 30px -8px hsl(205 100% 50% / 0.4)" : undefined,
      }}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
          isActive ? "bg-primary-foreground/20" : "bg-primary/10"
        }`}
      >
        <Icon className={`w-6 h-6 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
      </div>
      <h3 className={`text-lg font-semibold mb-1 ${isActive ? "" : "text-foreground"}`}>
        {title}
      </h3>
      <p className={`text-sm ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {description}
      </p>
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute inset-0 rounded-2xl border-2 border-primary-foreground/20"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
};

export default StudyModeCard;

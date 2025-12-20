import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating?: number;
  delay?: number;
}

const TestimonialCard = ({ 
  name, 
  role, 
  content, 
  avatar, 
  rating = 5, 
  delay = 0 
}: TestimonialCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow"
    >
      {/* Rating Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Content */}
      <p className="text-foreground/90 mb-6 leading-relaxed">"{content}"</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-muted-foreground text-xs">{role}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;

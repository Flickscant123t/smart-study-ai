import { motion } from "framer-motion";
import { Star, Users } from "lucide-react";

const testimonials = [
  { text: "This works really well!", author: "Alex M." },
  { text: "I understand topics much faster now", author: "Sarah K." },
  { text: "Game changer for my studies!", author: "James L." },
];

const SocialProof = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-background to-primary/5 border border-primary/10">
        {/* Trust badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">Trusted by 1,000+ students</p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
              <span className="text-sm text-muted-foreground ml-1">4.9/5 rating</span>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="flex-1 flex flex-wrap gap-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="px-4 py-2 rounded-full bg-card border border-border shadow-sm"
            >
              <p className="text-sm">
                <span className="text-foreground">"{t.text}"</span>
                <span className="text-muted-foreground ml-2">— {t.author}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SocialProof;

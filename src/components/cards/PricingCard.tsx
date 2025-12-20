import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  ctaLink: string;
  delay?: number;
}

const PricingCard = ({
  name,
  price,
  period = "/month",
  description,
  features,
  popular = false,
  ctaText,
  ctaLink,
  delay = 0,
}: PricingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`relative p-8 rounded-2xl border transition-all duration-300 ${
        popular
          ? "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30 shadow-xl scale-105"
          : "bg-card border-border hover:border-primary/20 hover:shadow-lg"
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        {period && <span className="text-muted-foreground">{period}</span>}
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={popular ? "premium" : "outline"}
        size="lg"
        className="w-full"
        asChild
      >
        <Link to={ctaLink}>{ctaText}</Link>
      </Button>
    </motion.div>
  );
};

export default PricingCard;

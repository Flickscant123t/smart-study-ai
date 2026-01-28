import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Zap, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/layout/PageLayout";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_28EaEXdh7dr11y87olcV200";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/forever",
    description: "Perfect for trying out StudyCap",
    features: [
      "15 uses per day",
      "Basic AI explanations",
      "Topic summaries",
      "Practice questions",
      "Basic flashcards",
      "Standard response length"
    ],
    ctaText: "Get Started Free",
    ctaLink: "/auth?mode=signup",
    popular: false,
    icon: Zap
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/month",
    description: "Unlimited learning power",
    features: [
      "Unlimited daily uses",
      "Advanced AI model (GPT-4)",
      "Longer, detailed responses",
      "Advanced reasoning & analysis",
      "Priority response speed",
      "Study plan generation",
      "Essay & paper assistance",
      "No ads or interruptions"
    ],
    ctaText: "Upgrade to Premium",
    ctaLink: STRIPE_PAYMENT_LINK,
    popular: true,
    icon: Crown,
    external: true
  }
];

const comparisonFeatures = [
  { feature: "Daily uses", free: "15/day", premium: "Unlimited" },
  { feature: "AI Model", free: "GPT-4o Mini", premium: "GPT-4o" },
  { feature: "Response length", free: "~1,000 tokens", premium: "~4,000 tokens" },
  { feature: "Topic explanations", free: "Basic", premium: "In-depth" },
  { feature: "Practice quizzes", free: "✓", premium: "✓ Advanced" },
  { feature: "Study flashcards", free: "✓", premium: "✓ Enhanced" },
  { feature: "Advanced reasoning", free: "—", premium: "✓" },
  { feature: "Study plan generation", free: "—", premium: "✓" },
  { feature: "Essay assistance", free: "—", premium: "✓" },
];

const Pricing = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <GraduationCap className="w-4 h-4" />
              Simple, transparent pricing
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Choose Your{" "}
              <span className="gradient-text">Learning Path</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground"
            >
              Start free and upgrade when you're ready for unlimited learning power
            </motion.p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30 shadow-xl scale-105"
                      : "bg-card border-border hover:border-primary/20 hover:shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${plan.popular ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                  </div>

                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.external ? (
                    <Button
                      variant={plan.popular ? "premium" : "outline"}
                      size="lg"
                      className="w-full"
                      asChild
                    >
                      <a href={plan.ctaLink} target="_blank" rel="noopener noreferrer">
                        {plan.ctaText}
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant={plan.popular ? "premium" : "outline"}
                      size="lg"
                      className="w-full"
                      asChild
                    >
                      <a href={plan.ctaLink}>{plan.ctaText}</a>
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Feature Comparison</h2>
            <p className="text-muted-foreground">See exactly what you get with each plan</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl border overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/50 p-4 font-semibold text-sm">
                <div>Feature</div>
                <div className="text-center">Free</div>
                <div className="text-center flex items-center justify-center gap-1">
                  <Crown className="w-4 h-4 text-primary" />
                  Premium
                </div>
              </div>
              {comparisonFeatures.map((item, index) => (
                <div 
                  key={item.feature}
                  className={`grid grid-cols-3 p-4 text-sm ${
                    index % 2 === 0 ? "" : "bg-muted/30"
                  }`}
                >
                  <div className="font-medium">{item.feature}</div>
                  <div className="text-center text-muted-foreground">{item.free}</div>
                  <div className="text-center font-medium text-primary">{item.premium}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            {[
              {
                q: "What happens when I reach my daily limit?",
                a: "You'll see a message letting you know you've used all 15 free queries for the day. Your limit resets at midnight, or you can upgrade to Premium for unlimited access."
              },
              {
                q: "Can I cancel Premium anytime?",
                a: "Yes! You can cancel your Premium subscription at any time. You'll continue to have Premium access until the end of your billing period."
              },
              {
                q: "What's the difference in AI quality?",
                a: "Premium users get access to GPT-4o, which provides more detailed, nuanced, and accurate responses. Free users get GPT-4o Mini, which is still capable but more concise."
              },
              {
                q: "Do unused free queries roll over?",
                a: "No, free queries reset daily and don't accumulate. Premium has no limits, so there's nothing to track!"
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-card border"
              >
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20"
          >
            <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Unlock Your Full Potential?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of students who are already studying smarter with StudyCap Premium.
            </p>
            <Button variant="premium" size="lg" asChild>
              <a href={STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Premium
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Pricing;

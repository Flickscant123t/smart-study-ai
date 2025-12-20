import { motion } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import PricingCard from "@/components/cards/PricingCard";
import { Check, X } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for trying out Study.ai",
    features: [
      "10 AI queries per day",
      "Basic topic explanations",
      "Simple note summaries",
      "Practice questions (5/day)",
      "Community support",
    ],
    popular: false,
    ctaText: "Start Free",
    ctaLink: "/auth?mode=signup",
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/month",
    description: "For serious students who want to excel",
    features: [
      "Unlimited AI queries",
      "Advanced explanations",
      "Detailed summaries with key points",
      "Unlimited practice questions",
      "Smart study planner",
      "Priority support",
      "No ads",
      "Export to PDF",
    ],
    popular: true,
    ctaText: "Upgrade to Premium",
    ctaLink: "/auth?mode=signup&plan=premium",
  },
];

const comparisonFeatures = [
  { feature: "Daily AI queries", free: "10/day", premium: "Unlimited" },
  { feature: "Topic explanations", free: "Basic", premium: "Advanced" },
  { feature: "Note summarization", free: "Simple", premium: "Detailed with key points" },
  { feature: "Practice questions", free: "5/day", premium: "Unlimited" },
  { feature: "Study planner", free: false, premium: true },
  { feature: "Export to PDF", free: false, premium: true },
  { feature: "Priority support", free: false, premium: true },
  { feature: "Ad-free experience", free: false, premium: true },
  { feature: "Learning analytics", free: false, premium: true },
];

const Pricing = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block text-primary font-semibold mb-4"
            >
              PRICING
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Simple, Transparent{" "}
              <span className="gradient-text">Pricing</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground"
            >
              Start free and upgrade when you're ready. No hidden fees, cancel anytime.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
            {plans.map((plan, index) => (
              <PricingCard key={plan.name} {...plan} delay={index * 0.15} />
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Compare Plans</h2>
              <p className="text-muted-foreground">
                See what's included in each plan
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-card border border-border overflow-hidden"
            >
              {/* Table Header */}
              <div className="grid grid-cols-3 bg-secondary/50 p-4 border-b border-border">
                <div className="font-semibold">Feature</div>
                <div className="text-center font-semibold">Free</div>
                <div className="text-center font-semibold">Premium</div>
              </div>

              {/* Table Body */}
              {comparisonFeatures.map((item, index) => (
                <div
                  key={item.feature}
                  className={`grid grid-cols-3 p-4 items-center ${
                    index !== comparisonFeatures.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="text-sm">{item.feature}</div>
                  <div className="text-center">
                    {typeof item.free === "boolean" ? (
                      item.free ? (
                        <Check className="w-5 h-5 text-success mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      <span className="text-sm text-muted-foreground">{item.free}</span>
                    )}
                  </div>
                  <div className="text-center">
                    {typeof item.premium === "boolean" ? (
                      item.premium ? (
                        <Check className="w-5 h-5 text-success mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      <span className="text-sm font-medium text-primary">{item.premium}</span>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  q: "Can I cancel my subscription anytime?",
                  a: "Yes! You can cancel your Premium subscription at any time. You'll continue to have access until the end of your billing period.",
                },
                {
                  q: "Is there a student discount?",
                  a: "We're working on special pricing for students with valid .edu email addresses. Stay tuned!",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards and PayPal. All payments are processed securely through Stripe.",
                },
                {
                  q: "Can I upgrade or downgrade my plan?",
                  a: "Absolutely! You can change your plan at any time from your dashboard. Changes take effect immediately.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-xl bg-card border border-border"
                >
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Pricing;

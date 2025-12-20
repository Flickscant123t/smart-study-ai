import { motion } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Brain, 
  BookOpen, 
  FileText, 
  Calendar, 
  Zap, 
  Shield, 
  Clock, 
  Target,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const allFeatures = [
  {
    icon: Brain,
    title: "AI-Powered Explanations",
    description: "Get any topic explained in simple terms. Our AI adapts to your learning level and provides clear, comprehensive explanations for even the most complex subjects.",
    benefits: ["Personalized to your level", "Multiple explanation styles", "Follow-up questions supported"],
  },
  {
    icon: BookOpen,
    title: "Practice Question Generator",
    description: "Generate unlimited practice questions from any topic or your study materials. Perfect for exam preparation and knowledge testing.",
    benefits: ["Multiple question formats", "Difficulty adjustment", "Instant feedback & explanations"],
  },
  {
    icon: FileText,
    title: "Smart Note Summarizer",
    description: "Transform lengthy notes, articles, or textbook chapters into concise, memorable summaries. Save hours of reading time.",
    benefits: ["Key points extraction", "Bullet point summaries", "Highlight important concepts"],
  },
  {
    icon: Calendar,
    title: "Intelligent Study Planner",
    description: "Create personalized study schedules based on your goals, available time, and learning pace. Never miss a deadline again.",
    benefits: ["Adaptive scheduling", "Progress tracking", "Exam countdown reminders"],
  },
  {
    icon: Zap,
    title: "Instant Responses",
    description: "Get answers in seconds, not minutes. Our AI processes your questions instantly so you can keep your study momentum going.",
    benefits: ["Sub-second response times", "24/7 availability", "No waiting in queues"],
  },
  {
    icon: Target,
    title: "Focused Learning Paths",
    description: "Stay on track with structured learning paths tailored to your subjects and goals. Never wonder what to study next.",
    benefits: ["Subject-specific paths", "Milestone tracking", "Achievement badges"],
  },
];

const Features = () => {
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
              FEATURES
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Powerful AI Tools for{" "}
              <span className="gradient-text">Smarter Learning</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground"
            >
              Discover how Study.ai transforms the way you learn with cutting-edge AI technology
              designed specifically for students.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-primary font-semibold mb-4">
                WHY STUDY.AI
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built for Students, <span className="gradient-text">By Educators</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                We understand the challenges of modern education. Study.ai combines the latest 
                in AI technology with proven learning science to help you achieve your academic goals.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: Shield, title: "Privacy First", desc: "Your data is encrypted and never shared" },
                  { icon: Clock, title: "Save Time", desc: "Study up to 3x more efficiently" },
                  { icon: Zap, title: "Always Available", desc: "24/7 access to your AI tutor" },
                  { icon: Target, title: "Goal-Oriented", desc: "Track progress toward your goals" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border border-primary/20 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold gradient-text mb-2">95%</div>
                  <p className="text-muted-foreground">of students report improved grades</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience the Future of Learning?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of students who are already studying smarter with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth?mode=signup">
                  Start Free Today
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Features;

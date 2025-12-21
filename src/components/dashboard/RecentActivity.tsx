import { motion } from "framer-motion";
import { Clock, BookOpen, FileText, Brain } from "lucide-react";

const activities = [
  { icon: Brain, title: "Quantum Physics Explained", type: "Explanation", time: "2 hours ago" },
  { icon: BookOpen, title: "Biology Quiz: Cell Division", type: "Quiz", time: "Yesterday" },
  { icon: FileText, title: "History Notes Summary", type: "Summary", time: "2 days ago" },
];

const RecentActivity = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
      </div>
      <div className="grid gap-3">
        {activities.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            whileHover={{ x: 4 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <activity.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.type}</p>
            </div>
            <span className="text-xs text-muted-foreground">{activity.time}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentActivity;

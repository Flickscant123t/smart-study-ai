import { Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UsageCounterProps {
  isPremium: boolean;
  dailyUses: number;
  maxUses?: number;
}

const UsageCounter = ({ isPremium, dailyUses, maxUses = 15 }: UsageCounterProps) => {
  const navigate = useNavigate();
  const remaining = Math.max(0, maxUses - dailyUses);
  const percentage = (dailyUses / maxUses) * 100;

  if (isPremium) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
        <Crown className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">Unlimited Access</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {remaining}/{maxUses} uses left today
          </span>
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                remaining <= 3 ? 'bg-destructive' : remaining <= 7 ? 'bg-yellow-500' : 'bg-primary'
              }`}
              style={{ width: `${100 - percentage}%` }}
            />
          </div>
        </div>
      </div>
      {remaining <= 5 && (
        <Button 
          size="sm" 
          variant="premium"
          onClick={() => navigate("/pricing")}
          className="text-xs"
        >
          <Crown className="w-3 h-3 mr-1" />
          Upgrade
        </Button>
      )}
    </div>
  );
};

export default UsageCounter;

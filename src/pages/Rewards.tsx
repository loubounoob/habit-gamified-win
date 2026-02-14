import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Check, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const rewards = [
  { id: 1, name: "T-Shirt Sport", brand: "Nike", minValue: 30, emoji: "👕" },
  { id: 2, name: "Shaker Premium", brand: "BlenderBottle", minValue: 50, emoji: "🥤" },
  { id: 3, name: "Brassière / Débardeur", brand: "Under Armour", minValue: 80, emoji: "🏋️" },
  { id: 4, name: "Chaussures de Training", brand: "Adidas", minValue: 120, emoji: "👟" },
  { id: 5, name: "Tenue Complète", brand: "Nike", minValue: 200, emoji: "🔥" },
  { id: 6, name: "Pack Premium", brand: "Multi-marques", minValue: 350, emoji: "🏆" },
];

const Rewards = () => {
  const { user } = useAuth();
  const [currentRewardValue, setCurrentRewardValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewardValue = async () => {
      if (!user) return;

      const { data: challenge } = await supabase
        .from("challenges")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (challenge) {
        setCurrentRewardValue(Math.round(challenge.bet_amount * Number(challenge.odds_multiplier)));
      }
      setLoading(false);
    };

    fetchRewardValue();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 pt-10 pb-24">
      <h1 className="text-3xl font-display text-foreground mb-1">RÉCOMPENSES</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Valeur actuelle de ta récompense : <span className="text-primary font-bold">{currentRewardValue}€</span>
      </p>

      <div className="bg-glass rounded-xl p-5 mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>0€</span>
          <span>350€+</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((currentRewardValue / 350) * 100, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full gradient-primary rounded-full glow-box"
          />
          {rewards.map((r) => (
            <div key={r.id} className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-background/50" style={{ left: `${(r.minValue / 350) * 100}%` }} />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {rewards.map((reward, i) => {
          const unlocked = currentRewardValue >= reward.minValue;
          const isNext = !unlocked && (i === 0 || currentRewardValue >= rewards[i - 1].minValue);
          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-glass rounded-xl p-4 flex items-center gap-4 ${
                unlocked ? "border border-primary/30" : isNext ? "border border-odds/30" : ""
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                unlocked ? "gradient-primary glow-box" : "bg-secondary"
              }`}>
                {unlocked ? reward.emoji : <Lock className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{reward.name}</span>
                  {unlocked && <Check className="w-4 h-4 text-primary" />}
                </div>
                <span className="text-xs text-muted-foreground">{reward.brand}</span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-display ${unlocked ? "text-primary" : isNext ? "text-odds" : "text-muted-foreground"}`}>
                  {reward.minValue}€+
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default Rewards;

import { motion } from "framer-motion";
import { Gift, Lock, Check, Star } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const rewards = [
  {
    id: 1,
    name: "T-Shirt Sport",
    brand: "Nike",
    minValue: 30,
    unlocked: true,
    emoji: "👕",
  },
  {
    id: 2,
    name: "Shaker Premium",
    brand: "BlenderBottle",
    minValue: 50,
    unlocked: true,
    emoji: "🥤",
  },
  {
    id: 3,
    name: "Brassière / Débardeur",
    brand: "Under Armour",
    minValue: 80,
    unlocked: false,
    emoji: "🏋️",
  },
  {
    id: 4,
    name: "Chaussures de Training",
    brand: "Adidas",
    minValue: 120,
    unlocked: false,
    emoji: "👟",
  },
  {
    id: 5,
    name: "Tenue Complète",
    brand: "Nike",
    minValue: 200,
    unlocked: false,
    emoji: "🔥",
  },
  {
    id: 6,
    name: "Pack Premium",
    brand: "Multi-marques",
    minValue: 350,
    unlocked: false,
    emoji: "🏆",
  },
];

const Rewards = () => {
  const currentRewardValue = 135;

  return (
    <div className="min-h-screen bg-background px-6 pt-10 pb-24">
      <h1 className="text-3xl font-display text-foreground mb-1">RÉCOMPENSES</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Valeur actuelle de ta récompense : <span className="text-primary font-bold">{currentRewardValue}€</span>
      </p>

      {/* Progress bar showing reward tiers */}
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
          {/* Tier markers */}
          {rewards.map((r) => (
            <div
              key={r.id}
              className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-background/50"
              style={{ left: `${(r.minValue / 350) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* Reward Cards */}
      <div className="space-y-3">
        {rewards.map((reward, i) => {
          const isNext = !reward.unlocked && (i === 0 || rewards[i - 1].unlocked);
          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-glass rounded-xl p-4 flex items-center gap-4 ${
                reward.unlocked ? "border border-primary/30" : isNext ? "border border-odds/30" : ""
              }`}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                  reward.unlocked ? "gradient-primary glow-box" : "bg-secondary"
                }`}
              >
                {reward.unlocked ? reward.emoji : <Lock className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${reward.unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                    {reward.name}
                  </span>
                  {reward.unlocked && <Check className="w-4 h-4 text-primary" />}
                </div>
                <span className="text-xs text-muted-foreground">{reward.brand}</span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-display ${
                  reward.unlocked ? "text-primary" : isNext ? "text-odds" : "text-muted-foreground"
                }`}>
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

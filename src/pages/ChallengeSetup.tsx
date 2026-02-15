import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, TrendingUp, AlertTriangle, Loader2, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { addMonths } from "date-fns";
import { calculateCoins } from "@/lib/coins";

const ChallengeSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [months, setMonths] = useState(3);
  const [bet, setBet] = useState(50);
  const [saving, setSaving] = useState(false);

  const odds = useMemo(() => {
    const sessionFactor = sessionsPerWeek <= 2 ? 1.2 : sessionsPerWeek <= 4 ? 1.8 : 2.5;
    const monthFactor = months <= 2 ? 1.1 : months <= 4 ? 1.5 : 2.0;
    return Math.round(sessionFactor * monthFactor * 10) / 10;
  }, [sessionsPerWeek, months]);

  const coinsReward = useMemo(() => calculateCoins(bet, months, sessionsPerWeek), [bet, months, sessionsPerWeek]);

  const difficultyLabel = odds < 2 ? "FACILE" : odds < 3 ? "MOYEN" : odds < 4 ? "DIFFICILE" : "EXTRÊME";
  const difficultyColor = odds < 2 ? "text-success" : odds < 3 ? "text-odds" : odds < 4 ? "text-warning" : "text-destructive";

  const handleValidate = async () => {
    if (!user) return;
    setSaving(true);

    const startDate = new Date();
    const endDate = addMonths(startDate, months);

    const { error } = await supabase.from("challenges").insert({
      user_id: user.id,
      sessions_per_week: sessionsPerWeek,
      duration_months: months,
      bet_amount: bet,
      odds_multiplier: odds,
      coins_reward: coinsReward,
      status: "active",
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    });

    if (error) {
      toast.error("Erreur lors de la création du défi");
      console.error(error);
    } else {
      toast.success("Défi créé ! 💪");
      navigate("/dashboard");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background px-6 pt-12 pb-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-display text-neon mb-1">CRÉE TON DÉFI</h1>
        <p className="text-muted-foreground text-sm mb-8">Configure ton engagement et découvre ta cote</p>

        {/* Sessions per week */}
        <div className="bg-glass rounded-xl p-5 mb-4">
          <label className="text-sm text-muted-foreground uppercase tracking-wider block mb-3">
            Séances par semaine
          </label>
          <div className="flex items-center justify-between">
            <button onClick={() => setSessionsPerWeek(Math.max(1, sessionsPerWeek - 1))} className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Minus className="w-4 h-4 text-secondary-foreground" />
            </button>
            <span className="text-5xl font-display text-foreground">{sessionsPerWeek}</span>
            <button onClick={() => setSessionsPerWeek(Math.min(7, sessionsPerWeek + 1))} className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Plus className="w-4 h-4 text-secondary-foreground" />
            </button>
          </div>
        </div>

        {/* Months */}
        <div className="bg-glass rounded-xl p-5 mb-4">
          <label className="text-sm text-muted-foreground uppercase tracking-wider block mb-3">
            Durée (mois)
          </label>
          <div className="flex items-center justify-between">
            <button onClick={() => setMonths(Math.max(1, months - 1))} className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Minus className="w-4 h-4 text-secondary-foreground" />
            </button>
            <span className="text-5xl font-display text-foreground">{months}</span>
            <button onClick={() => setMonths(Math.min(12, months + 1))} className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Plus className="w-4 h-4 text-secondary-foreground" />
            </button>
          </div>
        </div>

        {/* Bet Amount */}
        <div className="bg-glass rounded-xl p-5 mb-6">
          <label className="text-sm text-muted-foreground uppercase tracking-wider block mb-3">
            Mise mensuelle (€)
          </label>
          <div className="flex items-center justify-between">
            <button onClick={() => setBet(Math.max(10, bet - 10))} className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Minus className="w-4 h-4 text-secondary-foreground" />
            </button>
            <span className="text-5xl font-display text-foreground">{bet}€</span>
            <button onClick={() => setBet(Math.min(500, bet + 10))} className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Plus className="w-4 h-4 text-secondary-foreground" />
            </button>
          </div>
        </div>

        {/* Coins Card */}
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-glass rounded-xl p-5 mb-4 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-odds" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Pièces à gagner</span>
            </div>
            <span className={`text-sm font-bold uppercase ${difficultyColor}`}>{difficultyLabel}</span>
          </div>
          <div className="text-center">
            <span className="text-6xl font-display text-odds">{coinsReward}</span>
            <span className="text-2xl font-display text-odds ml-1">🪙</span>
          </div>
        </motion.div>

        {/* Summary */}
        <div className="bg-glass rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground text-sm">Mise totale</span>
            <span className="text-foreground font-bold">{bet * months}€</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground text-sm">Total séances</span>
            <span className="text-foreground font-bold">{sessionsPerWeek * 4 * months}</span>
          </div>
          <div className="h-px bg-border my-3" />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">🪙 Pièces gagnées</span>
            <span className="text-primary font-bold text-lg">{coinsReward} 🪙</span>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 mb-6 px-1">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Si tu échoues, tu perds l'intégralité de ta mise. Choisis un défi réaliste mais ambitieux !
          </p>
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleValidate}
          disabled={saving}
          className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg glow-box-strong flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "VALIDER MON DÉFI"}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ChallengeSetup;

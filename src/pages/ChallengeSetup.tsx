import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, TrendingUp, AlertTriangle } from "lucide-react";

const ChallengeSetup = () => {
  const navigate = useNavigate();
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [months, setMonths] = useState(3);
  const [bet, setBet] = useState(50);

  const odds = useMemo(() => {
    const sessionFactor = sessionsPerWeek <= 2 ? 1.2 : sessionsPerWeek <= 4 ? 1.8 : 2.5;
    const monthFactor = months <= 2 ? 1.1 : months <= 4 ? 1.5 : 2.0;
    return Math.round(sessionFactor * monthFactor * 10) / 10;
  }, [sessionsPerWeek, months]);

  const rewardValue = useMemo(() => Math.round(bet * odds), [bet, odds]);

  const difficultyLabel = odds < 2 ? "FACILE" : odds < 3 ? "MOYEN" : odds < 4 ? "DIFFICILE" : "EXTRÊME";
  const difficultyColor = odds < 2 ? "text-success" : odds < 3 ? "text-odds" : odds < 4 ? "text-warning" : "text-destructive";

  return (
    <div className="min-h-screen bg-background px-6 pt-12 pb-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <h1 className="text-4xl font-display text-neon mb-1">CRÉE TON DÉFI</h1>
        <p className="text-muted-foreground text-sm mb-8">Configure ton engagement et découvre ta cote</p>

        {/* Sessions per week */}
        <div className="bg-glass rounded-xl p-5 mb-4">
          <label className="text-sm text-muted-foreground uppercase tracking-wider block mb-3">
            Séances par semaine
          </label>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSessionsPerWeek(Math.max(1, sessionsPerWeek - 1))}
              className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"
            >
              <Minus className="w-4 h-4 text-secondary-foreground" />
            </button>
            <span className="text-5xl font-display text-foreground">{sessionsPerWeek}</span>
            <button
              onClick={() => setSessionsPerWeek(Math.min(7, sessionsPerWeek + 1))}
              className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"
            >
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
            <button
              onClick={() => setMonths(Math.max(1, months - 1))}
              className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"
            >
              <Minus className="w-4 h-4 text-secondary-foreground" />
            </button>
            <span className="text-5xl font-display text-foreground">{months}</span>
            <button
              onClick={() => setMonths(Math.min(12, months + 1))}
              className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"
            >
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
            <button
              onClick={() => setBet(Math.max(10, bet - 10))}
              className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"
            >
              <Minus className="w-4 h-4 text-secondary-foreground" />
            </button>
            <span className="text-5xl font-display text-foreground">{bet}€</span>
            <button
              onClick={() => setBet(Math.min(500, bet + 10))}
              className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-secondary-foreground" />
            </button>
          </div>
        </div>

        {/* Odds Card */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-glass rounded-xl p-5 mb-4 border border-primary/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-odds" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Ta cote</span>
            </div>
            <span className={`text-sm font-bold uppercase ${difficultyColor}`}>
              {difficultyLabel}
            </span>
          </div>
          <div className="text-center">
            <span className="text-6xl font-display text-odds">{odds}x</span>
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
            <span className="text-muted-foreground text-sm">🎁 Valeur récompense</span>
            <span className="text-primary font-bold text-lg">{rewardValue}€</span>
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
          onClick={() => navigate("/dashboard")}
          className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg glow-box-strong"
        >
          VALIDER MON DÉFI
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ChallengeSetup;

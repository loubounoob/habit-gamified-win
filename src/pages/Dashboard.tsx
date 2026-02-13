import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, CheckCircle2, XCircle, Flame, Trophy, CalendarDays, TrendingUp } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const mockWeek = [
  { day: "Lun", done: true },
  { day: "Mar", done: true },
  { day: "Mer", done: false },
  { day: "Jeu", done: true },
  { day: "Ven", done: false, today: true },
  { day: "Sam", done: false },
  { day: "Dim", done: false },
];

const Dashboard = () => {
  const [showPhotoSuccess, setShowPhotoSuccess] = useState(false);

  const totalSessions = 48;
  const completedSessions = 18;
  const progress = (completedSessions / totalSessions) * 100;
  const streak = 5;
  const odds = 2.7;
  const bet = 50;
  const months = 3;

  return (
    <div className="min-h-screen bg-background px-6 pt-10 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-muted-foreground text-sm">Ton défi en cours</p>
          <h1 className="text-3xl font-display text-foreground">DASHBOARD</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-glass px-3 py-1.5 rounded-full">
          <Flame className="w-4 h-4 text-odds" />
          <span className="text-sm font-bold text-odds">{streak}j</span>
        </div>
      </div>

      {/* Progress Ring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-glass rounded-2xl p-6 mb-4 text-center"
      >
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="8"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
              style={{ filter: "drop-shadow(0 0 8px hsl(110 100% 55% / 0.5))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-display text-foreground">{Math.round(progress)}%</span>
            <span className="text-xs text-muted-foreground">COMPLÉTÉ</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-bold">{completedSessions}</span> / {totalSessions} séances validées
        </p>
      </motion.div>

      {/* Week View */}
      <div className="bg-glass rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground uppercase tracking-wider">Cette semaine</span>
        </div>
        <div className="flex justify-between">
          {mockWeek.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-2">
              <span className={`text-xs ${d.today ? "text-primary font-bold" : "text-muted-foreground"}`}>
                {d.day}
              </span>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  d.done
                    ? "gradient-primary glow-box"
                    : d.today
                    ? "border-2 border-primary"
                    : "bg-secondary"
                }`}
              >
                {d.done ? (
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                ) : d.today ? (
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse-neon" />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-odds" />
            <span className="text-xs text-muted-foreground">COTE</span>
          </div>
          <span className="text-3xl font-display text-odds">{odds}x</span>
        </div>
        <div className="bg-glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">RÉCOMPENSE</span>
          </div>
          <span className="text-3xl font-display text-primary">{Math.round(bet * months * odds)}€</span>
        </div>
      </div>

      {/* Take Photo CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowPhotoSuccess(true)}
        className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-3 glow-box-strong"
      >
        <Camera className="w-6 h-6" />
        VALIDER MA SÉANCE
      </motion.button>

      {/* Photo Success Modal */}
      {showPhotoSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/90 z-50 flex items-center justify-center px-6"
          onClick={() => setShowPhotoSuccess(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-glass rounded-2xl p-8 text-center max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center glow-box-strong">
              <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-display text-foreground mb-2">SÉANCE VALIDÉE !</h2>
            <p className="text-muted-foreground mb-6">
              L'IA a confirmé ta présence à la salle. Continue comme ça ! 💪
            </p>
            <button
              onClick={() => setShowPhotoSuccess(false)}
              className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-bold"
            >
              FERMER
            </button>
          </motion.div>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
};

export default Dashboard;

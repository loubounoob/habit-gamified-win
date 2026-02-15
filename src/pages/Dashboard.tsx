import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Camera, CheckCircle2, Flame, Trophy, CalendarDays, Coins, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PhotoVerification from "@/components/PhotoVerification";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday } from "date-fns";
import { fr } from "date-fns/locale";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showVerification, setShowVerification] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: challengeData } = await supabase
      .from("challenges")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setChallenge(challengeData);

    if (challengeData) {
      const { data: sessionsData } = await supabase
        .from("gym_sessions")
        .select("*")
        .eq("challenge_id", challengeData.id)
        .eq("approved", true);

      setSessions(sessionsData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const weekDays = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end }).map((day) => ({
      label: format(day, "EEE", { locale: fr }).slice(0, 3),
      date: day,
      today: isToday(day),
      done: sessions.some((s) => isSameDay(new Date(s.verified_at), day)),
    }));
  }, [sessions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background px-6 pt-10 pb-24 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-display text-foreground mb-4">AUCUN DÉFI ACTIF</h1>
        <p className="text-muted-foreground mb-6">Crée ton premier défi pour commencer</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/challenge")}
          className="py-4 px-8 rounded-xl gradient-primary text-primary-foreground font-bold text-lg glow-box-strong"
        >
          CRÉER UN DÉFI
        </motion.button>
        <BottomNav />
      </div>
    );
  }

  const totalSessions = challenge.sessions_per_week * 4 * challenge.duration_months;
  const completedSessions = sessions.length;
  const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const odds = Number(challenge.odds_multiplier);
  const bet = challenge.bet_amount;
  const months = challenge.duration_months;

  // Calculate streak
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.verified_at).getTime() - new Date(a.verified_at).getTime());
  let streak = 0;
  if (sortedSessions.length > 0) {
    let checkDate = new Date();
    for (const s of sortedSessions) {
      const sessionDate = new Date(s.verified_at);
      const diffDays = Math.floor((checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        streak++;
        checkDate = sessionDate;
      } else break;
    }
  }

  const handleVerified = async () => {
    setShowVerification(false);
    await fetchData();
  };

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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-glass rounded-2xl p-6 mb-4 text-center">
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
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
          {weekDays.map((d) => (
            <div key={d.label} className="flex flex-col items-center gap-2">
              <span className={`text-xs ${d.today ? "text-primary font-bold" : "text-muted-foreground"}`}>{d.label}</span>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                d.done ? "gradient-primary glow-box" : d.today ? "border-2 border-primary" : "bg-secondary"
              }`}>
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
            <Trophy className="w-4 h-4 text-odds" />
            <span className="text-xs text-muted-foreground">MISE TOTALE</span>
          </div>
          <span className="text-3xl font-display text-odds">{bet * months}€</span>
        </div>
        <div className="bg-glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">PIÈCES</span>
          </div>
          <span className="text-3xl font-display text-primary">{challenge.coins_reward} 🪙</span>
        </div>
      </div>

      {/* Take Photo CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowVerification(true)}
        className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-3 glow-box-strong"
      >
        <Camera className="w-6 h-6" />
        VALIDER MA SÉANCE
      </motion.button>

      <PhotoVerification
        open={showVerification}
        onClose={() => setShowVerification(false)}
        onVerified={handleVerified}
        challengeId={challenge.id}
      />

      <BottomNav />
    </div>
  );
};

export default Dashboard;

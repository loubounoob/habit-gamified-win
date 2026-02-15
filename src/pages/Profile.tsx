import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, MapPin, CreditCard, LogOut, ChevronRight, Shield, Loader2, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const menuItems = [
  { icon: User, label: "Mon profil", desc: "Infos personnelles" },
  { icon: MapPin, label: "Ma salle de sport", desc: "Géolocalisation & adresse" },
  { icon: Bell, label: "Notifications", desc: "Rappels & alertes" },
  { icon: CreditCard, label: "Paiements", desc: "Historique & moyens de paiement" },
  { icon: Shield, label: "Confidentialité", desc: "Données & sécurité" },
];

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ challenges: 0, won: 0, sessions: 0, totalCoins: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const [{ data: profileData }, { data: challengesData }, { data: sessionsData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("challenges").select("*").eq("user_id", user.id),
        supabase.from("gym_sessions").select("*").eq("user_id", user.id).eq("approved", true),
      ]);

      setProfile(profileData);
      const challenges = challengesData || [];
      const won = challenges.filter((c: any) => c.status === "completed").length;
      const totalCoins = challenges.reduce((sum: number, c: any) => sum + (c.coins_reward || 0), 0);
      setStats({
        challenges: challenges.length,
        won,
        sessions: sessionsData?.length || 0,
        totalCoins,
      });
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "??";

  const memberSince = user?.created_at
    ? format(new Date(user.created_at), "MMM yyyy", { locale: fr })
    : "";

  return (
    <div className="min-h-screen bg-background px-6 pt-10 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-glass rounded-2xl p-6 mb-6 flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center glow-box">
          <span className="text-2xl font-display text-primary-foreground">{initials}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{profile?.username || user?.email}</h2>
          <p className="text-sm text-muted-foreground">Membre depuis {memberSince}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-glass rounded-xl p-3 text-center">
          <span className="text-2xl font-display text-primary">{stats.challenges}</span>
          <p className="text-xs text-muted-foreground mt-1">Défis</p>
        </div>
        <div className="bg-glass rounded-xl p-3 text-center">
          <span className="text-2xl font-display text-odds">{stats.won}</span>
          <p className="text-xs text-muted-foreground mt-1">Gagnés</p>
        </div>
        <div className="bg-glass rounded-xl p-3 text-center">
          <span className="text-2xl font-display text-foreground">{stats.sessions}</span>
          <p className="text-xs text-muted-foreground mt-1">Séances</p>
        </div>
        <div className="bg-glass rounded-xl p-3 text-center">
          <span className="text-2xl font-display text-primary">{stats.totalCoins}</span>
          <p className="text-xs text-muted-foreground mt-1">🪙 Pièces</p>
        </div>
      </div>

      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full bg-glass rounded-xl p-4 flex items-center gap-4 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <item.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        ))}
      </div>

      <button
        onClick={handleSignOut}
        className="w-full mt-6 py-3 rounded-xl border border-destructive/30 text-destructive text-sm font-medium flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Se déconnecter
      </button>

      <BottomNav />
    </div>
  );
};

export default Profile;

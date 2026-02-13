import { motion } from "framer-motion";
import { User, Bell, MapPin, CreditCard, LogOut, ChevronRight, Shield } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const menuItems = [
  { icon: User, label: "Mon profil", desc: "Infos personnelles" },
  { icon: MapPin, label: "Ma salle de sport", desc: "Géolocalisation & adresse" },
  { icon: Bell, label: "Notifications", desc: "Rappels & alertes" },
  { icon: CreditCard, label: "Paiements", desc: "Historique & moyens de paiement" },
  { icon: Shield, label: "Confidentialité", desc: "Données & sécurité" },
];

const Profile = () => {
  return (
    <div className="min-h-screen bg-background px-6 pt-10 pb-24">
      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-glass rounded-2xl p-6 mb-6 flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center glow-box">
          <span className="text-2xl font-display text-primary-foreground">JD</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">John Doe</h2>
          <p className="text-sm text-muted-foreground">Membre depuis Fév 2026</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-glass rounded-xl p-3 text-center">
          <span className="text-2xl font-display text-primary">2</span>
          <p className="text-xs text-muted-foreground mt-1">Défis</p>
        </div>
        <div className="bg-glass rounded-xl p-3 text-center">
          <span className="text-2xl font-display text-odds">1</span>
          <p className="text-xs text-muted-foreground mt-1">Gagné</p>
        </div>
        <div className="bg-glass rounded-xl p-3 text-center">
          <span className="text-2xl font-display text-foreground">87%</span>
          <p className="text-xs text-muted-foreground mt-1">Taux</p>
        </div>
      </div>

      {/* Menu */}
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

      {/* Logout */}
      <button className="w-full mt-6 py-3 rounded-xl border border-destructive/30 text-destructive text-sm font-medium flex items-center justify-center gap-2">
        <LogOut className="w-4 h-4" />
        Se déconnecter
      </button>

      <BottomNav />
    </div>
  );
};

export default Profile;

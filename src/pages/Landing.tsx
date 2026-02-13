import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Dumbbell, TrendingUp, Gift, Camera, ChevronRight } from "lucide-react";
import heroGym from "@/assets/hero-gym.jpg";

const slides = [
  {
    icon: Dumbbell,
    title: "MISE TA RÉSOLUTION",
    desc: "Engage-toi sur un nombre de séances par semaine et choisis ta mise. Plus c'est ambitieux, plus la cote est élevée.",
  },
  {
    icon: Camera,
    title: "PROUVE-LE",
    desc: "Prends une photo à la salle. Notre IA vérifie que tu y es vraiment. Simple, rapide, infalsifiable.",
  },
  {
    icon: TrendingUp,
    title: "TIENS TON DÉFI",
    desc: "Suis ta progression en temps réel. Notifications intelligentes quand tu es près de ta salle.",
  },
  {
    icon: Gift,
    title: "GAGNE GROS",
    desc: "Défi réussi = argent récupéré + cadeaux sport exclusifs. La cote détermine la valeur de ta récompense.",
  },
];

const Landing = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const isLast = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0">
        <img
          src={heroGym}
          alt="Gym atmosphere"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 gradient-dark opacity-80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 px-6 pt-16 pb-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-display text-neon tracking-widest">
            RESOLY
          </h1>
          <p className="text-muted-foreground text-sm mt-1 tracking-wider uppercase">
            Mise sur toi-même
          </p>
        </motion.div>

        {/* Slides */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="text-center max-w-sm"
            >
              <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center glow-box">
                {(() => {
                  const Icon = slides[currentSlide].icon;
                  return <Icon className="w-10 h-10 text-primary-foreground" />;
                })()}
              </div>
              <h2 className="text-3xl font-display text-foreground mb-4">
                {slides[currentSlide].title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {slides[currentSlide].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? "w-8 bg-primary glow-box"
                  : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (isLast) {
              navigate("/challenge");
            } else {
              setCurrentSlide((p) => p + 1);
            }
          }}
          className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 glow-box-strong"
        >
          {isLast ? "COMMENCER" : "SUIVANT"}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default Landing;

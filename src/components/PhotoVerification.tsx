import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, RotateCcw, Send, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type VerificationResult = {
  approved: boolean;
  confidence: number;
  reason: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onVerified?: (result: VerificationResult) => void;
  challengeId?: string;
};

const PhotoVerification = ({ open, onClose, onVerified, challengeId }: Props) => {
  const { user } = useAuth();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!capturedImage || !user) return;
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("verify-gym-photo", {
        body: { imageBase64: capturedImage },
      });

      if (error) {
        toast.error("Erreur lors de l'analyse");
        console.error(error);
        return;
      }

      if (!data.success) {
        toast.error(data.error || "Erreur d'analyse");
        return;
      }

      const verificationResult: VerificationResult = {
        approved: data.approved,
        confidence: data.confidence,
        reason: data.reason,
      };

      setResult(verificationResult);

      // Save session to DB
      if (challengeId) {
        await supabase.from("gym_sessions").insert({
          challenge_id: challengeId,
          user_id: user.id,
          approved: verificationResult.approved,
          confidence: verificationResult.confidence,
          reason: verificationResult.reason,
        });
      }

      if (verificationResult.approved) {
        toast.success("Séance validée ! 💪");
        onVerified?.(verificationResult);
      } else {
        toast.error("Photo non validée");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de connexion");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    setCapturedImage(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/95 z-50 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-2xl font-display text-foreground">VÉRIFICATION</h2>
          <button onClick={handleClose} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {!capturedImage ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <div className="w-64 h-64 rounded-2xl bg-glass border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center mb-6 mx-auto">
                <Camera className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Prends une photo à la salle</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              <button onClick={handleCapture} className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-3 glow-box-strong">
                <Camera className="w-6 h-6" />
                PRENDRE UNE PHOTO
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm">
              <div className="relative rounded-2xl overflow-hidden mb-6">
                <img src={capturedImage} alt="Photo prise" className="w-full aspect-[3/4] object-cover" />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
                    <p className="text-foreground font-medium">Analyse IA en cours...</p>
                    <p className="text-sm text-muted-foreground">Vérification de ta présence</p>
                  </div>
                )}
              </div>

              {result && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`bg-glass rounded-xl p-5 mb-6 border ${result.approved ? "border-primary/40" : "border-destructive/40"}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {result.approved ? <CheckCircle2 className="w-8 h-8 text-primary" /> : <XCircle className="w-8 h-8 text-destructive" />}
                    <div>
                      <p className={`font-bold text-lg ${result.approved ? "text-primary" : "text-destructive"}`}>
                        {result.approved ? "VALIDÉ !" : "NON VALIDÉ"}
                      </p>
                      <p className="text-xs text-muted-foreground">Confiance : {result.confidence}%</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.reason}</p>
                </motion.div>
              )}

              {!isAnalyzing && (
                <div className="flex gap-3">
                  <button onClick={handleRetake} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    REPRENDRE
                  </button>
                  {!result && (
                    <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 glow-box">
                      <Send className="w-4 h-4" />
                      ANALYSER
                    </button>
                  )}
                  {result && (
                    <button onClick={handleClose} className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 glow-box">
                      FERMER
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      </motion.div>
    </AnimatePresence>
  );
};

export default PhotoVerification;

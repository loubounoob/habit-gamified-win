import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Check, Loader2, ShoppingBag } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { CartDrawer } from "@/components/CartDrawer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

const rewardTiers = [
  { minValue: 50, tag: "50coins", emoji: "👕" },
  { minValue: 100, tag: "100coins", emoji: "🥤" },
  { minValue: 200, tag: "200coins", emoji: "🏋️" },
  { minValue: 400, tag: "400coins", emoji: "👟" },
  { minValue: 800, tag: "800coins", emoji: "🔥" },
  { minValue: 1500, tag: "1500coins", emoji: "🏆" },
];

const Rewards = () => {
  const { user } = useAuth();
  const [currentRewardValue, setCurrentRewardValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

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
        setCurrentRewardValue(challenge.coins_reward || 0);
      }
      setLoading(false);
    };

    const fetchProducts = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, {
          first: 20,
          query: "tag:reward",
        });
        if (data?.data?.products?.edges) {
          setProducts(data.data.products.edges);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
      setProductsLoading(false);
    };

    fetchRewardValue();
    fetchProducts();
  }, [user]);

  const getProductForTier = (tag: string): ShopifyProduct | undefined => {
    return products.find(p => {
      const desc = p.node.description?.toLowerCase() || '';
      return desc.includes(tag.replace('coins', ' coins'));
    });
  };

  const handleClaim = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;

    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Ajouté au panier !", { description: product.node.title });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 pt-10 pb-24">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-display text-foreground">RÉCOMPENSES</h1>
        <CartDrawer />
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Pièces actuelles : <span className="text-primary font-bold">{currentRewardValue} 🪙</span>
      </p>

      {/* Progress bar */}
      <div className="bg-glass rounded-xl p-5 mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>0 🪙</span>
          <span>1500+ 🪙</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((currentRewardValue / 1500) * 100, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full gradient-primary rounded-full glow-box"
          />
          {rewardTiers.map((r) => (
            <div key={r.tag} className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-background/50" style={{ left: `${(r.minValue / 1500) * 100}%` }} />
          ))}
        </div>
      </div>

      {/* Reward cards with Shopify products */}
      <div className="space-y-3">
        {rewardTiers.map((tier, i) => {
          const unlocked = currentRewardValue >= tier.minValue;
          const isNext = !unlocked && (i === 0 || currentRewardValue >= rewardTiers[i - 1].minValue);
          const product = getProductForTier(tier.tag);

          return (
            <motion.div
              key={tier.tag}
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
                {product?.node.images?.edges?.[0]?.node ? (
                  <img
                    src={product.node.images.edges[0].node.url}
                    alt={product.node.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : unlocked ? tier.emoji : <Lock className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                    {product?.node.title || `Récompense ${tier.minValue} 🪙`}
                  </span>
                  {unlocked && <Check className="w-4 h-4 text-primary" />}
                </div>
                <span className="text-xs text-muted-foreground">
                  {product ? product.node.description?.slice(0, 60) + '...' : ''}
                </span>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className={`text-sm font-display ${unlocked ? "text-primary" : isNext ? "text-odds" : "text-muted-foreground"}`}>
                  {tier.minValue} 🪙
                </span>
                {unlocked && product && (
                  <button
                    onClick={() => handleClaim(product)}
                    disabled={isCartLoading || productsLoading}
                    className="text-xs gradient-primary text-primary-foreground px-3 py-1 rounded-lg font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    Réclamer
                  </button>
                )}
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

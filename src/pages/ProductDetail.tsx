import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/CartDrawer";
import { storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

const PRODUCT_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      handle
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      images(first: 5) {
        edges { node { url altText } }
      }
      variants(first: 20) {
        edges {
          node {
            id title
            price { amount currencyCode }
            availableForSale
            selectedOptions { name value }
          }
        }
      }
      options { name values }
    }
  }
`;

const ProductDetail = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await storefrontApiRequest(PRODUCT_QUERY, { handle });
        if (data?.data?.productByHandle) {
          setProduct({ node: data.data.productByHandle });
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Produit introuvable
      </div>
    );
  }

  const variant = product.node.variants.edges[selectedVariantIdx]?.node;
  const image = product.node.images?.edges?.[0]?.node;

  const handleAddToCart = async () => {
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

  return (
    <div className="min-h-screen bg-background px-6 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <CartDrawer />
      </div>

      {image && (
        <div className="w-full aspect-square bg-secondary rounded-2xl overflow-hidden mb-6">
          <img src={image.url} alt={image.altText || product.node.title} className="w-full h-full object-cover" />
        </div>
      )}

      <h1 className="text-2xl font-display text-foreground mb-2">{product.node.title}</h1>
      <p className="text-muted-foreground text-sm mb-6">{product.node.description}</p>

      {/* Variant selector */}
      {product.node.options.length > 0 && product.node.options[0].name !== 'Title' && (
        <div className="mb-6">
          <p className="text-sm font-medium text-foreground mb-2">{product.node.options[0].name}</p>
          <div className="flex flex-wrap gap-2">
            {product.node.variants.edges.map((v, idx) => (
              <button
                key={v.node.id}
                onClick={() => setSelectedVariantIdx(idx)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  idx === selectedVariantIdx
                    ? "gradient-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {v.node.selectedOptions?.map(o => o.value).join(' / ')}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={handleAddToCart}
        disabled={isCartLoading}
        className="w-full gradient-primary text-primary-foreground"
        size="lg"
      >
        {isCartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShoppingBag className="w-4 h-4 mr-2" />Ajouter au panier</>}
      </Button>
    </div>
  );
};

export default ProductDetail;

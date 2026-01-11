import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API, useCart, useAuth } from "../App";
import {
  Star,
  ShoppingCart,
  Zap,
  Clock,
  Shield,
  CheckCircle,
  ChevronDown,
  ArrowLeft,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API}/products/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        navigate("/services");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    await addToCart(product.product_id, quantity);
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    const success = await addToCart(product.product_id, quantity);
    setAddingToCart(false);
    
    if (success) {
      navigate("/cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <p className="text-white/50">Product not found</p>
      </div>
    );
  }

  // Mock reviews for UI
  const mockReviews = [
    { name: "Alex M.", rating: 5, comment: "Excellent service! Delivered within minutes.", date: "2 days ago" },
    { name: "Sarah K.", rating: 5, comment: "Very reliable, will buy again!", date: "1 week ago" },
    { name: "James R.", rating: 4, comment: "Good quality, fast support.", date: "2 weeks ago" },
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            data-testid="back-to-services"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden glass-card">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              {product.in_stock && (
                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  In Stock
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-white/20"
                    }`}
                  />
                ))}
              </div>
              <span className="text-white/70">{product.rating}</span>
              <span className="text-white/40">({product.reviews_count} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-[#00f3ff]" />
              <span className="font-orbitron text-4xl font-bold text-[#00f3ff]">
                ${product.price.toFixed(2)}
              </span>
            </div>

            {/* Description */}
            <p className="text-white/60 mb-8 leading-relaxed">{product.description}</p>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="font-orbitron font-bold text-white mb-4">FEATURES</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-white/70">
                      <CheckCircle className="w-5 h-5 text-[#00f3ff]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Delivery Info */}
            <div className="glass-card rounded-xl p-4 mb-8">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#bc13fe]" />
                <div>
                  <p className="text-white font-medium">Delivery Time</p>
                  <p className="text-white/50 text-sm">{product.delivery_info}</p>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Quantity Selector */}
              <div className="flex items-center gap-3 glass rounded-xl px-4 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  data-testid="decrease-quantity"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-orbitron font-bold text-white w-8 text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  data-testid="increase-quantity"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 h-12 gradient-btn rounded-xl text-black font-bold"
                data-testid="add-to-cart"
              >
                {addingToCart ? (
                  <div className="spinner w-5 h-5 border-black"></div>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>

              {/* Buy Now */}
              <Button
                onClick={handleBuyNow}
                disabled={addingToCart}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-[#bc13fe] text-[#bc13fe] hover:bg-[#bc13fe]/10"
                data-testid="buy-now"
              >
                Buy Now
              </Button>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-3 text-white/50 text-sm">
              <Shield className="w-5 h-5 text-green-400" />
              <span>Secure checkout with 256-bit SSL encryption</span>
            </div>
          </motion.div>
        </div>

        {/* FAQs */}
        {product.faqs && product.faqs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-20"
          >
            <h2 className="font-orbitron text-2xl font-bold text-white mb-8">
              FREQUENTLY ASKED <span className="text-[#00f3ff]">QUESTIONS</span>
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {product.faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="glass-card rounded-xl border-none px-6"
                >
                  <AccordionTrigger className="text-white hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/60 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        )}

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <h2 className="font-orbitron text-2xl font-bold text-white mb-8">
            CUSTOMER <span className="text-[#bc13fe]">REVIEWS</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {mockReviews.map((review, index) => (
              <div key={index} className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00f3ff] to-[#bc13fe] flex items-center justify-center font-bold text-black">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{review.name}</p>
                    <p className="text-white/40 text-sm">{review.date}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-white/20"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-white/60 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;

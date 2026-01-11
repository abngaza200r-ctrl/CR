import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { useCart, useAuth } from "../App";
import { useNavigate } from "react-router-dom";

const categoryColors = {
  social_media: "from-pink-500 to-purple-500",
  digital_accounts: "from-orange-500 to-red-500",
  gaming: "from-cyan-500 to-green-500",
  digital_currency: "from-blue-500 to-indigo-500",
};

const categoryLabels = {
  social_media: "Social Media",
  digital_accounts: "Accounts",
  gaming: "Gaming",
  digital_currency: "Currency",
};

const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate("/login");
      return;
    }
    
    await addToCart(product.product_id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="product-card"
    >
      <Link to={`/product/${product.product_id}`} data-testid={`product-card-${product.product_id}`}>
        <div className="glass-card rounded-2xl overflow-hidden group">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Category Badge */}
            <div
              className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${
                categoryColors[product.category] || "from-gray-500 to-gray-600"
              }`}
            >
              {categoryLabels[product.category] || product.category}
            </div>

            {/* Quick Add Button */}
            <Button
              onClick={handleAddToCart}
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full gradient-btn p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              data-testid={`quick-add-${product.product_id}`}
            >
              <ShoppingCart className="w-4 h-4 text-black" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-orbitron font-bold text-white text-lg mb-2 tracking-wide line-clamp-1">
              {product.name}
            </h3>
            <p className="text-white/50 text-sm mb-4 line-clamp-2">
              {product.short_description}
            </p>

            <div className="flex items-center justify-between">
              {/* Rating */}
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white/70 text-sm">{product.rating}</span>
                <span className="text-white/40 text-xs">
                  ({product.reviews_count})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-[#00f3ff]" />
                <span className="font-orbitron font-bold text-[#00f3ff] text-lg">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;

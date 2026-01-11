import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "../App";
import ProductCard from "../components/ProductCard";
import { Search, Filter, TrendingUp, Users, Gamepad2, CreditCard, LayoutGrid } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const categories = [
  { slug: "all", name: "الكل", icon: LayoutGrid },
  { slug: "instagram", name: "انستقرام", icon: TrendingUp },
  { slug: "tiktok", name: "تيك توك", icon: TrendingUp },
  { slug: "youtube", name: "يوتيوب", icon: TrendingUp },
  { slug: "twitter", name: "تويتر X", icon: TrendingUp },
  { slug: "facebook", name: "فيسبوك", icon: Users },
  { slug: "snapchat", name: "سناب شات", icon: Users },
  { slug: "telegram", name: "تيليجرام", icon: Users },
  { slug: "subscriptions", name: "اشتراكات", icon: CreditCard },
  { slug: "gaming", name: "ألعاب", icon: Gamepad2 },
  { slug: "giftcards", name: "بطاقات", icon: CreditCard },
];

const ServicesPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(category || "all");
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        await axios.post(`${API}/seed`);
        const response = await axios.get(`${API}/products`);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (category) {
      setActiveCategory(category);
    }
  }, [category]);

  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (activeCategory && activeCategory !== "all") {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        filtered.sort((a, b) => b.reviews_count - a.reviews_count);
    }

    setFilteredProducts(filtered);
  }, [products, activeCategory, searchQuery, sortBy]);

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-4">
            جميع <span className="gradient-text">الخدمات</span>
          </h1>
          <p className="text-white/50 max-w-2xl">
            تصفح مجموعتنا من خدمات السوشيال ميديا والاشتراكات والألعاب.
            جميع المنتجات مع توصيل فوري ودعم 24/7.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-6 mb-10"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl text-white"
              data-testid="search-input"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-white/40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white cursor-pointer"
              data-testid="sort-select"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-10"
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={cat.slug === "all" ? "/services" : `/services/${cat.slug}`}
              onClick={() => setActiveCategory(cat.slug)}
              data-testid={`filter-${cat.slug}`}
            >
              <Button
                variant={activeCategory === cat.slug ? "default" : "outline"}
                className={`rounded-full ${
                  activeCategory === cat.slug
                    ? "gradient-btn text-black"
                    : "border-white/20 text-white hover:bg-white/10"
                }`}
              >
                <cat.icon className="w-4 h-4 mr-2" />
                {cat.name}
              </Button>
            </Link>
          ))}
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner w-12 h-12"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-white/50 text-lg">No products found</p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="mt-4 gradient-btn rounded-full text-black"
            >
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.product_id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/40 text-center mt-10"
          >
            Showing {filteredProducts.length} of {products.length} services
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;

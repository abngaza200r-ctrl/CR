import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "../App";
import ProductCard from "../components/ProductCard";
import {
  Zap,
  Shield,
  Clock,
  Headphones,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Gamepad2,
  CreditCard,
} from "lucide-react";
import { Button } from "../components/ui/button";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // First seed data, then fetch products
        await axios.post(`${API}/seed`);
        const response = await axios.get(`${API}/products`);
        setFeaturedProducts(response.data.slice(0, 6));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Instant Delivery",
      description: "Get your digital products within minutes after purchase",
      color: "#00f3ff",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "256-bit SSL encryption for all transactions",
      color: "#bc13fe",
    },
    {
      icon: Clock,
      title: "24/7 Service",
      description: "Round-the-clock availability for your convenience",
      color: "#ff0055",
    },
    {
      icon: Headphones,
      title: "Expert Support",
      description: "Dedicated team ready to assist you anytime",
      color: "#00f3ff",
    },
  ];

  const categories = [
    {
      icon: TrendingUp,
      name: "Social Media",
      slug: "social_media",
      description: "Boost your online presence",
      gradient: "from-pink-500 to-purple-500",
    },
    {
      icon: Users,
      name: "Digital Accounts",
      slug: "digital_accounts",
      description: "Premium streaming & software",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Gamepad2,
      name: "Gaming Credits",
      slug: "gaming",
      description: "Level up your gaming experience",
      gradient: "from-cyan-500 to-green-500",
    },
    {
      icon: CreditCard,
      name: "Digital Currency",
      slug: "digital_currency",
      description: "Gift cards & virtual funds",
      gradient: "from-blue-500 to-indigo-500",
    },
  ];

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1758404196311-70c62a445e9c?auto=format&fit=crop&q=80&w=2000"
            alt="Cyberpunk City"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030014]/50 via-[#030014]/80 to-[#030014]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030014] via-transparent to-[#030014]/50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <Sparkles className="w-4 h-4 text-[#00f3ff]" />
                <span className="text-sm text-white/80">Premium Digital Services</span>
              </div>

              <h1 className="font-orbitron text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                <span className="text-white">YOUR ONE-STOP</span>
                <br />
                <span className="gradient-text">DIGITAL SERVICES</span>
                <br />
                <span className="text-white">STORE</span>
              </h1>

              <p className="text-lg text-white/60 mb-8 max-w-lg">
                Fast, secure, and reliable digital services at your fingertips. 
                From social media growth to gaming credits, we've got you covered.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/services" data-testid="hero-browse-btn">
                  <Button className="gradient-btn rounded-full px-8 py-6 text-black font-bold text-lg group">
                    Browse Services
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/register" data-testid="hero-getstarted-btn">
                  <Button
                    variant="outline"
                    className="rounded-full px-8 py-6 border-white/20 text-white hover:bg-white/10 font-bold text-lg"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-12">
                <div>
                  <p className="font-orbitron text-3xl font-bold text-[#00f3ff]">50K+</p>
                  <p className="text-white/50 text-sm">Happy Customers</p>
                </div>
                <div>
                  <p className="font-orbitron text-3xl font-bold text-[#bc13fe]">99.9%</p>
                  <p className="text-white/50 text-sm">Success Rate</p>
                </div>
                <div>
                  <p className="font-orbitron text-3xl font-bold text-[#ff0055]">24/7</p>
                  <p className="text-white/50 text-sm">Support</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative w-full h-[500px]">
                {/* Main Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 glass-card rounded-2xl p-6 animate-float neon-glow">
                  <div className="w-full h-32 rounded-xl bg-gradient-to-br from-[#00f3ff]/20 to-[#bc13fe]/20 mb-4 flex items-center justify-center">
                    <Zap className="w-12 h-12 text-[#00f3ff]" />
                  </div>
                  <h3 className="font-orbitron font-bold text-white mb-2">Premium Service</h3>
                  <p className="text-white/50 text-sm">Instant digital delivery</p>
                  <div className="mt-4 font-orbitron text-2xl text-[#00f3ff]">$29.99</div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-10 right-10 w-20 h-20 glass rounded-xl flex items-center justify-center animate-float" style={{ animationDelay: "0.5s" }}>
                  <TrendingUp className="w-8 h-8 text-[#bc13fe]" />
                </div>
                <div className="absolute bottom-20 left-10 w-16 h-16 glass rounded-full flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
                  <Shield className="w-6 h-6 text-[#00f3ff]" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">
              WHY CHOOSE <span className="text-[#00f3ff]">US</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              We provide the best digital services with unmatched quality and speed
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center group cursor-pointer"
              >
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
                </div>
                <h3 className="font-orbitron font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">
              BROWSE <span className="text-[#bc13fe]">CATEGORIES</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Explore our wide range of digital products and services
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/services/${category.slug}`}
                  className="block glass-card rounded-2xl p-6 group"
                  data-testid={`category-${category.slug}`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
                  >
                    <category.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-orbitron font-bold text-white mb-1">{category.name}</h3>
                  <p className="text-white/50 text-sm">{category.description}</p>
                  <ArrowRight className="w-5 h-5 text-white/30 mt-4 group-hover:text-[#00f3ff] group-hover:translate-x-2 transition-all" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-2">
                FEATURED <span className="text-[#00f3ff]">PRODUCTS</span>
              </h2>
              <p className="text-white/50">Our most popular digital services</p>
            </div>
            <Link to="/services" data-testid="view-all-products">
              <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner w-12 h-12"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.product_id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00f3ff]/20 via-[#bc13fe]/20 to-[#ff0055]/20" />
            <div className="absolute inset-0 glass" />
            
            <div className="relative p-12 md:p-20 text-center">
              <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                READY TO <span className="gradient-text">GET STARTED?</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
                Join thousands of satisfied customers and experience premium digital services today.
              </p>
              <Link to="/register" data-testid="cta-register">
                <Button className="gradient-btn rounded-full px-10 py-6 text-black font-bold text-lg">
                  Create Free Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

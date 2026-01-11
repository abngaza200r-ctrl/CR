import { motion } from "framer-motion";
import { Shield, Users, Zap, Award, Target, Heart } from "lucide-react";

const AboutPage = () => {
  const values = [
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Your security is our top priority. All transactions are encrypted and protected.",
      color: "#00f3ff",
    },
    {
      icon: Zap,
      title: "Fast Delivery",
      description: "We understand time is valuable. Get your digital products within minutes.",
      color: "#bc13fe",
    },
    {
      icon: Users,
      title: "24/7 Support",
      description: "Our dedicated team is always ready to help you with any questions.",
      color: "#ff0055",
    },
    {
      icon: Award,
      title: "Quality Guaranteed",
      description: "We only provide premium, verified digital services and products.",
      color: "#00f3ff",
    },
  ];

  const stats = [
    { value: "50K+", label: "Happy Customers" },
    { value: "100K+", label: "Orders Completed" },
    { value: "99.9%", label: "Success Rate" },
    { value: "24/7", label: "Support Available" },
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="font-orbitron text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            ABOUT <span className="gradient-text">US</span>
          </h1>
          <p className="text-white/60 text-lg max-w-3xl mx-auto leading-relaxed">
            Mohamed Arqoub Digital Store is your trusted destination for premium digital services. 
            We've been helping individuals and businesses grow their online presence since day one, 
            with a commitment to quality, speed, and customer satisfaction.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-8 md:p-12 mb-20"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-[#00f3ff]" />
                <h2 className="font-orbitron text-2xl font-bold text-white">OUR MISSION</h2>
              </div>
              <p className="text-white/60 leading-relaxed mb-6">
                To democratize access to premium digital services and empower individuals 
                and businesses to achieve their goals in the digital landscape. We believe 
                everyone deserves access to high-quality digital tools and services.
              </p>
              <p className="text-white/60 leading-relaxed">
                Through innovation, integrity, and exceptional customer service, we strive 
                to be the most trusted digital services provider in the market.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1629148769165-069e8a9e8a30?auto=format&fit=crop&q=80&w=800"
                  alt="Our Mission"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="font-orbitron text-3xl font-bold text-white mb-4">
              OUR <span className="text-[#bc13fe]">VALUES</span>
            </h2>
            <p className="text-white/50">What drives us every day</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center group"
              >
                <div
                  className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${value.color}15` }}
                >
                  <value.icon className="w-7 h-7" style={{ color: value.color }} />
                </div>
                <h3 className="font-orbitron font-bold text-white mb-2">{value.title}</h3>
                <p className="text-white/50 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-8 md:p-12 mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="font-orbitron text-3xl sm:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-white/50">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="font-orbitron text-3xl font-bold text-white mb-4">
              WHY <span className="text-[#00f3ff]">CHOOSE US</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-orbitron font-bold text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#ff0055]" />
                Customer First
              </h3>
              <p className="text-white/60 text-sm">
                Every decision we make is with our customers in mind. Your satisfaction 
                is our ultimate goal, and we go above and beyond to exceed expectations.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-orbitron font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#00f3ff]" />
                Secure & Reliable
              </h3>
              <p className="text-white/60 text-sm">
                We use industry-leading security measures to protect your data and 
                transactions. Your privacy and security are never compromised.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-orbitron font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#bc13fe]" />
                Premium Quality
              </h3>
              <p className="text-white/60 text-sm">
                We only partner with verified providers and rigorously test all our 
                products to ensure you receive nothing but the best quality services.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;

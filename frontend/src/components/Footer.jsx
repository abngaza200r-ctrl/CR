import { Link } from "react-router-dom";
import { Zap, Mail, MapPin, Phone, Twitter, Instagram, Youtube, MessageCircle } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: "Social Media", path: "/services/social_media" },
      { name: "Digital Accounts", path: "/services/digital_accounts" },
      { name: "Gaming Credits", path: "/services/gaming" },
      { name: "Digital Currency", path: "/services/digital_currency" },
    ],
    company: [
      { name: "About Us", path: "/about" },
      { name: "Contact", path: "/contact" },
      { name: "FAQs", path: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Refund Policy", path: "/refund" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: MessageCircle, href: "#", label: "Discord" },
  ];

  return (
    <footer className="bg-[#030014] border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6" data-testid="footer-logo">
              <div className="w-12 h-12 rounded-full gradient-btn flex items-center justify-center">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div>
                <span className="font-orbitron font-bold text-xl text-[#00f3ff]">
                  Mohammed Abo Arqoub
                </span>
                <span className="block text-white/60 text-sm">Digital Store</span>
              </div>
            </Link>
            <p className="text-white/60 mb-6 max-w-sm">
              Your trusted destination for premium digital services, accounts, and gaming credits. Fast delivery, secure transactions, 24/7 support.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-[#00f3ff] hover:border-[#00f3ff]/30 transition-colors"
                  aria-label={social.label}
                  data-testid={`social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-orbitron font-bold text-white mb-6 tracking-wider">
              SERVICES
            </h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-[#00f3ff] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-orbitron font-bold text-white mb-6 tracking-wider">
              COMPANY
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-[#00f3ff] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-orbitron font-bold text-white mb-6 tracking-wider">
              CONTACT
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/60">
                <Mail className="w-5 h-5 text-[#00f3ff]" />
                <span>moammdsal@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Phone className="w-5 h-5 text-[#00f3ff]" />
                <span dir="ltr">+972 59-995-0104</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <MapPin className="w-5 h-5 text-[#00f3ff]" />
                <span>Global Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {currentYear} Mohammed Abo Arqoub Digital Store. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-white/40 hover:text-white/60 text-sm transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

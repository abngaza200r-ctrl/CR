import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useCart } from "../App";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Zap,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto glass rounded-full px-6 py-3"
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group" data-testid="navbar-logo">
              <div className="w-10 h-10 rounded-full gradient-btn flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="font-orbitron font-bold text-lg hidden sm:block tracking-wider">
                <span className="text-[#00f3ff]">Mohammed</span>
                <span className="text-white/80 text-sm ml-1">Abo Arqoub</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link text-sm font-medium tracking-wide transition-colors ${
                    isActive(link.path)
                      ? "text-[#00f3ff] active"
                      : "text-white/70 hover:text-white"
                  }`}
                  data-testid={`nav-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Cart */}
              <Link to="/cart" className="relative" data-testid="nav-cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#bc13fe] text-xs flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/70 hover:text-white hover:bg-white/10"
                      data-testid="user-menu-trigger"
                    >
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-[#0a0a1a] border-white/10"
                  >
                    <div className="px-3 py-2">
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-sm text-white/50">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white"
                        data-testid="menu-dashboard"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300"
                      data-testid="menu-logout"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login" data-testid="nav-login">
                  <Button className="gradient-btn rounded-full px-6 text-black font-bold text-sm">
                    Login
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-toggle"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mx-4 mt-2"
          >
            <div className="glass rounded-2xl p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl transition-colors ${
                    isActive(link.path)
                      ? "bg-[#00f3ff]/10 text-[#00f3ff]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

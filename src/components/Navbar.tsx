import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, GraduationCap, Shield, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Teachers", href: "#teachers" },
  { name: "Groups", href: "#groups" },
  { name: "Memories", href: "#memories" },
  { name: "Messages", href: "#messages" },
  { name: "Reunion", href: "#reunion" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-card border-b shadow-sm" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.a 
            href="#home" 
            className="flex items-center gap-2 text-primary font-display font-bold text-xl"
            whileHover={{ scale: 1.05 }}
          >
            <GraduationCap className="w-6 h-6" />
            <span>BSCS Reunion</span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm font-medium relative"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                {link.name}
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-primary origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-1"
            >
              <Link to="/students">
                <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                  <Users className="w-4 h-4" />
                  Directory
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button variant="outline" size="sm" className="gap-2 rounded-full">
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
              <ThemeToggle />
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground"
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="md:hidden py-4 border-t border-border"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Link
                  to="/students"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 py-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  <Users className="w-4 h-4" />
                  Student Directory
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  to="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 py-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;

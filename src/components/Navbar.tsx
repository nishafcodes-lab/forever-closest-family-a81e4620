import { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { Menu, X, GraduationCap, Shield, Users, LogIn, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Teachers", href: "#teachers" },
  { name: "Groups", href: "#groups" },
  { name: "Memories", href: "#memories" },
  { name: "Videos", href: "#videos" },
  { name: "Reviews", href: "#messages" },
  { name: "Reunion", href: "#reunion" },
];

const Navbar = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
        <div className="flex items-center justify-between h-14 sm:h-16">
          <motion.a 
            href="#home" 
            className="flex items-center gap-1.5 sm:gap-2 text-primary font-display font-bold text-lg sm:text-xl"
            whileHover={{ scale: 1.05 }}
          >
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden xs:inline">BSCS Reunion</span>
            <span className="xs:hidden">BSCS</span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
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
                <Button variant="ghost" size="sm" className="gap-2 rounded-full text-xs">
                  <Users className="w-3.5 h-3.5" />
                  Directory
                </Button>
              </Link>
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="outline" size="sm" className="gap-2 rounded-full text-xs">
                        <Shield className="w-3.5 h-3.5" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 rounded-full text-xs"
                    onClick={() => signOut()}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="gap-2 rounded-full text-xs">
                    <LogIn className="w-3.5 h-3.5" />
                    Login
                  </Button>
                </Link>
              )}
              <ThemeToggle />
            </motion.div>
          </div>

          {/* Tablet Navigation */}
          <div className="hidden md:flex lg:hidden items-center gap-2">
            <Link to="/students">
              <Button variant="ghost" size="sm" className="gap-1 rounded-full text-xs">
                <Users className="w-4 h-4" />
              </Button>
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-1 rounded-full text-xs">
                      <Shield className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1 rounded-full text-xs"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-1 rounded-full text-xs">
                  <LogIn className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <ThemeToggle />
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground"
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-1.5">
            <ThemeToggle />
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground"
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile/Tablet Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="lg:hidden py-3 sm:py-4 border-t border-border bg-background/95 backdrop-blur-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="py-2 px-3 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    {link.name}
                  </motion.a>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t border-border md:hidden">
                <Link
                  to="/students"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  <Button variant="ghost" size="sm" className="w-full gap-2 rounded-lg text-xs">
                    <Users className="w-4 h-4" />
                    Directory
                  </Button>
                </Link>
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full gap-2 rounded-lg text-xs">
                          <Shield className="w-4 h-4" />
                          Admin
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 gap-2 rounded-lg text-xs"
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2 rounded-lg text-xs">
                      <LogIn className="w-4 h-4" />
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
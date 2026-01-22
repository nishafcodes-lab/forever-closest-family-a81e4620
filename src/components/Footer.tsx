import { Heart, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { memo } from "react";

const Footer = memo(() => {
  return (
    <footer className="py-8 sm:py-12 bg-foreground text-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="flex items-center justify-center gap-2 mb-3 sm:mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-display text-lg sm:text-xl font-bold">BSCS Reunion</span>
          </motion.div>

          <h3 className="font-display text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">
            Batch 2021–2025
          </h3>

          <p className="text-sm sm:text-base text-background/70 mb-3 sm:mb-4">
            Government Graduate College Khanpur
          </p>

          <motion.div 
            className="flex items-center justify-center gap-2 mb-4 sm:mb-6 px-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-sm sm:text-base text-background/80 italic text-center">
              "Once the worst class, forever the closest family"
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-accent fill-accent flex-shrink-0" />
            </motion.div>
          </motion.div>

          <div className="border-t border-background/20 pt-4 sm:pt-6 mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-background/50">
              Designed with ❤️ by{" "}
              <Link 
                to="/admin-login" 
                className="text-background/80 font-medium hover:text-background transition-colors"
              >
                CS Coders
              </Link>
            </p>
            <p className="text-[10px] sm:text-xs text-background/40 mt-1.5 sm:mt-2">
              © 2025 BSCS Reunion. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
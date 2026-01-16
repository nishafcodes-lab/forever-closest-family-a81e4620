import { Heart, GraduationCap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6" />
            <span className="font-display text-xl font-bold">BSCS Reunion</span>
          </div>

          <h3 className="font-display text-lg font-semibold mb-2">
            Batch 2021–2025
          </h3>

          <p className="text-background/70 mb-4">
            Government Graduate College Khanpur
          </p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-background/80 italic">
              "Once the worst class, forever the closest family"
            </span>
            <Heart className="w-4 h-4 text-accent fill-accent" />
          </div>

          <div className="border-t border-background/20 pt-6 mt-6">
            <p className="text-sm text-background/50">
              Designed with ❤️ by <span className="text-background/80 font-medium">CS Coders</span>
            </p>
            <p className="text-xs text-background/40 mt-2">
              © 2025 BSCS Reunion. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TeachersSection from "@/components/TeachersSection";
import GroupsSection from "@/components/GroupsSection";
import MemoriesSection from "@/components/MemoriesSection";
import MessagesSection from "@/components/MessagesSection";
import ReunionSection from "@/components/ReunionSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <TeachersSection />
      <GroupsSection />
      <MemoriesSection />
      <MessagesSection />
      <ReunionSection />
      <Footer />
    </div>
  );
};

export default Index;

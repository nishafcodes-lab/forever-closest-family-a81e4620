import { Suspense, lazy } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load sections below the fold for better performance
const AboutSection = lazy(() => import("@/components/AboutSection"));
const TeachersSection = lazy(() => import("@/components/TeachersSection"));
const GroupsSection = lazy(() => import("@/components/GroupsSection"));
const MemoriesSection = lazy(() => import("@/components/MemoriesSection"));
const VideosSection = lazy(() => import("@/components/VideosSection"));
const MessagesSection = lazy(() => import("@/components/MessagesSection"));
const ReunionSection = lazy(() => import("@/components/ReunionSection"));
const Footer = lazy(() => import("@/components/Footer"));

const SectionLoader = () => (
  <div className="py-16 container mx-auto px-4">
    <div className="text-center mb-12">
      <Skeleton className="h-8 w-32 mx-auto mb-4" />
      <Skeleton className="h-12 w-64 mx-auto mb-4" />
      <Skeleton className="h-4 w-96 mx-auto" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-64 rounded-xl" />
      ))}
    </div>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <Suspense fallback={<SectionLoader />}>
        <AboutSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <TeachersSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <GroupsSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <MemoriesSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <VideosSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <MessagesSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <ReunionSection />
      </Suspense>
      <Suspense fallback={<div className="py-8"><Skeleton className="h-48" /></div>}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;

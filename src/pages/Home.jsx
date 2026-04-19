import HeroSection from "../components/home/HeroSection";
import HowItWorks from "../components/home/HowItWorks";
import RecentAds from "../components/home/RecentAds";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <HowItWorks />
      <RecentAds />
    </div>
  );
}
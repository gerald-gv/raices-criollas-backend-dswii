import { HeroSection } from "./components/home/HeroSection";
import { ValuesSection } from "./components/home/ValuesSection";
import { StorySection } from "./components/home/StorySection";
import { ReservationSection } from "./components/home/ReservationSection";
import { FeaturedSection } from "./components/home/FeaturedSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ValuesSection />
      <FeaturedSection  />
      <StorySection />
      <ReservationSection />
    </>
  );
}

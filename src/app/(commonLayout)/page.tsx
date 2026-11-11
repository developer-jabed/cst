import HomePage from "@/components/shared/HomePage";
import HeroSlider from "@/components/shared/HeroSlider";

export const revalidate = 1800;
export const dynamic = "force-static";

export default function Home() {
  return (
    <div>
      <div className="relative h-[calc(100vh-80px)] w-full">
        <HeroSlider />
      </div>
      <HomePage />
    </div>
  );
}
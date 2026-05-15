import HomePage from "@/components/shared/HomePage";

// ✅ Cache the page for 30 minutes (ISR)
export const revalidate = 1800;

// Force static rendering for better caching
export const dynamic = "force-static";

export default function Home() {
  return (
    <div>
      <HomePage />
    </div>
  );
}

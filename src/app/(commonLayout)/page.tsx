import HomePage from "@/components/shared/HomePage";


export const revalidate = 1800; 

export default function Home() {
  return (
    <div>
      <HomePage />
    </div>
  );
}

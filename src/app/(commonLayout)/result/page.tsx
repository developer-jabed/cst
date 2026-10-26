
import ResultsByRoll from "@/components/modules/student/ResultByRoll";
import { getResultByRoll } from "@/service/result/result.service";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ roll?: string }>;
}

export default async function ResultsPage({ searchParams }: Props) {
  const p = await searchParams;
  const roll = (p.roll || "").trim();

  const rollRes = roll
    ? await getResultByRoll(roll).catch(() => null)
    : null;

  const rollResults = Array.isArray(rollRes)
    ? rollRes
    : rollRes?.data ?? [];
  
  return (
    <ResultsByRoll
      rollResults={rollResults}
      initialRoll={roll}
    />
  );
}
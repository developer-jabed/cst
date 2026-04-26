

import ResultsClient from "@/components/modules/student/result";
import { getAllResults } from "@/service/result/result.service";
import { getResultByRoll } from "@/service/result/result.service";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    searchTerm?: string;
    semesterName?: string;
    examYear?: string;
    regulation?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    roll?: string;
    mode?: "all" | "roll";
  }>;
}

export default async function ResultsPage({ searchParams }: Props) {
  const p = await searchParams;
  const page = Math.max(1, Number(p.page) || 1);
  const limit = Math.max(1, Number(p.limit) || 15);
  const roll = (p.roll || "").trim();
  const mode = roll ? "roll" : "all";

  const [allRes, rollRes] = await Promise.all([
    mode === "all"
      ? getAllResults({
        page,
        limit,
        searchTerm: p.searchTerm ? p.searchTerm : undefined,
        semesterName: p.semesterName ? p.semesterName : undefined,
        examYear: p.examYear ? p.examYear : undefined,
        regulation: p.regulation ? p.regulation : undefined,
        status: p.status ? p.status : undefined,
        sortBy: p.sortBy ? p.sortBy : "createdAt",
        sortOrder: (p.sortOrder === "asc" || p.sortOrder === "desc")
          ? p.sortOrder
          : "desc",
      })
      : Promise.resolve(null),
    mode === "roll"
      ? getResultByRoll(roll).catch(() => null)
      : Promise.resolve(null),
  ]);



  console.log(rollRes)
  const results = (() => {
    if (!allRes) return [];
    if (Array.isArray(allRes)) return allRes;
    if (Array.isArray(allRes.data)) return allRes.data;
    if (Array.isArray(allRes.data?.data)) return allRes.data.data;
    return [];
  })();

  const meta = allRes?.meta ?? allRes?.data?.meta ?? { page, limit, total: 0 };

  console.log(meta)
  return (
    <ResultsClient
      mode={mode}
      results={results}          // ✅ use the normalized variable
      meta={meta}                // ✅ use the normalized variable
      rollResults={Array.isArray(rollRes) ? rollRes : rollRes?.data ?? []}
      initialRoll={roll}
      page={page}
      filters={{
        searchTerm: p.searchTerm || "",
        semesterName: p.semesterName || "",
        examYear: p.examYear || "",
        regulation: p.regulation || "",
        status: p.status || "",
      }}
    />
  );
}

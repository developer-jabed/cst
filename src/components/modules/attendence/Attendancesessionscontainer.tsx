"use client";

import { useCallback, useEffect, useState } from "react";
import { getAttendanceSessions } from "@/service/attendence/attendence.service";
import { AttendanceSession, SessionMeta } from "@/types/attendence.interface";
import { SessionHeader } from "./Ui";
import AttendanceSessionsListClient from "./Attendancesessionslistclient";

type Props = {
  groupId: number;
  subjectId?: number; // ← added
  meta?: SessionMeta;
};

export default function AttendanceSessionsContainer({
  groupId,
  subjectId,
  meta,
}: Props) {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchSessions = useCallback(
    async (page: number, searchQuery: string) => {
      setIsLoading(true);
      try {
        const res = await getAttendanceSessions({
          groupId,
          subjectId, // ← added
          page,
          limit: 10,
          sortBy: "date",
          sortOrder: "desc",
        });

        if (res.success) {
          const filtered = searchQuery
            ? res.data.filter(
                (s: AttendanceSession) =>
                  s.subject?.name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  s.date?.includes(searchQuery),
              )
            : res.data;

          setSessions(filtered);
          setTotalPages(res.totalPages);
          setTotal(res.total);
          setCurrentPage(page);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [groupId, subjectId], // ← added subjectId to deps
  );

  useEffect(() => {
    fetchSessions(1, search);
  }, [fetchSessions]);

  const handlePageChange = (page: number) => fetchSessions(page, search);

  const handleSearch = useCallback(
    (q: string) => {
      setSearch(q);
      fetchSessions(1, q);
    },
    [fetchSessions],
  );

  return (
    <div className="space-y-5">
      {meta && (
        <SessionHeader
          meta={meta}
          date={new Date().toISOString()}
          isLive={false}
        />
      )}
      <AttendanceSessionsListClient
        sessions={sessions}
        groupId={groupId}
        totalPages={totalPages}
        currentPage={currentPage}
        total={total}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
      />
    </div>
  );
}

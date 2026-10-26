/* eslint-disable @typescript-eslint/no-explicit-any */

import NoticeBoardClient from "@/components/modules/notice/publicNotice/PublicNotice";

import { filterActiveNotices } from "@/lib/notices";

import { getNotices } from "@/service/notice/notice.service";

export const revalidate = 300;

export const metadata = {
  title: "Notices",
  description: "Announcements from the institute.",
};

export default async function NoticesPage() {
  const res = await getNotices({
    audienceType: "ALL" as any,

    isPublished: true,

    sortBy: "noticeDate",

    sortOrder: "desc",

    limit: 50,
  });

  const notices = filterActiveNotices(
    res.success ? res.data : [],
  );

  console.log(notices)

  return (
    <NoticeBoardClient
      initialNotices={notices}
      failed={!res.success}
    />
  );
}
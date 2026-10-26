import { INotice } from "@/types/notice.interface";

export function filterActiveNotices(
  notices: INotice[],
): INotice[] {
  const now = Date.now();

  return notices.filter(
    (notice) =>
      !notice.expiryDate ||
      new Date(notice.expiryDate).getTime() > now,
  );
}
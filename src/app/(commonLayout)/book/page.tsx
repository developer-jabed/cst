import BooklistClient from "@/components/modules/SubjectManagement/Subject/booklist/Booklist";
import { getSubjectsGroupedBySemester } from "@/service/subject/subject.service";


export const revalidate = 3600;

export const metadata = {
  title: "Course Catalog",
  description: "Textbooks and subjects, organized by semester.",
};

export default async function BooklistPage() {
  const res = await getSubjectsGroupedBySemester();

  return (
    <BooklistClient
      initialGroups={res.success ? res.data : []}
      failed={!res.success}
    />
  );
}
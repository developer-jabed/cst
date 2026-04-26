import { getUserInfo } from '@/service/auth/getUserInfo'
export const dynamic = "force-dynamic";

export default async function page() {
  const teacher = await getUserInfo()
  console.log(teacher)
  return (
    <div>
      <h1>Teacher Dashboard</h1>
      <p>Welcome, {teacher.name}!</p>
    </div>
  )
}

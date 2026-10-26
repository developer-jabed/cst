
import GroupDetailClient from '@/components/modules/group/GroupDetailClient';
import { getGroupById } from '@/service/group/group.service';
import { notFound } from 'next/navigation';

export const dynamic = "force-dynamic";

export default async function GroupDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const result = await getGroupById(id);
  console.log(result);
  if (!result?.success || !result?.data) return notFound();
  
  return <GroupDetailClient group={result.data} />;
}
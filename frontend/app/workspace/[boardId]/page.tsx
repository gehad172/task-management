import { WorkspaceBoardPageClient } from "@/components/workspace/WorkspaceBoardPageClient";

type WorkspaceBoardPageProps = {
  params: Promise<{
    boardId: string;
  }>;
};

export default async function WorkspaceBoardPage({ params }: WorkspaceBoardPageProps) {
  const { boardId } = await params;

  return <WorkspaceBoardPageClient boardId={boardId} />;
}
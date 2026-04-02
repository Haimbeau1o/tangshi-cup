import { SeasonDetailView } from "@/components/seasons/season-detail-view";

type SeasonPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: SeasonPageProps) {
  const { slug } = await params;

  return {
    title: `${slug.toUpperCase()} 赛季`,
  };
}

export default async function SeasonDetailPage({ params }: SeasonPageProps) {
  const { slug } = await params;

  return <SeasonDetailView slug={slug} />;
}

import { InitializedEventDashboard } from "@/components/event/initialized-event-dashboard";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EventPageProps) {
  const { slug } = await params;

  return {
    title: `赛事总览 · ${slug}`,
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;

  return <InitializedEventDashboard slug={slug} />;
}

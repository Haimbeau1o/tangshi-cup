import { ChronicleTimeline } from "@/components/chronicle/chronicle-timeline";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata = {
  title: "编年史",
};

export default function ChroniclePage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-16 lg:px-10">
      <SectionHeading
        eyebrow="Chronicle"
        title="比赛不该打完就消失"
        description="唐氏杯会把每场比赛的结果、转折和冠军归档沉淀进时间轴。只要在赛事页点一次同步到编年史，这里就会实时更新；如果还没同步过，则先展示样例故事。"
      />
      <ChronicleTimeline />
    </div>
  );
}

import type { SetupTemplateId } from "@/lib/types";

export type SetupTemplateCard = {
  id: SetupTemplateId;
  title: string;
  subtitle: string;
  summary: string;
  chips: string[];
};

export const setupTemplates: SetupTemplateCard[] = [
  {
    id: "two-team-standard",
    title: "2 队标准赛",
    subtitle: "最适合认真打的 BO3 主线",
    summary: "10 人到位就能开始，强调地图、系列赛和干净的对抗节奏。",
    chips: ["5v5", "BO3", "标准夜赛"],
  },
  {
    id: "tri-finals",
    title: "3 队循环 + 总决赛",
    subtitle: "先比稳定，再打冠军战",
    summary: "三队先打循环积分，再让前二进入总决赛，兼顾公平和戏剧性。",
    chips: ["15 人", "前二晋级", "默认推荐"],
  },
  {
    id: "four-team-carnival",
    title: "4 队嘉年华",
    subtitle: "流程图最热闹的一种",
    summary: "四队开场、双路推进、总决赛收尾，很适合有赛事氛围的周末夜。",
    chips: ["20 人", "嘉年华", "流程感最强"],
  },
];

import { SeasonSetupWizard } from "@/components/setup/season-setup-wizard";
import type { SetupTemplateId } from "@/lib/types";

export const metadata = {
  title: "初始化新赛季",
};

type SeasonSetupPageProps = {
  searchParams: Promise<{
    template?: string;
    resume?: string;
  }>;
};

const validTemplateIds: SetupTemplateId[] = ["two-team-standard", "tri-finals", "four-team-carnival"];

export default async function SeasonSetupPage({ searchParams }: SeasonSetupPageProps) {
  const params = await searchParams;
  const initialTemplateId = validTemplateIds.includes(params.template as SetupTemplateId)
    ? (params.template as SetupTemplateId)
    : "tri-finals";
  const shouldResume = params.resume === "1";

  return (
    <SeasonSetupWizard
      key={`${initialTemplateId}-${shouldResume ? "resume" : "new"}`}
      initialTemplateId={initialTemplateId}
      shouldResume={shouldResume}
    />
  );
}

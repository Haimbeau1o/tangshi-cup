import { FlowBoardCanvas } from "@/components/flow/flow-board-canvas";
import { SeriesTrack } from "@/components/flow/series-track";
import type { TournamentFlow, TournamentMatchScore } from "@/lib/types";

type TournamentFlowRendererProps = {
  flow: TournamentFlow;
  editable?: boolean;
  onScoreSelect?: (matchId: string, score: TournamentMatchScore) => void;
  onClearMatch?: (matchId: string) => void;
};

export function TournamentFlowRenderer({
  flow,
  editable = false,
  onScoreSelect,
  onClearMatch,
}: TournamentFlowRendererProps) {
  if (flow.layout === "series") {
    return <SeriesTrack flow={flow} editable={editable} onScoreSelect={onScoreSelect} onClearMatch={onClearMatch} />;
  }

  return <FlowBoardCanvas flow={flow} editable={editable} onScoreSelect={onScoreSelect} onClearMatch={onClearMatch} />;
}

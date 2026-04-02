import { mockTeamAvatars } from "@/lib/data/mock-avatars";
import type { Team } from "@/lib/types";

type AssignTeamAvatarsInput = {
  teams: Team[];
  seed: string;
};

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function assignTeamAvatars({ teams, seed }: AssignTeamAvatarsInput) {
  const startIndex = hashString(seed) % mockTeamAvatars.length;

  return teams.map((team, index) => {
    const preservedAvatar = mockTeamAvatars.find((avatar) => avatar.id === team.avatarId);
    const avatar = preservedAvatar ?? mockTeamAvatars[(startIndex + index) % mockTeamAvatars.length];

    return {
      ...team,
      avatarId: avatar.id,
      avatarSrc: avatar.src,
      accentColor: avatar.accentColor,
    };
  });
}

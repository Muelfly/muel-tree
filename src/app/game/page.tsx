"use client";

import { useEffect, useState } from "react";
import { ActivityLayout, type ActivitySession } from "@/components/ActivityLayout";
import { getActivity } from "@/config/activities";

const GAME_ACTIVITY = getActivity("gomdori-mafia")!;

/**
 * /game — Gomdori Mafia Activity entry point.
 *
 * Phase 1 status: skeleton only. The Discord Activity boot sequence is wired
 * (via ActivityLayout → initDiscord), but the game flow itself (lobby, role
 * reveal, night/day/vote/verdict) is not yet implemented.
 *
 * Next sessions will replace <PlaceholderShell/> with:
 *   - resolveMatch(channelId) → /api/game/match/resolve
 *   - exchangeAuth(discordToken) → /api/game/auth/exchange (returns game JWT)
 *   - subscribe to mafia.matches / mafia.match_events / mafia.match_phases
 *     via a JWT-aware Supabase client
 *   - render <Lobby/>, <RoleReveal/>, <Night/>, <Day/>, <Vote/>, <Verdict/>,
 *     <Result/> based on match.status
 */
export default function GamePage() {
  return (
    <ActivityLayout activity={GAME_ACTIVITY}>
      {(session) => <PlaceholderShell session={session} />}
    </ActivityLayout>
  );
}

function PlaceholderShell({ session }: { session: ActivitySession }) {
  const [phase, setPhase] = useState<string>("init");

  useEffect(() => {
    if (!session.hasDiscordAuth) {
      setPhase("anonymous");
      return;
    }
    setPhase("authenticated");
  }, [session.hasDiscordAuth]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0b0b1a] text-white/80 px-6">
      <div className="text-5xl mb-4">🐻</div>
      <h1 className="text-2xl font-semibold mb-2">Gomdori 마피아</h1>
      <p className="text-sm text-white/40 mb-6">
        Phase 1 — 빌드 중 / Activity 부팅 시퀀스 검증용 화면
      </p>

      <div className="text-xs text-white/30 font-mono space-y-1">
        <div>phase: {phase}</div>
        <div>discord auth: {session.hasDiscordAuth ? "yes" : "no"}</div>
        <div>user: {session.discordUser?.username ?? "(anonymous)"}</div>
        <div>guild: {session.activityContext.guildId ?? "(none)"}</div>
        <div>channel: {session.activityContext.channelId ?? "(none)"}</div>
        <div>instance: {session.activityContext.instanceId ?? "(none)"}</div>
      </div>

      <p className="mt-6 text-xs text-white/30 max-w-sm text-center">
        다음 세션에서 매치 resolve, 게임 JWT 교환, Realtime 구독, Lobby 화면이 이 자리에 들어옵니다.
      </p>
    </div>
  );
}

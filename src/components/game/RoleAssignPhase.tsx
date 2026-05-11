"use client";

import type { PlayerSummary } from "@/lib/game/api";

type RoleAssignPhaseProps = {
  players: PlayerSummary[];
  myPlayer: PlayerSummary | null;
  events: Array<{ id: string; event_type: string; payload?: Record<string, unknown> }>;
};

export function RoleAssignPhase({ players, myPlayer, events }: RoleAssignPhaseProps) {
  const roleEvent = events.find((e) => e.event_type === "role_assigned");
  const role = roleEvent?.payload?.role ?? myPlayer?.role;
  const faction = roleEvent?.payload?.faction ?? myPlayer?.faction;
  const allies = roleEvent?.payload?.allies as Array<{user_id: string, role: string}> | undefined;
  
  return (
    <div className="flex h-full w-full items-center justify-center p-5">
      <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-white/[0.04] p-10 text-center animate-in fade-in zoom-in duration-500">
        <h2 className="text-sm font-medium text-white/50 tracking-widest uppercase">당신의 직업은</h2>
        <h1 className={`mt-6 text-5xl font-bold ${faction === "demon" ? "text-red-400" : "text-amber-100"}`}>
          {role === "citizen" && "시민"}
          {role === "doctor" && "의사"}
          {role === "police" && "경찰"}
          {role === "demon" && "악마"}
          {role === "helper" && "조력자"}
          {!role && "확인 중..."}
        </h1>
        <p className="mt-8 text-lg text-white/80">
          {role === "citizen" && "시민으로서 마을에 숨은 악마를 찾아내세요."}
          {role === "doctor" && "의사로서 매일 밤 한 명을 치료할 수 있습니다."}
          {role === "police" && "경찰로서 매일 밤 한 명을 조사할 수 있습니다."}
          {role === "demon" && "악마로서 마을 사람들을 모두 처치하세요."}
          {role === "helper" && "조력자로서 악마를 도와 마을을 혼란에 빠뜨리세요."}
        </p>
        {faction === "demon" && allies && allies.length > 0 && (
          <div className="mt-6 rounded-md bg-red-900/20 border border-red-500/20 p-4">
            <div className="text-sm text-red-200/70 mb-2">당신의 동료</div>
            <div className="text-red-100 font-medium">
              {allies.map(a => `${players.find(p => p.userId === a.user_id)?.displayName} (${a.role === 'demon' ? '악마' : '조력자'})`).join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

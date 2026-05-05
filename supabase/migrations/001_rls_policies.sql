-- Muel Supabase RLS 정책
-- 실행: Supabase Dashboard > SQL Editor 에서 수동 실행
-- service role key를 쓰는 서버 API는 RLS를 bypass하므로,
-- 이 정책은 anon key로 접근하는 공개 읽기만 제어함.

-- ═══════════════════════════════════════════════════════════
-- dreams
-- ═══════════════════════════════════════════════════════════
-- RLS는 이미 enabled 상태 (기존 설정 유지)

-- 공개/익명 꿈은 누구나 읽기 가능
create policy "공개 꿈 읽기" on dreams
  for select
  using (visibility != 'private');

-- 쓰기는 service role만 (API route에서 service_role_key 사용)
-- anon key로는 insert/update/delete 불가

-- ═══════════════════════════════════════════════════════════
-- dream_connections
-- ═══════════════════════════════════════════════════════════
alter table dream_connections enable row level security;

-- 연결은 누구나 읽기 가능 (그래프 표시용)
create policy "연결 읽기" on dream_connections
  for select
  using (true);

-- ═══════════════════════════════════════════════════════════
-- service_events
-- ═══════════════════════════════════════════════════════════
-- RLS enabled + no public policy = anon key로 접근 불가
-- service role key로만 쓰고 읽는 운영 로그 테이블
-- 의도적으로 policy 없음

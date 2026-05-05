import Link from "next/link";

export default function PaymentSuccess() {
  return (
    <main className="min-h-screen bg-[#070712] flex flex-col items-center justify-center gap-3">
      <p className="text-white/60 text-lg font-light">감사합니다 ☕</p>
      <p className="text-white/25 text-sm">세계수에 온기를 더해주셨습니다.</p>
      <Link
        href="/weave"
        className="mt-6 text-white/20 text-xs hover:text-white/40 transition-colors"
      >
        돌아가기 →
      </Link>
    </main>
  );
}

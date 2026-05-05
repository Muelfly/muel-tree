import Link from "next/link";

export default function PaymentFail() {
  return (
    <main className="min-h-screen bg-[#070712] flex flex-col items-center justify-center gap-3">
      <p className="text-white/40 text-sm font-light">결제가 취소되었습니다.</p>
      <Link
        href="/weave"
        className="mt-4 text-white/20 text-xs hover:text-white/40 transition-colors"
      >
        돌아가기 →
      </Link>
    </main>
  );
}

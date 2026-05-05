import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#070712] flex flex-col items-center justify-center px-6">
      <h1 className="text-white/80 text-3xl font-light tracking-[0.35em]">Muel</h1>

      <div className="mt-16 w-full max-w-sm space-y-3">
        <Link
          href="/weave"
          className="group flex items-center justify-between px-5 py-4 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.02] transition-all"
        >
          <div>
            <p className="text-white/70 text-sm font-light">세계수</p>
            <p className="text-white/25 text-xs mt-0.5">꿈이 이어지는 3D 네트워크</p>
          </div>
          <span className="text-white/20 group-hover:text-white/40 transition-colors">→</span>
        </Link>
      </div>
    </main>
  );
}

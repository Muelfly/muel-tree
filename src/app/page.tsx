import Link from "next/link";
import { Nav } from "@/components/Nav";

const news = [
  { date: "2025년 5월", category: "Muel", text: "Muel 챗봇 소개 준비 중", href: "#" },
  { date: "2025년 4월", category: "Gomdori", text: "Gomdori 기획 중", href: "#" },
  { date: "2025년 3월", category: "Weave", text: "Weave 베타 공개", href: "#" },
];

function Badge({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-widest ${
        light ? "border-ink/30 text-ink/60" : "border-white/30 text-white/60"
      }`}
    >
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <>
      <Nav />

      <section
        id="muel"
        className="flex min-h-[680px] flex-col items-center justify-center bg-gradient-to-br from-[#a2e61d] to-[#ffde90] px-6 pb-24 pt-32 text-center text-ink"
      >
        <Badge light>Bot</Badge>
        <h1 className="mt-6 text-7xl font-bold leading-none sm:text-9xl">
          Muel
        </h1>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="#"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-ink/80"
          >
            초대하기 -&gt;
          </Link>
          <Link
            href="#team"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/30 px-6 text-sm font-semibold text-ink transition hover:bg-ink/5"
          >
            자세히 알아보기 -&gt;
          </Link>
        </div>
      </section>

      <section
        id="gomdori"
        className="flex min-h-[680px] flex-col items-center justify-center bg-[#0a0a0a] px-6 py-24 text-center text-white"
      >
        <Badge>Game</Badge>
        <h2 className="mt-6 text-7xl font-bold leading-none sm:text-9xl">
          Gomdori
        </h2>
        <div className="mt-10">
          <span className="inline-flex h-12 items-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white/35">
            준비 중
          </span>
        </div>
      </section>

      <section
        id="weave"
        className="flex min-h-[680px] flex-col items-center justify-center bg-gradient-to-br from-[#5B21B6] to-[#DB2777] px-6 py-24 text-center text-white"
      >
        <Badge>App</Badge>
        <h2 className="mt-6 text-7xl font-bold leading-none sm:text-9xl">
          Weave
        </h2>
        <div className="mt-10">
          <Link
            href="/weave"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-ink transition hover:bg-white/85"
          >
            체험하기 -&gt;
          </Link>
        </div>
      </section>

      <section
        id="server"
        className="flex min-h-[420px] flex-col items-center justify-center bg-[#1e2433] px-8 py-20 text-center text-white"
      >
        <Badge>Discord</Badge>
        <h2 className="mt-6 text-7xl font-bold leading-none sm:text-9xl">
          Server
        </h2>
        <div className="mt-10">
          <Link
            href="#"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            참여하기 -&gt;
          </Link>
        </div>
      </section>

      <section id="team" className="bg-white px-8 py-20 sm:px-16 lg:px-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-4xl font-bold text-ink">Team</h2>
          <div className="mt-10 divide-y divide-ink/10">
            {news.map((item) => (
              <Link
                key={item.text}
                href={item.href}
                className="group flex items-start justify-between gap-6 py-8 transition hover:opacity-60"
              >
                <div>
                  <p className="mb-2 text-sm text-ink/40">
                    {item.date}
                    <span className="ml-4">{item.category}</span>
                  </p>
                  <p className="text-xl font-bold text-ink">{item.text}</p>
                </div>
                <span className="mt-1 shrink-0 text-ink/30 transition group-hover:translate-x-1">
                  -&gt;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#0a0a0a] px-8 py-16 sm:px-16 lg:px-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-base font-bold text-white">Muel</p>
          <p className="mt-1 text-sm text-white/45">
            고닥ㆍ집을 원함 | fancy2794@gmail.com
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { label: "공식 Discord", href: "#" },
              { label: "블로그", href: "#" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/55 transition hover:border-white/40 hover:text-white"
              >
                {link.label} -&gt;
              </Link>
            ))}
          </div>
          <p className="mt-14 text-xs text-white/20">
            © 2025 Muel · 고닥ㆍ집을 원함. All Rights Reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

import Link from "next/link";
import { muelProducts, platformTerms } from "@/config/apps";
import { Nav } from "@/components/Nav";

const cardColors = ["bg-[#fff2b8]", "bg-[#ffe4dd]", "bg-[#dcf8ff]", "bg-[#f1f1ec]"];

function Arrow() {
  return <span aria-hidden="true">-&gt;</span>;
}

export default function Home() {
  return (
    <>
      <Nav />
      <main className="bg-white pt-16 text-ink">
        <section className="px-5 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-6xl gap-8 rounded-[28px] bg-cream px-6 py-10 sm:px-10 lg:grid-cols-[1fr_420px] lg:items-center lg:px-14 lg:py-14">
            <div>
              <p className="mb-5 text-sm font-semibold text-ink/55">
                {platformTerms.platform}
              </p>
              <h1 className="text-6xl font-bold leading-none sm:text-7xl">
                Muel
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-ink/62">
                Discord 챗봇을 중심으로, 게임과 작은 Activity들을 함께 운영하는
                고닥 커뮤니티 프로젝트입니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#products"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-ink/85"
                >
                  프로젝트 보기 <Arrow />
                </a>
                <Link
                  href="/weave"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-ink ring-1 ring-ink/10 transition hover:bg-white/80"
                >
                  세계수 체험 <Arrow />
                </Link>
              </div>
            </div>

            <div className="rounded-[26px] bg-white p-5 shadow-[0_24px_70px_rgba(30,37,50,0.12)]">
              <div className="rounded-[22px] bg-sky p-5">
                <div className="mb-16 flex items-center justify-between">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink/55">
                    MUEL WEB APP
                  </span>
                  <span className="h-10 w-10 rounded-full bg-sun" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <span className="h-28 rounded-[20px] bg-white" />
                  <span className="h-28 rounded-[20px] bg-coral" />
                  <span className="h-28 rounded-[20px] bg-mint" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="px-5 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-semibold text-ink/45">PRODUCTS</p>
            <h2 className="mt-2 text-4xl font-bold">Muel에서 시작되는 것들</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              {muelProducts.map((product, index) => (
                <Link
                  key={product.slug}
                  href={product.route}
                  className={`${cardColors[index % cardColors.length]} group flex min-h-[320px] flex-col justify-between rounded-[26px] p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(30,37,50,0.12)]`}
                >
                  <div>
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-ink/45">
                        {product.kind}
                      </p>
                      <span className="rounded-full bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase text-ink/50">
                        {product.status}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold leading-tight">
                      {product.name}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-ink/58">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{product.cta}</span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white transition group-hover:translate-x-1">
                      <Arrow />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="premium-blog" className="px-5 pb-16 pt-8 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[26px] bg-ink p-7 text-white">
              <p className="text-sm font-semibold text-white/45">TERMS</p>
              <h2 className="mt-4 text-4xl font-bold">용어 기준</h2>
              <p className="mt-4 text-sm leading-7 text-white/58">
                `muel-tree`는 {platformTerms.webApp}, `muel-bot`은{" "}
                {platformTerms.bot}입니다. 새 기능은 새 인프라가 아니라
                Product와 Activity 라우트로 추가합니다.
              </p>
            </div>
            <div className="divide-y divide-ink/10 border-y border-ink/10">
              {Object.entries(platformTerms).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-4 py-5">
                  <span className="text-lg font-semibold">{value}</span>
                  <span className="text-sm text-ink/45">{key}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

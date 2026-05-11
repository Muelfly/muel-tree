import Link from "next/link";
import { Nav } from "@/components/Nav";

const capabilities = [
  {
    name: "Veo video generation",
    status: "API ready",
    body: "Text prompts can start a Gemini long-running video operation. Completion is tracked through operation polling or Gemini webhook events.",
    endpoint: "POST /api/gemini/video",
  },
  {
    name: "Batch generation",
    status: "API ready",
    body: "Small prompt batches can be submitted asynchronously and recorded in Supabase for later retrieval.",
    endpoint: "POST /api/gemini/batch",
  },
  {
    name: "Webhook receiver",
    status: "Receiver ready",
    body: "Gemini operation events are stored idempotently with webhook-id and can update matching operation rows.",
    endpoint: "POST /api/gemini/webhook",
  },
  {
    name: "Interactions",
    status: "Foundation ready",
    body: "The storage and webhook path can accept interaction.completed events. Product UX can be added once the exact interaction flow is chosen.",
    endpoint: "gemini_operations / gemini_webhook_events",
  },
];

export default function GeminiPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#101820] px-6 pb-20 pt-28 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#a2e61d]">
            Muel Gemini Layer
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight sm:text-7xl">
            Long-running AI work, tracked as events.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65">
            Muel can expose Gemini-supported long-running capabilities without
            turning Discord into a polling UI. The web app starts work, Supabase
            stores operation state, and webhooks close the loop when Google
            pushes completion events.
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {capabilities.map((item) => (
              <section
                key={item.name}
                className="border border-white/12 bg-white/[0.04] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-bold">{item.name}</h2>
                  <span className="shrink-0 border border-[#a2e61d]/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#a2e61d]">
                    {item.status}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  {item.body}
                </p>
                <p className="mt-5 font-mono text-xs text-white/45">
                  {item.endpoint}
                </p>
              </section>
            ))}
          </div>

          <section className="mt-12 border border-white/12 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-bold">Operational guardrails</h2>
            <div className="mt-5 grid gap-4 text-sm leading-relaxed text-white/60 md:grid-cols-3">
              <p>
                Cost-bearing endpoints require Discord auth or an internal
                bearer token. They are not anonymous public endpoints.
              </p>
              <p>
                Webhook verification is enabled with GEMINI_WEBHOOK_SECRET. In
                production, unsigned events are rejected by default.
              </p>
              <p>
                Supabase keeps both the submitted operation and every webhook
                event, so Discord messages can reference durable job state.
              </p>
            </div>
          </section>

          <div className="mt-10">
            <Link
              href="/"
              className="inline-flex h-11 items-center border border-white/20 px-5 text-sm font-semibold text-white/70 transition hover:border-white/45 hover:text-white"
            >
              Back to Muel
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

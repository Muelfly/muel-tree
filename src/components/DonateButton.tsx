"use client";

import { useState } from "react";

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

export function DonateButton() {
  const [thanked, setThanked] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!TOSS_CLIENT_KEY) return null;

  async function donate() {
    if (busy) return;
    setBusy(true);
    try {
      const { getTossPayments } = await import("@/lib/toss");
      const toss = await getTossPayments();
      const orderId = `donation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await toss.requestPayment("카드", {
        amount: 1000,
        orderId,
        orderName: "Muel 후원",
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
      setThanked(true);
    } catch {
      // cancelled or failed — silently reset
    } finally {
      setBusy(false);
    }
  }

  if (thanked) {
    return (
      <p className="fixed bottom-5 right-5 z-30 text-white/25 text-[11px] select-none pointer-events-none">
        감사합니다 ☕
      </p>
    );
  }

  return (
    <button
      onClick={donate}
      disabled={busy}
      className="fixed bottom-5 right-5 z-30 text-white/20 text-[11px] hover:text-white/35 transition-colors select-none disabled:opacity-50"
    >
      ☕ 1,000원
    </button>
  );
}

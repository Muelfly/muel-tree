"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ConfirmState = "confirming" | "success" | "error";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ConfirmState>("confirming");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amountStr = searchParams.get("amount");

    if (!paymentKey || !orderId || !amountStr) {
      setState("error");
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      return;
    }

    const amount = Number(amountStr);
    if (!Number.isFinite(amount) || amount <= 0) {
      setState("error");
      setErrorMsg("결제 금액이 올바르지 않습니다.");
      return;
    }

    fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.ok) {
          setState("success");
        } else {
          setState("error");
          setErrorMsg(data.error ?? "결제 승인에 실패했습니다.");
        }
      })
      .catch(() => {
        setState("error");
        setErrorMsg("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      });
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[#070712] flex flex-col items-center justify-center gap-3">
      {state === "confirming" && (
        <>
          <div className="text-3xl animate-pulse">☕</div>
          <p className="text-white/40 text-sm">결제를 확인하고 있어요...</p>
        </>
      )}

      {state === "success" && (
        <>
          <p className="text-white/60 text-lg font-light">감사합니다 ☕</p>
          <p className="text-white/25 text-sm">세계수에 온기를 더해주셨습니다.</p>
        </>
      )}

      {state === "error" && (
        <>
          <p className="text-red-400/60 text-sm font-light">
            {errorMsg ?? "결제 처리 중 문제가 발생했습니다."}
          </p>
        </>
      )}

      <Link
        href="/weave"
        className="mt-6 text-white/20 text-xs hover:text-white/40 transition-colors"
      >
        돌아가기 →
      </Link>
    </main>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#070712] flex flex-col items-center justify-center gap-3">
          <div className="text-3xl animate-pulse">☕</div>
          <p className="text-white/40 text-sm">결제를 확인하고 있어요...</p>
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

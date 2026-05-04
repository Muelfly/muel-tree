import { loadTossPayments } from "@tosspayments/payment-sdk";

let tossPaymentsPromise: ReturnType<typeof loadTossPayments> | null = null;

export function getTossPayments() {
  if (!tossPaymentsPromise) {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
    tossPaymentsPromise = loadTossPayments(clientKey);
  }
  return tossPaymentsPromise;
}

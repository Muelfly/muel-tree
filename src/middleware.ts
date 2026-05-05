import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 30;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) return false;
  record.count++;
  return true;
}

let lastCleanup = Date.now();
function cleanupRateLimit() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  rateLimitMap.forEach((record, ip) => {
    if (now - record.timestamp > RATE_LIMIT_WINDOW * 2) {
      rateLimitMap.delete(ip);
    }
  });
}

function containsXSS(input: string): boolean {
  const xssPatterns = /<script|javascript:|on\w+\s*=|<iframe|<img.*onerror/i;
  return xssPatterns.test(input);
}

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  cleanupRateLimit();

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "요청이 너무 많아요. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  if (req.method === "POST") {
    try {
      const body = await req.text();
      if (containsXSS(body)) {
        return NextResponse.json(
          { error: "허용되지 않는 입력이에요." },
          { status: 400 },
        );
      }
    } catch {
      // body parse failure - ignore
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};

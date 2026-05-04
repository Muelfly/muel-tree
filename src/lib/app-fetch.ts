const nativeFetch =
  typeof window !== "undefined" ? window.fetch.bind(window) : fetch;

export function appFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (init?.body && typeof init.body === "string") {
    // Encode string body as UTF-8 bytes via Blob to avoid ByteString errors
    // in Discord's WebView when the body contains non-Latin1 characters (e.g. Korean)
    const encoded = new TextEncoder().encode(init.body);
    const blob = new Blob([encoded], {
      type: (init.headers as Record<string, string>)?.["Content-Type"] ?? "application/json",
    });
    return nativeFetch(input, { ...init, body: blob });
  }
  return nativeFetch(input, init);
}

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

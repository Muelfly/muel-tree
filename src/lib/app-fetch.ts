const nativeFetch =
  typeof window !== "undefined" ? window.fetch.bind(window) : fetch;

export function appFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (init?.body && typeof init.body === "string") {
    // Discord's WebView converts string bodies to ByteStrings (Latin-1 only).
    // Blob bodies don't help — Discord reads them back as UTF-8 text, restoring the
    // original non-Latin1 characters and triggering the same error.
    // Escaping all non-ASCII chars as \uXXXX keeps the body pure ASCII while
    // remaining valid JSON that the server parses back to the original text.
    const safeBody = init.body.replace(/[^\x00-\x7F]/g, (c) =>
      `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`
    );
    return nativeFetch(input, { ...init, body: safeBody });
  }
  return nativeFetch(input, init);
}

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

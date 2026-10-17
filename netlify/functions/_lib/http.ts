/**
 * Tiny HTTP helpers shared by every Netlify Function.
 */

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

export function httpError(
  message: string,
  status = 400,
  extra: Record<string, unknown> = {},
): Response {
  return json({ error: message, ...extra }, status);
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpException("The request body was not valid JSON.", 400);
  }
}

export class HttpException extends Error {
  status: number;
  extra: Record<string, unknown>;
  constructor(message: string, status = 400, extra: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

/**
 * Wraps a fetch-style Netlify Function so that unexpected errors always
 * produce a clean JSON response (and a secure log line) instead of a 500 HTML
 * page.
 */
export function safeHandler(
  handler: (req: Request, context: FnContext) => Promise<Response>,
): (req: Request, context: FnContext) => Promise<Response> {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (err) {
      if (err instanceof HttpException) {
        return httpError(err.message, err.status, err.extra);
      }
      const status = (err as { status?: unknown })?.status;
      if (typeof status === "number" && status >= 400 && status < 600) {
        return httpError(err instanceof Error ? err.message : "Request failed.", status);
      }
      console.error("[bloom] unhandled error", {
        path: new URL(req.url).pathname,
        message: err instanceof Error ? err.message : String(err),
      });
      return httpError(
        "Something went wrong on our side. Your order was NOT placed — please try again or contact us on WhatsApp.",
        500,
      );
    }
  };
}

export type FnContext = {
  params?: Record<string, string>;
  [key: string]: unknown;
};

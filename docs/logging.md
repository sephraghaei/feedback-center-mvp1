# Logging

The project has one small logging layer in `lib/logger.ts`. It has no runtime dependencies, writes structured entries to the console, and never throws when logging fails.

## Where logs come from

- `instrumentation.ts` logs server startup and errors captured by Next.js outside a route handler, such as rendering and proxy errors.
- `lib/api-logger.ts` wraps every API route. It logs the request id, method, path, status and duration. Unexpected route exceptions are logged and converted to a safe 500 response.
- `lib/client-logger.ts` logs browser interactions and browser errors. Client entries are shown locally and forwarded in small batches to `app/api/logs/route.ts`, which writes them through the same server logger.
- `app/components/auth-flow.tsx` logs important login actions: opening the modal, requesting a code, verifying a code, saving a profile and logout.
- `app/error.tsx` and `app/global-error.tsx` log render errors caught by the React error boundaries.
- `lib/sms.ts` logs Kavenegar failures, including network errors and rejected provider responses.

## Entry shape

Every entry has the same fields:

```json
{
  "timestamp": "2026-10-31T10:20:30.000Z",
  "level": "INFO",
  "event": "api.request.completed",
  "message": "optional human readable text",
  "context": {
    "service": "feedback-center",
    "requestId": "9f2c...",
    "route": "/api/auth/request-otp",
    "method": "POST",
    "path": "/api/auth/request-otp",
    "status": 200,
    "durationMs": 42,
    "userRef": "1a2b3c4d5e6f7788"
  },
  "error": {
    "name": "Error",
    "message": "optional error message",
    "stack": "optional stack trace"
  }
}
```

Event names use `area.action`, for example `auth.otp.sent`, `auth.profile.updated`, `client.page.view`, `sms.kavenegar.rejected` and `api.request.failed`. The event field is stable, so it is the best field to search and filter on.

`userRef` is an HMAC of the user identifier. It is stable across requests and cannot be reversed into a phone number without the server secret.

## Levels and settings

| Variable | Default | Meaning |
| --- | --- | --- |
| `LOG_LEVEL` | `INFO` | Minimum server level: `DEBUG`, `INFO`, `WARN`, `ERROR` |
| `NEXT_PUBLIC_LOG_LEVEL` | `INFO` | Minimum browser level, also forwarded to the server |
| `LOG_FORMAT` | `pretty` in development, `json` in production | `json` for machines, `pretty` for humans |

Set `LOG_LEVEL=DEBUG` temporarily to see request start details, SMS success and other low volume diagnostics. Keep `INFO` in production so normal traffic does not flood the logs.

## Reading and filtering

In production each line is JSON, so it works with any log viewer, Vercel log search, Cloudflare Workers Logs or `jq`:

```bash
# All errors
jq -c 'select(.level == "ERROR")'

# Failed API requests
jq -c 'select(.event == "api.request.failed" or (.event == "api.request.completed" and .context.status >= 500))'

# One request, including its domain events
jq -c 'select(.context.requestId == "9f2c...")'

# Everything for a user reference
jq -c 'select(.context.userRef == "1a2b3c4d5e6f7788")'

# Login funnel
jq -c 'select(.event | startswith("auth.") or startswith("client.ui.auth."))'
```

Every API response also carries an `x-request-id` header. Use it to jump from a user report to the matching request and its domain events.

Browser entries are prefixed with `client.` on the server, so `page.view` becomes `client.page.view`. The raw browser event name is kept in the rest of the event string. Browser context is nested under `context.client` so it cannot overwrite server fields such as `source`, `requestId` or `userRef`.

`NEXT_PUBLIC_LOG_LEVEL` is inlined at build time. Set it before `next build` or a deployment, not only at runtime.

## Privacy

The logger never receives request bodies, cookies, authorization headers or query strings. Before writing, it redacts:

- Sensitive context keys such as password, token, secret, cookie, api key, otp, code, phone, mobile, email, name, age, company and address.
- Secret values from `BETTER_AUTH_SECRET`, `KAVENEGAR_API_KEY` and `DATABASE_URL` if they appear inside a message or error.
- Email addresses, Iranian mobile numbers and bearer tokens found in text.
- OTP codes are never logged. Development logs only say that a development code is ready; the code itself stays in the response and the UI.

Client payloads are limited to 24 KB and 20 entries per request, and each field is truncated before it is written.

## Adding a log

Use the shared logger and a stable event name:

```ts
import { logger } from "@/lib/logger";

logger.info("billing.invoice.created", {
  context: { invoiceId, userRef, amount },
});
```

Inside an API route use the request scoped logger:

```ts
export const POST = withApiLogging("/api/example", async (request, _context, log) => {
  log.warn("example.rejected", { message: "Missing field", context: { field: "name" } });
  return NextResponse.json({ ok: false }, { status: 400 });
});
```

In browser code use `clientLogger`:

```ts
import { clientLogger } from "@/lib/client-logger";

clientLogger.info("ui.filter.changed", { context: { filter: "open" } });
```

Do not log raw user input. Log ids, counts, enum values and booleans instead.

## Failure behavior

Logging is best effort:

- Every write is wrapped so a bad value, circular object or console failure cannot throw.
- API route logging never changes a successful response.
- Client forwarding failures are ignored. The local console entry is already written.
- If a client batch cannot be delivered it is dropped, not retried forever.

/**
 * POST /.netlify/functions/admin-login  { password }
 * GET  /.netlify/functions/admin-login  → { authenticated }
 * Sets an HttpOnly cookie session stored in Netlify Blobs.
 */

import { json, readJson, safeHandler } from "./_lib/http";
import { checkPassword, requireSession, startSession } from "./_lib/auth";


export default safeHandler(async (req) => {
  if (req.method === "GET") {
    const token = await requireSession(req);
    return json({ authenticated: Boolean(token) });
  }

  const { password } = await readJson<{ password?: string }>(req);
  if (!password || typeof password !== "string") {
    return json({ error: "Please enter the admin password." }, 400);
  }

  // Simple throttle: repeated wrong attempts are slow and logged.
  const ok = await checkPassword(password);
  if (!ok) {
    console.warn("[bloom] failed admin sign-in attempt");
    return json({ error: "That password is not correct." }, 401);
  }

  const { cookie } = await startSession();
  return json({ ok: true }, 200, { "set-cookie": cookie });
});

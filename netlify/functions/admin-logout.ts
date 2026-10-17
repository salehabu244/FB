/** POST /.netlify/functions/admin-logout — clears the admin session cookie. */

import { json, safeHandler } from "./_lib/http";
import { endSession } from "./_lib/auth";


export default safeHandler(async (req) => {
  const cookie = await endSession(req);
  return json({ ok: true }, 200, { "set-cookie": cookie });
});

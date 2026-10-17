/**
 * GET /.netlify/functions/admin-photo?key=… — serve a customer's inspiration photo.
 * Photos live in a private Netlify Blobs store and are only reachable by a
 * signed-in admin.
 */

import { httpError, safeHandler } from "./_lib/http";
import { requireAdmin, unauthorized } from "./_lib/auth";
import { getPhoto } from "./_lib/store";

export default safeHandler(async (req) => {
  const token = await requireAdmin(req);
  if (!token) return unauthorized();

  const key = new URL(req.url).searchParams.get("key") ?? "";
  const photo = await getPhoto(key);
  if (!photo) return httpError("Photo not found.", 404);

  return new Response(photo.data, {
    headers: {
      "content-type": photo.contentType,
      "cache-control": "private, no-store",
    },
  });
});

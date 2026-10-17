/**
 * POST /.netlify/functions/upload — optional inspiration photo for a bouquet.
 *
 * Accepts multipart/form-data (`file`) or JSON ({ dataBase64, contentType }).
 * Files are size- and type-checked, then stored in a PRIVATE Netlify Blobs
 * store that only the admin dashboard can read.
 */

import type { Config } from "@netlify/functions";
import { httpError, json, readJson, safeHandler } from "./_lib/http";
import { randomToken, savePhoto } from "./_lib/store";
import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_BYTES } from "../../shared/validation";

export const config: Config = { method: "POST" };

export default safeHandler(async (req) => {
  const contentType = req.headers.get("content-type") || "";

  let bytes: Uint8Array | null = null;
  let type = "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return httpError("No file was received.", 400);
    type = file.type;
    bytes = new Uint8Array(await file.arrayBuffer());
  } else {
    const body = await readJson<{ dataBase64?: string; contentType?: string }>(req);
    if (!body.dataBase64) return httpError("No image data was received.", 400);
    type = String(body.contentType || "image/jpeg");
    bytes = Buffer.from(body.dataBase64, "base64");
  }

  if (!ALLOWED_PHOTO_TYPES.includes(type)) {
    return httpError("Please upload a JPG, PNG, WEBP or HEIC image.", 415);
  }
  if (!bytes || bytes.byteLength === 0) {
    return httpError("That image appears to be empty.", 400);
  }
  if (bytes.byteLength > MAX_PHOTO_BYTES) {
    return httpError(`Please choose an image smaller than ${Math.round(MAX_PHOTO_BYTES / 1024 / 1024)} MB.`, 413);
  }

  const key = `photo_${randomToken(16)}`;
  const base64 = Buffer.from(bytes).toString("base64");
  await savePhoto(key, base64, type);

  return json({ ok: true, photoKey: key, bytes: bytes.byteLength }, 201);
});

/**
 * GET /.netlify/functions/admin-catalog — the full editable catalog (admin only)
 * PUT /.netlify/functions/admin-catalog — save changes (flowers, packages, wrapping,
 *                          accessories, delivery options and settings)
 */

import { json, readJson, safeHandler } from "./_lib/http";
import { requireAdmin, unauthorized } from "./_lib/auth";
import { getCatalog, saveCatalog, setAdminPassword, getAdminPassword } from "./_lib/store";
import type { Catalog } from "../../shared/types";


export default safeHandler(async (req) => {
  const token = await requireAdmin(req);
  if (!token) return unauthorized();

  const catalog = await getCatalog();

  if (req.method === "GET") {
    const password = await getAdminPassword();
    return json({ catalog, adminPasswordIsDefault: password === "BloomBeyond2026" });
  }

  const patch = await readJson<Partial<Catalog> & { newPassword?: string }>(req);

  const next: Catalog = {
    ...catalog,
    ...(patch.flowers ? { flowers: patch.flowers } : {}),
    ...(patch.wrapColors ? { wrapColors: patch.wrapColors } : {}),
    ...(patch.wrapStyles ? { wrapStyles: patch.wrapStyles } : {}),
    ...(patch.accessories ? { accessories: patch.accessories } : {}),
    ...(patch.deliveryOptions ? { deliveryOptions: patch.deliveryOptions } : {}),
    ...(patch.packages ? { packages: patch.packages } : {}),
    ...(patch.settings ? { settings: { ...catalog.settings, ...patch.settings } } : {}),
  };

  // Never allow an empty shop.
  if (!next.flowers.some((f) => f.available)) next.flowers = catalog.flowers;
  if (!next.deliveryOptions.some((d) => d.available)) next.deliveryOptions = catalog.deliveryOptions;
  if (!next.wrapColors.some((w) => w.available)) next.wrapColors = catalog.wrapColors;

  if (typeof patch.newPassword === "string" && patch.newPassword.length >= 8) {
    await setAdminPassword(patch.newPassword);
  }

  const saved = await saveCatalog(next);
  return json({ catalog: saved, adminPasswordIsDefault: false });
});

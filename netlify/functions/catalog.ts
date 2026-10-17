/**
 * GET /.netlify/functions/catalog — public shop data (flowers, wrapping,
 * packages, delivery options and the business settings needed to render the
 * storefront). The catalog is seeded automatically on the very first request.
 */

import { getCatalog } from "./_lib/store";
import { isOptionAvailable } from "../../shared/pricing";
import { json, safeHandler } from "./_lib/http";

export default safeHandler(async () => {
  const catalog = await getCatalog();
  const now = new Date();
  const express = catalog.deliveryOptions.find((d) => d.kind === "express");

  return json({
    catalog,
    serverNow: now.toISOString(),
    expressAvailable: express ? isOptionAvailable(express, catalog.settings, now) : false,
    expressCutoff: catalog.settings.expressCutoff,
    timezone: catalog.settings.timezone,
  });
});

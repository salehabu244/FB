/**
 * Server-side validation for an order submission.
 * The browser validates too (for friendly messages), but the server never
 * trusts the browser: everything is re-checked here against the catalog.
 */

import type { BouquetConfig, Catalog, CustomerDetails } from "./types";
import { accessoryById, flowerById, isOptionAvailable, deliveryById, countFlowers } from "./pricing";

export type Submission = {
  config: BouquetConfig;
  customer: CustomerDetails;
  specialRequest: string;
  photoKey?: string;
  consent: boolean;
  campaign?: Record<string, string>;
  /** Client-generated key used to prevent accidental duplicate submissions. */
  idempotencyKey?: string;
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string; fields: Record<string, string> };

const phoneOk = (v: string) => /^[+]?[\d\s()-]{7,18}$/.test(v.trim()) && (v.match(/\d/g) || []).length >= 7;

export function validateSubmission(
  sub: Submission,
  catalog: Catalog,
  now: Date = new Date(),
): ValidationResult {
  const fields: Record<string, string> = {};
  const s = catalog.settings;
  const c = sub.config;
  const cust = sub.customer;

  /* --- customer ------------------------------------------------- */
  if (!cust.name || cust.name.trim().length < 2) fields.name = "Please enter your name.";
  if (!cust.phone || !phoneOk(cust.phone)) fields.phone = "Please enter a valid phone number.";
  if (cust.email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(cust.email.trim()))
    fields.email = "That e-mail address doesn't look right.";
  if (cust.whatsapp && !phoneOk(cust.whatsapp))
    fields.whatsapp = "Please enter a valid WhatsApp number.";
  if (!cust.address || cust.address.trim().length < 6)
    fields.address = "Please enter the full delivery address.";
  if (!cust.area || cust.area.trim().length < 2) fields.area = "Please choose your area / district.";

  /* --- bouquet --------------------------------------------------- */
  if (!Array.isArray(c.flowers)) {
    fields.flowers = "Invalid flower selection.";
  } else {
    let total = 0;
    let availableCount = 0;
    for (const sel of c.flowers) {
      const flower = flowerById(catalog, sel.flowerId);
      if (!flower) {
        fields.flowers = `"${sel.flowerId}" is not on the menu.`;
        break;
      }
      if (!flower.available) {
        fields.flowers = `${flower.name} is unavailable today — please pick another flower.`;
        break;
      }
      if (!Number.isInteger(sel.qty) || sel.qty < 0 || sel.qty > 50) {
        fields.flowers = "Please choose a valid quantity for each flower.";
        break;
      }
      if (sel.qty > 0) {
        total += sel.qty;
        availableCount += 1;
        if (!flower.colors.some((col) => col.name === sel.color)) {
          fields.flowers = `${flower.name}: "${sel.color}" is not an available colour.`;
          break;
        }
      }
    }
    if (!fields.flowers) {
      if (total < 1) fields.flowers = "Please choose at least one flower.";
      else if (total > 120) fields.flowers = "That is more than 120 stems — please contact us for bulk orders.";
      else if (availableCount < 1) fields.flowers = "Please choose at least one flower.";
    }
  }

  if (!Number.isInteger(c.books) || c.books < 0 || c.books > 10)
    fields.books = "Books must be between 0 and 10.";
  if (typeof c.bookTitles === "string" && c.bookTitles.length > 300)
    fields.books = "Book preference is too long (300 characters max).";

  const wrapColor = catalog.wrapColors.find((w) => w.id === c.wrapColorId);
  if (!wrapColor || !wrapColor.available) fields.wrapping = "Please choose an available wrapping paper.";
  const wrapStyle = catalog.wrapStyles.find((w) => w.id === c.wrapStyleId);
  if (!wrapStyle || !wrapStyle.available) fields.wrapping = "Please choose an available wrapping style.";

  if (!["handwritten", "printed"].includes(c.note?.type))
    fields.note = "Please choose a note type.";
  const msgLen = (c.note?.message || "").length;
  if (msgLen > s.noteCharLimit + 600)
    fields.note = `Your message is too long (${s.noteCharLimit} standard characters allowed + 600 extra).`;

  for (const g of c.gifts || []) {
    const acc = accessoryById(catalog, g.id);
    if (!acc) {
      fields.gifts = "One of the selected gifts is no longer offered.";
      break;
    }
    if (!acc.available) {
      fields.gifts = `${acc.name} is unavailable today.`;
      break;
    }
    if (!Number.isInteger(g.qty) || g.qty < 0 || g.qty > 20) {
      fields.gifts = "Please choose a valid quantity for each gift.";
      break;
    }
  }

  /* --- delivery --------------------------------------------------- */
  const option = deliveryById(catalog, c.deliveryOptionId);
  if (!option) {
    fields.delivery = "Please choose a delivery option.";
  } else if (!isExpressAllowedSafe(option, catalog, now)) {
    fields.delivery =
      option.kind === "express"
        ? `Express delivery is no longer available today (cutoff ${s.expressCutoff} ${s.timezone}). Please pick standard delivery.`
        : `${option.name} is unavailable right now.`;
  } else if (option.kind === "express" && c.deliveryDate !== nowIsoInTz(now, s.timezone)) {
    fields.delivery = "Express delivery must be for today.";
  }

  /* --- consent & requests ---------------------------------------- */
  if (!sub.consent) fields.consent = "Please agree to the privacy & order policy.";
  if (sub.specialRequest && sub.specialRequest.length > 2000)
    fields.special = "Your request is too long (2000 characters max).";

  if (Object.keys(fields).length > 0) {
    return { ok: false, message: "Please check the highlighted fields.", fields };
  }
  return { ok: true };
}

function isExpressAllowedSafe(
  option: NonNullable<ReturnType<typeof deliveryById>>,
  catalog: Catalog,
  now: Date,
) {
  return isOptionAvailable(option, catalog.settings, now);
}

function nowIsoInTz(now: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

/** Basic size guard for the optional inspiration photo. */
export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/avif"];

export { countFlowers };

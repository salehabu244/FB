/**
 * Pricing engine — the single source of truth for money.
 *
 * This module is imported by the React app (live estimates) AND by the
 * Netlify Function that creates the order (authoritative re-validation),
 * so the customer always sees exactly what the server charges.
 */

import type {
  BouquetConfig,
  Catalog,
  Flower,
  Package,
  Quote,
  Settings,
  DeliveryOption,
} from "./types";

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

export const flowerById = (c: Catalog, id: string): Flower | undefined =>
  c.flowers.find((f) => f.id === id);

export const wrapColorById = (c: Catalog, id: string) =>
  c.wrapColors.find((w) => w.id === id);

export const wrapStyleById = (c: Catalog, id: string) =>
  c.wrapStyles.find((w) => w.id === id);

export const accessoryById = (c: Catalog, id: string) =>
  c.accessories.find((a) => a.id === id);

export const deliveryById = (c: Catalog, id: string): DeliveryOption | undefined =>
  c.deliveryOptions.find((d) => d.id === id);

/* ------------------------------------------------------------------ */
/* Date / time helpers (timezone aware, works in browser and Node)     */
/* ------------------------------------------------------------------ */

function partsInTimezone(now: Date, timeZone: string) {
  let tz = timeZone;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
  } catch {
    tz = "Asia/Dhaka";
  }
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const p: Record<string, string> = {};
  for (const part of fmt.formatToParts(now)) p[part.type] = part.value;
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    time: `${p.hour === "24" ? "00" : p.hour}:${p.minute}`,
  };
}

/** Today's date (YYYY-MM-DD) in the business timezone. */
export function businessToday(settings: Settings, now: Date = new Date()): string {
  return partsInTimezone(now, settings.timezone).date;
}

/** Current HH:MM in the business timezone. */
export function businessTime(settings: Settings, now: Date = new Date()): string {
  return partsInTimezone(now, settings.timezone).time;
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** Express delivery is only possible today and before the configured cutoff. */
export function isExpressAllowed(settings: Settings, now: Date = new Date()): boolean {
  return businessTime(settings, now) < settings.expressCutoff;
}

/** True when the given delivery option can be selected right now. */
export function isOptionAvailable(
  option: DeliveryOption,
  settings: Settings,
  now: Date = new Date(),
): boolean {
  if (!option.available) return false;
  if (option.kind === "express") return isExpressAllowed(settings, now);
  return true;
}

export type DeliveryWindow = { min: string; max: string; expected: string };

/** Selectable date range for a delivery option. */
export function deliveryWindow(
  option: DeliveryOption,
  settings: Settings,
  now: Date = new Date(),
): DeliveryWindow {
  const today = businessToday(settings, now);
  if (option.kind === "express") {
    return { min: today, max: today, expected: today };
  }
  const days = Math.max(1, option.withinDays);
  return { min: addDays(today, 1), max: addDays(today, days), expected: addDays(today, days) };
}

export function formatDate(dateStr: string, timeZone?: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: timeZone || "UTC",
    }).format(dt);
  } catch {
    return dateStr;
  }
}

/* ------------------------------------------------------------------ */
/* Config helpers                                                      */
/* ------------------------------------------------------------------ */

export function countFlowers(config: BouquetConfig): number {
  return config.flowers.reduce((sum, f) => sum + (f.qty || 0), 0);
}

export function giftsTotal(config: BouquetConfig, catalog: Catalog): number {
  return config.gifts.reduce((sum, g) => {
    const acc = accessoryById(catalog, g.id);
    return sum + (acc ? acc.price * g.qty : 0);
  }, 0);
}

/** The shop's default signature bouquet: 5 flowers, 2 books. */
export function defaultBouquetConfig(catalog: Catalog): BouquetConfig {
  const pick = (id: string) => catalog.flowers.find((f) => f.id === id);
  const roses = pick("roses");
  const peony = pick("peonies");
  const ranunculus = pick("ranunculus");
  const baby = pick("babys-breath");
  const fallback = catalog.flowers.filter((f) => f.available);

  const flowers =
    roses && peony && ranunculus && baby
      ? [
          { flowerId: roses.id, qty: 2, color: roses.defaultColor },
          { flowerId: peony.id, qty: 1, color: peony.defaultColor },
          { flowerId: ranunculus.id, qty: 1, color: ranunculus.defaultColor },
          { flowerId: baby.id, qty: 1, color: baby.defaultColor },
        ]
      : fallback.slice(0, 2).map((f) => ({ flowerId: f.id, qty: 1, color: f.defaultColor }));

  const standard =
    catalog.deliveryOptions.find((d) => d.kind === "standard" && d.available) ||
    catalog.deliveryOptions[0];
  const win = standard ? deliveryWindow(standard, catalog.settings) : undefined;

  return {
    flowers,
    books: 2,
    bookTitles: "",
    wrapColorId: catalog.wrapColors[0]?.id ?? "blush-pink",
    wrapStyleId: catalog.wrapStyles[0]?.id ?? "classic",
    note: { type: "handwritten", message: "", from: "", to: "" },
    gifts: [],
    deliveryOptionId: standard?.id ?? "",
    deliveryDate: win?.expected ?? "",
    deliveryWindow: standard?.timeWindows[0] ?? "",
  };
}

/* ------------------------------------------------------------------ */
/* The quote                                                           */
/* ------------------------------------------------------------------ */

export function computeQuote(config: BouquetConfig, catalog: Catalog): Quote {
  const s = catalog.settings;
  const lines: Quote["lines"] = [];
  let subtotal = 0;

  const add = (label: string, amount: number, detail?: string) => {
    subtotal += amount;
    lines.push({ label, amount: Math.round(amount), ...(detail ? { detail } : {}) });
  };

  // 1. Base arrangement — includes the decorative ribbon, floral tape,
  //    protective wrapping and up to `includedBooks` books.
  add("Bouquet base", s.basePrice, "Arranging, ribbon, floral tape & protective wrap");

  // 2. Flowers
  let totalFlowers = 0;
  for (const sel of config.flowers) {
    const flower = flowerById(catalog, sel.flowerId);
    if (!flower || sel.qty <= 0) continue;
    totalFlowers += sel.qty;
    add(
      `${flower.name} × ${sel.qty}`,
      flower.pricePerStem * sel.qty,
      `${flower.pricePerStem}/stem · ${sel.color}`,
    );
  }

  // 3. Books
  const books = Math.max(0, Math.floor(config.books || 0));
  const extraBooks = Math.max(0, books - s.includedBooks);
  add(
    `Books × ${books}`,
    extraBooks * s.extraBookPrice,
    extraBooks > 0
      ? `${s.includedBooks} included in base · extra ${extraBooks} × ${s.extraBookPrice}`
      : `${s.includedBooks} included in base`,
  );

  // 4. Wrapping paper
  const wrapColor = wrapColorById(catalog, config.wrapColorId);
  if (wrapColor) {
    add(`Wrapping paper — ${wrapColor.name}`, wrapColor.price, wrapColor.price > 0 ? undefined : "Included");
  }
  const wrapStyle = wrapStyleById(catalog, config.wrapStyleId);
  if (wrapStyle) {
    add(`Wrapping style — ${wrapStyle.name}`, wrapStyle.price, wrapStyle.price > 0 ? undefined : "Included");
  }

  // 5. Note card
  const message = config.note.message || "";
  const overChars = Math.max(0, message.length - s.noteCharLimit);
  const noteFee =
    (config.note.type === "printed" ? s.notePrintedFee : 0) + overChars * s.noteExtraCharFee;
  add(
    `${config.note.type === "printed" ? "Printed" : "Handwritten"} note`,
    noteFee,
    config.note.type === "printed"
      ? `${message.length}/${s.noteCharLimit} characters${overChars ? ` · ${overChars} extra` : ""}`
      : `${message.length}/${s.noteCharLimit} characters`,
  );

  // 6. Gifts, tags & accessories
  for (const g of config.gifts) {
    const acc = accessoryById(catalog, g.id);
    if (!acc || g.qty <= 0) continue;
    add(`${acc.name} × ${g.qty}`, acc.price * g.qty, acc.category === "gift" ? "Gift" : "Accessory");
  }

  const flowersSubtotal = lines
    .filter((l) => /×/.test(l.label) && !/Books/.test(l.label) && !/Gift|Accessory/.test(l.label))
    .reduce((sum, l) => sum + l.amount, 0);

  // 7. Delivery
  const option = deliveryById(catalog, config.deliveryOptionId);
  const deliveryFee = option ? option.fee : 0;

  // 8. Discount
  let discount = 0;
  if (s.discountPercent > 0 && subtotal >= s.discountMinSubtotal && s.discountMinSubtotal > 0) {
    discount = Math.round((subtotal * s.discountPercent) / 100);
  }

  const total = Math.max(0, subtotal + deliveryFee - discount);

  return {
    currency: s.currency,
    lines,
    flowersSubtotal,
    subtotal: Math.round(subtotal),
    deliveryFee,
    discount,
    total,
    totalFlowers,
    books,
  };
}

/** Starting price for a ready-made package (delivery not included). */
export function packagePrice(pkg: Package, catalog: Catalog): number {
  if (pkg.priceOverride != null) return pkg.priceOverride;
  return computeQuote(configFromPackage(pkg, catalog), catalog).total;
}

/** Convert a package configuration into a full customizer configuration. */
export function configFromPackage(pkg: Package, catalog: Catalog): BouquetConfig {
  const standard =
    catalog.deliveryOptions.find((d) => d.id === pkg.config.deliveryOptionId) ||
    catalog.deliveryOptions.find((d) => d.kind === "standard") ||
    catalog.deliveryOptions[0];
  const win = standard ? deliveryWindow(standard, catalog.settings) : undefined;
  return {
    flowers: pkg.config.flowers
      .filter((f) => flowerById(catalog, f.flowerId))
      .map((f) => ({ flowerId: f.flowerId, qty: f.qty, color: f.color || flowerById(catalog, f.flowerId)!.defaultColor })),
    books: pkg.config.books,
    bookTitles: "",
    wrapColorId: pkg.config.wrapColorId,
    wrapStyleId: pkg.config.wrapStyleId,
    note: { type: pkg.config.noteType, message: "", from: "", to: "" },
    gifts: pkg.config.gifts.map((g) => ({ id: g.id, qty: g.qty })),
    deliveryOptionId: standard?.id ?? "",
    deliveryDate: win?.expected ?? "",
    deliveryWindow: standard?.timeWindows[0] ?? "",
  };
}

/* ------------------------------------------------------------------ */
/* Human readable summary (used by e-mails, WhatsApp and the admin UI) */
/* ------------------------------------------------------------------ */

export function buildOrderSummary(input: {
  orderId: string;
  config: BouquetConfig;
  quote: Quote;
  catalog: Catalog;
  customer: { name: string; phone: string; whatsapp?: string; email?: string };
  address: string;
  area: string;
  deliveryLabel: string;
  deliveryDate: string;
  deliveryWindow: string;
  specialRequest: string;
}): string {
  const { config, quote, catalog, customer } = input;
  const cur = quote.currency;
  const money = (n: number) => (cur.position === "before" ? `${cur.symbol}${n}` : `${n} ${cur.symbol}`);

  const flowerLines = config.flowers
    .map((f) => {
      const flower = flowerById(catalog, f.flowerId);
      return flower ? `${flower.name} ×${f.qty} (${f.color})` : "";
    })
    .filter(Boolean)
    .join(", ");

  const gifts = config.gifts
    .map((g) => {
      const acc = accessoryById(catalog, g.id);
      return acc ? `${acc.name} ×${g.qty}` : "";
    })
    .filter(Boolean)
    .join(", ");

  const wrapColor = wrapColorById(catalog, config.wrapColorId)?.name ?? "-";
  const wrapStyle = wrapStyleById(catalog, config.wrapStyleId)?.name ?? "-";

  return [
    `NEW BOUQUET ORDER`,
    ``,
    `Order ID: ${input.orderId}`,
    `Customer: ${customer.name}`,
    `Phone: ${customer.phone}${customer.whatsapp ? ` (WhatsApp: ${customer.whatsapp})` : ""}${customer.email ? `\nEmail: ${customer.email}` : ""}`,
    ``,
    `BOUQUET DETAILS`,
    `Flowers: ${flowerLines || "none"}`,
    `Total Flowers: ${quote.totalFlowers}`,
    `Books: ${config.books}`,
    `Wrapping: ${wrapColor} · ${wrapStyle}`,
    `Note Type: ${config.note.type === "printed" ? "Printed" : "Handwritten"}`,
    `Message: ${config.note.message || "-"}`,
    `Recipient: ${config.note.to || "-"} · From: ${config.note.from || "-"}`,
    gifts ? `Gifts & Accessories: ${gifts}` : ``,
    config.bookTitles ? `Book preference: ${config.bookTitles}` : ``,
    ``,
    `DELIVERY`,
    `Type: ${input.deliveryLabel}`,
    `Date: ${input.deliveryDate || "-"}${input.deliveryWindow ? ` · ${input.deliveryWindow}` : ""}`,
    `Address: ${input.address}`,
    input.area ? `Area: ${input.area}` : ``,
    ``,
    `SPECIAL REQUESTS`,
    input.specialRequest || `-`,
    ``,
    `PRICE BREAKDOWN`,
    ...quote.lines.map((l) => `• ${l.label}: ${money(l.amount)}`),
    `Subtotal: ${money(quote.subtotal)}`,
    `Delivery fee: ${money(quote.deliveryFee)}`,
    quote.discount ? `Discount: -${money(quote.discount)}` : ``,
    ``,
    `ORDER TOTAL: ${money(quote.total)}`,
  ]
    .filter((l) => l !== undefined && l !== null)
    .join("\n");
}

export function formatMoney(currency: Settings["currency"], amount: number): string {
  const n = Math.round(amount).toLocaleString("en-US");
  return currency.position === "before" ? `${currency.symbol}${n}` : `${n} ${currency.symbol}`;
}

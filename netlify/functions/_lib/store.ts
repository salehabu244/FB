/**
 * Data layer — Netlify Blobs.
 *
 * All shop data (catalog + every order) lives in Netlify Blobs: it is part of
 * the Netlify account, needs no external database, no connection strings and
 * no manual setup. The catalog is seeded automatically on the first request,
 * so the site works the moment it is deployed.
 */

import { getStore, type Store } from "@netlify/blobs";
import { DEFAULT_CATALOG } from "../../../shared/catalog";
import type { Catalog, Order, OrderIndexEntry } from "../../../shared/types";

const STORE_MAIN = "bloom-data";
const STORE_PHOTOS = "bloom-photos";

const KEY_CATALOG = "catalog:v1";
const KEY_INDEX = "index:orders";
const KEY_ADMIN_PASSWORD = "secret:admin-password";
const KEY_SESSION_PREFIX = "session:";
const KEY_ORDER_PREFIX = "order:";
const KEY_IDEM_PREFIX = "idem:";

function store(name: string): Store {
  // Inside a Netlify Function (and under `netlify dev`) the runtime provides
  // the credentials automatically. No keys are ever shipped to the browser.
  return getStore(name);
}

const main = () => store(STORE_MAIN);
const photos = () => store(STORE_PHOTOS);

/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

let catalogCache: { value: Catalog; at: number } | null = null;

export async function getCatalog(): Promise<Catalog> {
  // Cache for a few seconds: many visitors at once don't need to hit storage.
  if (catalogCache && Date.now() - catalogCache.at < 5_000) return catalogCache.value;

  const stored = await main().get(KEY_CATALOG, { type: "json" });
  if (stored) {
    const value = stored as Catalog;
    catalogCache = { value, at: Date.now() };
    return value;
  }

  // First run: seed the store with the bundled default catalog.
  const seeded: Catalog = { ...DEFAULT_CATALOG, updatedAt: new Date().toISOString() };
  await main().setJSON(KEY_CATALOG, seeded);
  catalogCache = { value: seeded, at: Date.now() };
  console.log("[bloom] catalog seeded into Netlify Blobs");
  return seeded;
}

export async function saveCatalog(catalog: Catalog): Promise<Catalog> {
  const next: Catalog = { ...catalog, updatedAt: new Date().toISOString() };
  await main().setJSON(KEY_CATALOG, next);
  catalogCache = { value: next, at: Date.now() };
  return next;
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export async function getOrder(id: string): Promise<Order | null> {
  const value = await main().get(`${KEY_ORDER_PREFIX}${id}`, { type: "json" });
  return (value as Order) ?? null;
}

export async function listOrderIndex(): Promise<OrderIndexEntry[]> {
  const value = await main().get(KEY_INDEX, { type: "json" });
  if (value) return value as OrderIndexEntry[];

  // Rebuild the index once if it is missing (safety net).
  const { blobs } = await main().list({ prefix: KEY_ORDER_PREFIX });
  const entries: OrderIndexEntry[] = [];
  for (const blob of blobs) {
    const order = (await main().get(blob.key, { type: "json" })) as Order | null;
    if (order) entries.push(toIndexEntry(order));
  }
  entries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  await main().setJSON(KEY_INDEX, entries);
  return entries;
}

export function toIndexEntry(order: Order): OrderIndexEntry {
  const failed = Object.values(order.notifications).some((n) => n.status === "failed");
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    paymentStatus: order.paymentStatus,
    name: order.customer.name,
    phone: order.customer.phone,
    deliveryType: order.config.deliveryOptionId,
    total: order.quote.total,
    currency: order.quote.currency.code,
    totalFlowers: order.quote.totalFlowers,
    hasPhoto: Boolean(order.photoKey),
    notificationsFailed: failed,
  };
}

export async function saveOrder(order: Order): Promise<void> {
  await main().setJSON(`${KEY_ORDER_PREFIX}${order.id}`, order);
  const index = await listOrderIndex();
  const next = [toIndexEntry(order), ...index.filter((e) => e.id !== order.id)];
  await main().setJSON(KEY_INDEX, next);
}

/* ------------------------------------------------------------------ */
/* Idempotency (prevents accidental double orders)                     */
/* ------------------------------------------------------------------ */

export async function findDuplicate(idempotencyKey: string): Promise<Order | null> {
  if (!idempotencyKey) return null;
  const id = await main().get(`${KEY_IDEM_PREFIX}${idempotencyKey}`, { type: "text" });
  if (!id) return null;
  return getOrder(id);
}

export async function rememberIdempotency(idempotencyKey: string, orderId: string): Promise<void> {
  if (!idempotencyKey) return;
  await main().set(`${KEY_IDEM_PREFIX}${idempotencyKey}`, orderId);
}

/* ------------------------------------------------------------------ */
/* Admin sessions & password                                           */
/* ------------------------------------------------------------------ */

export type Session = { token: string; createdAt: string; expiresAt: string };

export async function createSession(): Promise<Session> {
  const token = randomToken(32);
  const session: Session = {
    token,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  };
  await main().set(`${KEY_SESSION_PREFIX}${token}`, JSON.stringify(session));
  return session;
}

export async function getSession(token: string): Promise<Session | null> {
  if (!token) return null;
  const raw = await main().get(`${KEY_SESSION_PREFIX}${token}`, { type: "text" });
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Session;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      await main().delete(`${KEY_SESSION_PREFIX}${token}`);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function deleteSession(token: string): Promise<void> {
  await main().delete(`${KEY_SESSION_PREFIX}${token}`);
}

export async function getAdminPassword(): Promise<string> {
  const stored = await main().get(KEY_ADMIN_PASSWORD, { type: "text" });
  if (stored) return stored;
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  const password = fromEnv && fromEnv.length > 0 ? fromEnv : "BloomBeyond2026";
  await main().set(KEY_ADMIN_PASSWORD, password);
  return password;
}

export async function setAdminPassword(password: string): Promise<void> {
  await main().set(KEY_ADMIN_PASSWORD, password);
}

/* ------------------------------------------------------------------ */
/* Inspiration photos (private store, only readable by the admin)      */
/* ------------------------------------------------------------------ */

export async function savePhoto(key: string, base64: string, contentType: string): Promise<void> {
  await photos().set(key, base64ToArrayBuffer(base64), { metadata: { contentType } });
}

export async function getPhoto(key: string): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  if (!/^photo_[a-zA-Z0-9]{16}$/.test(key)) return null;
  try {
    const result = await photos().getWithMetadata(key, { type: "arrayBuffer" });
    if (!result?.data) return null;
    return { data: result.data, contentType: (result.metadata?.contentType as string) || "image/jpeg" };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

export function randomToken(length: number): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function base64ToArrayBuffer(value: string): ArrayBuffer {
  const buf = Buffer.from(value, "base64");
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

/**
 * Shared domain types.
 * Imported by BOTH the React frontend and the Netlify Functions, so the
 * browser and the server always agree on the shape of the data.
 */

export type Currency = { code: string; symbol: string; position: "before" | "after" };

export type FlowerColor = { name: string; hex: string; accent?: string };

export type Flower = {
  id: string;
  name: string;
  /** Key used by the SVG bouquet renderer to draw this variety. */
  art: string;
  colors: FlowerColor[];
  defaultColor: string;
  pricePerStem: number;
  available: boolean;
  sortOrder: number;
  blurb?: string;
};

export type WrappingColor = {
  id: string;
  name: string;
  /** Solid colour or CSS gradient used by the preview. */
  hex: string;
  /** Optional texture pattern id for printed papers. */
  pattern?: "floral" | "premium" | "kraft";
  price: number;
  available: boolean;
};

export type WrappingStyle = {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
};

export type AccessoryCategory = "gift" | "tag" | "accessory";

export type Accessory = {
  id: string;
  name: string;
  category: AccessoryCategory;
  price: number;
  available: boolean;
  description?: string;
  art?: string;
};

export type DeliveryOption = {
  id: string;
  name: string;
  description: string;
  fee: number;
  /** "today" = express (needs to be before the cutoff), "days" = within N days. */
  kind: "express" | "standard";
  withinDays: number;
  timeWindows: string[];
  available: boolean;
};

export type IncludedLine = { label: string; priced: boolean };

export type PackageConfig = {
  flowers: { flowerId: string; qty: number; color?: string }[];
  books: number;
  wrapColorId: string;
  wrapStyleId: string;
  noteType: NoteType;
  gifts: { id: string; qty: number }[];
  deliveryOptionId?: string;
};

export type Package = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  included: IncludedLine[];
  config: PackageConfig;
  /** null → price is calculated live from the pricing engine. */
  priceOverride: number | null;
  active: boolean;
  sortOrder: number;
};

export type NoteType = "handwritten" | "printed";

export type Settings = {
  businessName: string;
  tagline: string;
  contactPhone: string;
  whatsappNumber: string;
  businessEmail: string;
  address: string;
  facebookPageUrl: string;
  instagramUrl: string;
  currency: Currency;
  /** Business timezone used for the express (same-day) cutoff. */
  timezone: string;
  /** "HH:MM" in the business timezone. Orders after this cannot be express. */
  expressCutoff: string;
  noteCharLimit: number;
  notePrintedFee: number;
  noteExtraCharFee: number;
  includedBooks: number;
  extraBookPrice: number;
  basePrice: number;
  discountPercent: number;
  discountMinSubtotal: number;
  /** Absolute URL used in Open Graph tags (set after the site goes live). */
  siteUrl: string;
  heroImageUrl: string;
  privacySummary: string;
  deliveryPolicy: string;
  refundPolicy: string;
};

export type Catalog = {
  flowers: Flower[];
  wrapColors: WrappingColor[];
  wrapStyles: WrappingStyle[];
  accessories: Accessory[];
  deliveryOptions: DeliveryOption[];
  packages: Package[];
  settings: Settings;
  /** Version marker — bumped whenever an admin saves changes. */
  updatedAt: string;
};

/* ------------------------------------------------------------------ */
/* Bouquet configuration (what the customer builds)                    */
/* ------------------------------------------------------------------ */

export type FlowerSelection = {
  flowerId: string;
  qty: number;
  color: string;
};

export type BouquetConfig = {
  flowers: FlowerSelection[];
  books: number;
  bookTitles: string;
  wrapColorId: string;
  wrapStyleId: string;
  note: { type: NoteType; message: string; from: string; to: string };
  gifts: { id: string; qty: number }[];
  deliveryOptionId: string;
  deliveryDate: string;
  deliveryWindow: string;
};

export type CustomerDetails = {
  name: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  area: string;
  instructions: string;
};

export type PricingLine = {
  label: string;
  detail?: string;
  amount: number;
};

export type Quote = {
  currency: Currency;
  lines: PricingLine[];
  flowersSubtotal: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  totalFlowers: number;
  books: number;
};

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export type NotificationState = {
  status: "sent" | "failed" | "skipped";
  detail?: string;
  at?: string;
};

export type OrderNotifications = {
  businessEmail: NotificationState;
  customerEmail: NotificationState;
  whatsapp: NotificationState;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customer: CustomerDetails;
  config: BouquetConfig;
  quote: Quote;
  specialRequest: string;
  photoKey?: string;
  consent: boolean;
  campaign: Record<string, string>;
  summaryText: string;
  notifications: OrderNotifications;
  statusHistory: { status: OrderStatus; at: string; note?: string }[];
  adminNotes?: string;
};

/** Lightweight row kept in the order index for fast listing/search/export. */
export type OrderIndexEntry = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  name: string;
  phone: string;
  deliveryType: string;
  total: number;
  currency: string;
  totalFlowers: number;
  hasPhoto: boolean;
  notificationsFailed: boolean;
};

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

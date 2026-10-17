import { useEffect, useState } from "react";
import { AlertTriangle, KeyRound, Loader2, Save } from "lucide-react";
import type { Settings } from "../../../shared/types";
import { ApiError } from "../../lib/api";
import { fetchCatalog, saveCatalog } from "./adminApi";

export default function SettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isDefaultPassword, setIsDefaultPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  useEffect(() => {
    fetchCatalog()
      .then((res) => {
        setSettings(res.catalog.settings);
        setIsDefaultPassword(res.adminPasswordIsDefault);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load settings."));
  }, []);

  const update = (patch: Partial<Settings>) => setSettings((prev) => (prev ? { ...prev, ...patch } : prev));

  async function save() {
    if (!settings) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await saveCatalog({ settings });
      setSettings(res.catalog.settings);
      setMessage("Settings saved ✓");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await saveCatalog({ newPassword: next });
      setSettings(res.catalog.settings);
      setIsDefaultPassword(false);
      setNext("");
      setCurrent("");
      setMessage("Admin password changed ✓");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not change the password.");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="grid place-items-center py-24">
        {error ? <p className="text-sm text-red-600">{error}</p> : <Loader2 className="animate-spin text-blush-500" />}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {isDefaultPassword && (
        <div className="lg:col-span-2 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>
            You are still using the default dashboard password. Set your own password below (or set the{" "}
            <code>ADMIN_PASSWORD</code> environment variable in Netlify) before sharing the site.
          </p>
        </div>
      )}

      <section className="card-soft p-5">
        <h3 className="font-display text-xl">Business details</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Business name" value={settings.businessName} onChange={(v) => update({ businessName: v })} />
          <Field label="Tagline" value={settings.tagline} onChange={(v) => update({ tagline: v })} />
          <Field label="Contact phone" value={settings.contactPhone} onChange={(v) => update({ contactPhone: v })} />
          <Field
            label="WhatsApp number (with country code)"
            value={settings.whatsappNumber}
            onChange={(v) => update({ whatsappNumber: v.replace(/\D/g, "") })}
          />
          <Field label="Notification e-mail" value={settings.businessEmail} onChange={(v) => update({ businessEmail: v })} />
          <Field label="Address" value={settings.address} onChange={(v) => update({ address: v })} />
          <Field label="Facebook page URL" value={settings.facebookPageUrl} onChange={(v) => update({ facebookPageUrl: v })} />
          <Field label="Instagram URL" value={settings.instagramUrl} onChange={(v) => update({ instagramUrl: v })} />
          <Field label="Site URL (for links in e-mails)" value={settings.siteUrl} onChange={(v) => update({ siteUrl: v })} />
        </div>
      </section>

      <section className="card-soft p-5">
        <h3 className="font-display text-xl">Pricing &amp; currency</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Currency code" value={settings.currency.code} onChange={(v) => update({ currency: { ...settings.currency, code: v } })} />
          <Field label="Currency symbol" value={settings.currency.symbol} onChange={(v) => update({ currency: { ...settings.currency, symbol: v } })} />
          <NumField label="Base arrangement price" value={settings.basePrice} onChange={(v) => update({ basePrice: v })} />
          <NumField label="Books included in base" value={settings.includedBooks} onChange={(v) => update({ includedBooks: v })} />
          <NumField label="Extra book price" value={settings.extraBookPrice} onChange={(v) => update({ extraBookPrice: v })} />
          <NumField label="Note character limit" value={settings.noteCharLimit} onChange={(v) => update({ noteCharLimit: v })} />
          <NumField label="Printed note fee" value={settings.notePrintedFee} onChange={(v) => update({ notePrintedFee: v })} />
          <NumField label="Extra character fee" value={settings.noteExtraCharFee} onChange={(v) => update({ noteExtraCharFee: v })} />
          <NumField label="Discount %" value={settings.discountPercent} onChange={(v) => update({ discountPercent: v })} />
          <NumField label="Discount when subtotal over" value={settings.discountMinSubtotal} onChange={(v) => update({ discountMinSubtotal: v })} />
        </div>
      </section>

      <section className="card-soft p-5">
        <h3 className="font-display text-xl">Delivery rules</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Business timezone" value={settings.timezone} onChange={(v) => update({ timezone: v })} />
          <Field label="Same-day cutoff (HH:MM)" value={settings.expressCutoff} onChange={(v) => update({ expressCutoff: v })} />
        </div>
        <p className="mt-2 text-[0.72rem] text-brown-500">
          Express orders are accepted only before this time, in the timezone above. The fee itself is edited
          under Shop &amp; products → Delivery.
        </p>
      </section>

      <section className="card-soft p-5">
        <h3 className="font-display text-xl">Policies shown on the site</h3>
        <div className="mt-3 space-y-3">
          <TextArea label="Privacy summary" value={settings.privacySummary} onChange={(v) => update({ privacySummary: v })} />
          <TextArea label="Delivery policy" value={settings.deliveryPolicy} onChange={(v) => update({ deliveryPolicy: v })} />
          <TextArea label="Refund policy" value={settings.refundPolicy} onChange={(v) => update({ refundPolicy: v })} />
        </div>
      </section>

      <section className="card-soft p-5">
        <h3 className="font-display text-xl flex items-center gap-2">
          <KeyRound size={18} /> Dashboard password
        </h3>
        <p className="mt-1 text-[0.75rem] text-brown-500">
          The password is stored privately in Netlify Blobs — never in the browser.
        </p>
        <div className="mt-3 grid gap-3">
          <label>
            <span className="label">New password (min 8 characters)</span>
            <input
              type="password"
              className="field"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </label>
          <button
            type="button"
            className="btn btn-secondary btn-sm justify-self-start"
            disabled={saving || next.length < 8}
            onClick={changePassword}
          >
            Change password
          </button>
        </div>
      </section>

      <div className="lg:col-span-2 flex items-center gap-3">
        <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save all settings
        </button>
        {message && <span className="text-sm font-medium text-sage-700">{message}</span>}
        {error && <span className="text-sm font-medium text-red-600">{error}</span>}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="field py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input
        type="number"
        className="field py-2 text-sm"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label>
      <span className="label">{label}</span>
      <textarea className="field min-h-[90px] text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

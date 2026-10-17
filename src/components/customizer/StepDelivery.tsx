import { CalendarClock, Truck, MapPin, Phone, User, Mail, MessageCircle } from "lucide-react";
import { useBouquet } from "../../state/BouquetContext";
import { deliveryById, deliveryWindow, formatDate, formatMoney } from "../../../shared/pricing";
import StepShell from "./StepShell";

export default function StepDelivery() {
  const { state, dispatch, expressAvailable } = useBouquet();
  const catalog = state.catalog!;
  const s = catalog.settings;
  const config = state.config;
  const customer = state.customer;
  const errors = state.fieldErrors;

  return (
    <StepShell
      step={5}
      title="Delivery & your details"
      hint="Tell us where this bouquet is going and when you need it."
      error={errors.delivery}
    >
      <div className="grid gap-2.5">
        {catalog.deliveryOptions.map((option) => {
          const available = option.kind === "express" ? expressAvailable && option.available : option.available;
          const active = config.deliveryOptionId === option.id;
          const win = deliveryWindow(option, s);
          return (
            <button
              key={option.id}
              type="button"
              disabled={!available}
              onClick={() => dispatch({ type: "delivery", optionId: option.id })}
              aria-pressed={active}
              className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                active ? "border-blush-500 bg-blush-50 ring-2 ring-blush-200" : "border-black/10 bg-white"
              } ${!available ? "opacity-60" : ""}`}
            >
              <span className="flex items-start gap-3">
                <span
                  className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                    active ? "bg-blush-500 text-white" : "bg-sage-100 text-sage-700"
                  }`}
                >
                  {option.kind === "express" ? <Truck size={17} /> : <CalendarClock size={17} />}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{option.name}</span>
                  <span className="block text-[0.72rem] text-brown-500">{option.description}</span>
                  {!available && option.kind === "express" && (
                    <span className="mt-1 block text-[0.72rem] font-semibold text-amber-700">
                      Today's cutoff ({s.expressCutoff} {s.timezone.split("/")[1]?.replace("_", " ")}) has passed —
                      please choose standard delivery.
                    </span>
                  )}
                  {available && (
                    <span className="mt-1 block text-[0.72rem] text-sage-700">
                      Earliest date: {formatDate(win.expected, s.timezone)}
                    </span>
                  )}
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-brown-700">
                {option.fee > 0 ? formatMoney(s.currency, option.fee) : "Free"}
              </span>
            </button>
          );
        })}
      </div>

      {(() => {
        const option = deliveryById(catalog, config.deliveryOptionId);
        if (!option) return null;
        const win = deliveryWindow(option, s);
        return (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div data-field="delivery">
              <label className="label" htmlFor="delivery-date">
                Preferred delivery date
              </label>
              <input
                id="delivery-date"
                type="date"
                className="field"
                min={win.min}
                max={win.max}
                value={config.deliveryDate}
                onChange={(e) => dispatch({ type: "delivery-date", date: e.target.value })}
              />
              <p className="mt-1 text-[0.7rem] text-brown-500">
                Between {formatDate(win.min, s.timezone)} and {formatDate(win.max, s.timezone)}.
              </p>
            </div>
            <div>
              <label className="label" htmlFor="delivery-window">
                Time window
              </label>
              <select
                id="delivery-window"
                className="field"
                value={config.deliveryWindow}
                onChange={(e) => dispatch({ type: "delivery-window", window: e.target.value })}
              >
                {option.timeWindows.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      })()}

      <div className="divider my-7" />

      <h4 className="font-display text-xl">Who is receiving this bouquet?</h4>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Field icon={User} id="name" label="Your name" required error={errors.name}>
          <input
            id="name"
            data-field="name"
            className={`field ${errors.name ? "field-error" : ""}`}
            placeholder="e.g. Rafi Ahmed"
            autoComplete="name"
            value={customer.name}
            onChange={(e) => dispatch({ type: "customer", patch: { name: e.target.value } })}
          />
        </Field>

        <Field icon={Phone} id="phone" label="Phone number" required error={errors.phone}>
          <input
            id="phone"
            data-field="phone"
            className={`field ${errors.phone ? "field-error" : ""}`}
            placeholder="01XXXXXXXXX"
            inputMode="tel"
            autoComplete="tel"
            value={customer.phone}
            onChange={(e) => dispatch({ type: "customer", patch: { phone: e.target.value } })}
          />
        </Field>

        <Field icon={MessageCircle} id="whatsapp" label="WhatsApp number (if different)">
          <input
            id="whatsapp"
            className="field"
            placeholder="Only if it differs from your phone"
            inputMode="tel"
            value={customer.whatsapp}
            onChange={(e) => dispatch({ type: "customer", patch: { whatsapp: e.target.value } })}
          />
        </Field>

        <Field icon={Mail} id="email" label="E-mail (optional)">
          <input
            id="email"
            data-field="email"
            className={`field ${errors.email ? "field-error" : ""}`}
            placeholder="For your order confirmation"
            inputMode="email"
            autoComplete="email"
            value={customer.email}
            onChange={(e) => dispatch({ type: "customer", patch: { email: e.target.value } })}
          />
        </Field>

        <Field icon={MapPin} id="address" label="Delivery address" required error={errors.address} className="sm:col-span-2">
          <input
            id="address"
            data-field="address"
            className={`field ${errors.address ? "field-error" : ""}`}
            placeholder="House, road, area"
            autoComplete="street-address"
            value={customer.address}
            onChange={(e) => dispatch({ type: "customer", patch: { address: e.target.value } })}
          />
        </Field>

        <Field icon={MapPin} id="area" label="Area / district" required error={errors.area}>
          <input
            id="area"
            data-field="area"
            className={`field ${errors.area ? "field-error" : ""}`}
            placeholder="e.g. Dhanmondi, Dhaka"
            value={customer.area}
            onChange={(e) => dispatch({ type: "customer", patch: { area: e.target.value } })}
          />
        </Field>

        <Field icon={MessageCircle} id="instructions" label="Delivery instructions (optional)">
          <input
            id="instructions"
            className="field"
            placeholder="Gate code, best time to call…"
            value={customer.instructions}
            onChange={(e) => dispatch({ type: "customer", patch: { instructions: e.target.value } })}
          />
        </Field>
      </div>
    </StepShell>
  );
}

function Field({
  icon: Icon,
  id,
  label,
  required,
  error,
  className = "",
  children,
}: {
  icon: typeof User;
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="label flex items-center gap-1.5" htmlFor={id}>
        <Icon size={13} /> {label} {required && <span className="text-blush-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[0.72rem] font-medium text-red-600">{error}</p>}
    </div>
  );
}

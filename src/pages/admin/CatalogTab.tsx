import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import type { Accessory, Catalog, Flower, Package, WrappingColor, WrappingStyle } from "../../../shared/types";
import { ApiError } from "../../lib/api";
import { fetchCatalog, saveCatalog } from "./adminApi";
import { FlowerArt } from "../../components/preview/FlowerArt";

type Sub = "flowers" | "packages" | "wrapping" | "accessories" | "delivery";

const SUBS: { id: Sub; label: string }[] = [
  { id: "flowers", label: "Flowers" },
  { id: "packages", label: "Packages" },
  { id: "wrapping", label: "Wrapping" },
  { id: "accessories", label: "Gifts & extras" },
  { id: "delivery", label: "Delivery" },
];

export default function CatalogTab() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [sub, setSub] = useState<Sub>("flowers");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCatalog()
      .then((res) => setCatalog(res.catalog))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load the catalog."));
  }, []);

  async function save(patch: Partial<Catalog>, successText = "Saved ✓") {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await saveCatalog(patch);
      setCatalog(res.catalog);
      setMessage(successText);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  if (!catalog) {
    return (
      <div className="grid place-items-center py-24">
        {error ? <p className="text-sm text-red-600">{error}</p> : <Loader2 className="animate-spin text-blush-500" />}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <nav className="flex flex-wrap gap-1 rounded-full bg-white p-1 shadow-sm">
          {SUBS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSub(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                sub === item.id ? "bg-brown-700 text-white" : "text-brown-600 hover:bg-shell"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <span className="ml-auto text-xs text-brown-500">
          Changes are live for every customer the moment you save.
        </span>
      </div>

      {message && <p className="mt-3 text-sm font-medium text-sage-700">{message}</p>}
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-4">
        {sub === "flowers" && (
          <FlowersEditor
            flowers={catalog.flowers}
            saving={saving}
            onSave={(flowers) => save({ flowers }, "Flowers updated ✓")}
          />
        )}
        {sub === "packages" && (
          <PackagesEditor
            catalog={catalog}
            saving={saving}
            onSave={(packages) => save({ packages }, "Packages updated ✓")}
          />
        )}
        {sub === "wrapping" && (
          <WrappingEditor
            catalog={catalog}
            saving={saving}
            onSave={(wrapColors, wrapStyles) => save({ wrapColors, wrapStyles }, "Wrapping updated ✓")}
          />
        )}
        {sub === "accessories" && (
          <AccessoriesEditor
            accessories={catalog.accessories}
            saving={saving}
            onSave={(accessories) => save({ accessories }, "Gifts & extras updated ✓")}
          />
        )}
        {sub === "delivery" && (
          <DeliveryEditor
            catalog={catalog}
            saving={saving}
            onSave={(deliveryOptions) => save({ deliveryOptions }, "Delivery updated ✓")}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small form helpers                                                  */
/* ------------------------------------------------------------------ */

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button type="button" className="btn btn-primary btn-sm" disabled={saving} onClick={onClick}>
      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save changes
    </button>
  );
}

function TextInput({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="label">{label}</span>
      <input className="field py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function NumInput({
  label,
  value,
  onChange,
  min,
  className = "",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="label">{label}</span>
      <input
        type="number"
        className="field py-2 text-sm"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 pt-5 text-sm font-medium">
      <input type="checkbox" className="h-4 w-4 accent-[#5F7153]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Flowers                                                             */
/* ------------------------------------------------------------------ */

function FlowersEditor({
  flowers,
  saving,
  onSave,
}: {
  flowers: Flower[];
  saving: boolean;
  onSave: (flowers: Flower[]) => void;
}) {
  const [rows, setRows] = useState<Flower[]>(flowers);
  const update = (id: string, patch: Partial<Flower>) =>
    setRows((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((flower) => (
          <div key={flower.id} className="card-soft p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm">
                <FlowerArt art={flower.art} color={flower.colors[0]?.hex ?? "#eee"} accent={flower.colors[0]?.accent ?? "#ccc"} size={44} />
              </div>
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <TextInput label="Name" value={flower.name} onChange={(v) => update(flower.id, { name: v })} />
                <NumInput label="Price per stem" min={0} value={flower.pricePerStem} onChange={(v) => update(flower.id, { pricePerStem: v })} />
                <NumInput label="Sort order" min={0} value={flower.sortOrder} onChange={(v) => update(flower.id, { sortOrder: v })} />
                <Toggle label="Available" checked={flower.available} onChange={(v) => update(flower.id, { available: v })} />
              </div>
            </div>

            <p className="label mt-3">Colours</p>
            <div className="flex flex-wrap gap-2">
              {flower.colors.map((color, index) => (
                <div key={`${color.name}-${index}`} className="flex items-center gap-1.5 rounded-full border border-brown-200 bg-white py-1 pl-1 pr-2">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => {
                      const colors = [...flower.colors];
                      colors[index] = { ...color, hex: e.target.value };
                      update(flower.id, { colors });
                    }}
                    className="h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    aria-label={`Colour for ${color.name}`}
                  />
                  <input
                    className="w-20 border-0 bg-transparent text-xs outline-none"
                    value={color.name}
                    onChange={(e) => {
                      const colors = [...flower.colors];
                      colors[index] = { ...color, name: e.target.value };
                      update(flower.id, { colors });
                    }}
                  />
                  <button
                    type="button"
                    className="text-brown-400 hover:text-red-500"
                    onClick={() => update(flower.id, { colors: flower.colors.filter((_, i) => i !== index) })}
                    aria-label="Remove colour"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  update(flower.id, {
                    colors: [...flower.colors, { name: "New", hex: "#E8B4C2", accent: "#D19AAE" }],
                  })
                }
              >
                <Plus size={12} /> Add colour
              </button>
            </div>
          </div>
        ))}
      </div>
      <SaveButton saving={saving} onClick={() => onSave(rows)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Packages                                                            */
/* ------------------------------------------------------------------ */

function PackagesEditor({
  catalog,
  saving,
  onSave,
}: {
  catalog: Catalog;
  saving: boolean;
  onSave: (packages: Package[]) => void;
}) {
  const [rows, setRows] = useState<Package[]>(catalog.packages);
  const update = (id: string, patch: Partial<Package>) =>
    setRows((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <div className="space-y-4">
      {rows.map((pkg) => (
        <div key={pkg.id} className="card-soft p-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <TextInput label="Name" value={pkg.name} onChange={(v) => update(pkg.id, { name: v })} />
            <TextInput label="Tagline" value={pkg.tagline} onChange={(v) => update(pkg.id, { tagline: v })} />
            <NumInput
              label="Fixed price (blank = calculated)"
              min={0}
              value={pkg.priceOverride ?? 0}
              onChange={(v) => update(pkg.id, { priceOverride: v > 0 ? v : null })}
            />
            <Toggle label="Active" checked={pkg.active} onChange={(v) => update(pkg.id, { active: v })} />
          </div>

          <TextInput
            label="Description"
            className="mt-2 block"
            value={pkg.description}
            onChange={(v) => update(pkg.id, { description: v })}
          />

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <NumInput
              label="Books"
              min={0}
              value={pkg.config.books}
              onChange={(v) => update(pkg.id, { config: { ...pkg.config, books: v } })}
            />
            <label>
              <span className="label">Wrapping colour</span>
              <select
                className="field py-2 text-sm"
                value={pkg.config.wrapColorId}
                onChange={(e) => update(pkg.id, { config: { ...pkg.config, wrapColorId: e.target.value } })}
              >
                {catalog.wrapColors.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Wrapping style</span>
              <select
                className="field py-2 text-sm"
                value={pkg.config.wrapStyleId}
                onChange={(e) => update(pkg.id, { config: { ...pkg.config, wrapStyleId: e.target.value } })}
              >
                {catalog.wrapStyles.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="label mt-3">Flowers in this package</p>
          <div className="space-y-1.5">
            {pkg.config.flowers.map((sel, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  className="field w-auto py-1.5 text-sm"
                  value={sel.flowerId}
                  onChange={(e) => {
                    const flowers = [...pkg.config.flowers];
                    flowers[index] = { ...sel, flowerId: e.target.value };
                    update(pkg.id, { config: { ...pkg.config, flowers } });
                  }}
                >
                  {catalog.flowers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  className="field w-20 py-1.5 text-sm"
                  value={sel.qty}
                  onChange={(e) => {
                    const flowers = [...pkg.config.flowers];
                    flowers[index] = { ...sel, qty: Number(e.target.value) };
                    update(pkg.id, { config: { ...pkg.config, flowers } });
                  }}
                />
                <button
                  type="button"
                  className="text-brown-400 hover:text-red-500"
                  onClick={() =>
                    update(pkg.id, {
                      config: { ...pkg.config, flowers: pkg.config.flowers.filter((_, i) => i !== index) },
                    })
                  }
                  aria-label="Remove flower"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() =>
                update(pkg.id, {
                  config: {
                    ...pkg.config,
                    flowers: [
                      ...pkg.config.flowers,
                      { flowerId: catalog.flowers[0]?.id ?? "", qty: 1, color: catalog.flowers[0]?.defaultColor },
                    ],
                  },
                })
              }
            >
              <Plus size={12} /> Add flower
            </button>
          </div>

          <p className="label mt-3">Included list (shown on the card)</p>
          <div className="space-y-1.5">
            {pkg.included.map((line, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  className="field py-1.5 text-sm"
                  value={line.label}
                  onChange={(e) => {
                    const included = [...pkg.included];
                    included[index] = { ...line, label: e.target.value };
                    update(pkg.id, { included });
                  }}
                />
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-[#5F7153]"
                    checked={line.priced}
                    onChange={(e) => {
                      const included = [...pkg.included];
                      included[index] = { ...line, priced: e.target.checked };
                      update(pkg.id, { included });
                    }}
                  />
                  priced
                </label>
                <button
                  type="button"
                  className="text-brown-400 hover:text-red-500"
                  onClick={() => update(pkg.id, { included: pkg.included.filter((_, i) => i !== index) })}
                  aria-label="Remove line"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => update(pkg.id, { included: [...pkg.included, { label: "New item", priced: true }] })}
            >
              <Plus size={12} /> Add line
            </button>
          </div>
        </div>
      ))}
      <SaveButton saving={saving} onClick={() => onSave(rows)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Wrapping                                                            */
/* ------------------------------------------------------------------ */

function WrappingEditor({
  catalog,
  saving,
  onSave,
}: {
  catalog: Catalog;
  saving: boolean;
  onSave: (colors: WrappingColor[], styles: WrappingStyle[]) => void;
}) {
  const [colors, setColors] = useState<WrappingColor[]>(catalog.wrapColors);
  const [styles, setStyles] = useState<WrappingStyle[]>(catalog.wrapStyles);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card-soft p-4">
        <h3 className="font-display text-xl">Wrapping papers</h3>
        <div className="mt-3 space-y-2">
          {colors.map((wrap, index) => (
            <div key={wrap.id} className="flex items-center gap-2">
              <input
                type="color"
                value={wrap.hex}
                onChange={(e) => {
                  const next = [...colors];
                  next[index] = { ...wrap, hex: e.target.value };
                  setColors(next);
                }}
                className="h-8 w-8 rounded-lg border-0 bg-transparent p-0"
                aria-label={`Colour of ${wrap.name}`}
              />
              <input
                className="field w-40 py-1.5 text-sm"
                value={wrap.name}
                onChange={(e) => {
                  const next = [...colors];
                  next[index] = { ...wrap, name: e.target.value };
                  setColors(next);
                }}
              />
              <input
                type="number"
                className="field w-24 py-1.5 text-sm"
                value={wrap.price}
                onChange={(e) => {
                  const next = [...colors];
                  next[index] = { ...wrap, price: Number(e.target.value) };
                  setColors(next);
                }}
              />
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-[#5F7153]"
                  checked={wrap.available}
                  onChange={(e) => {
                    const next = [...colors];
                    next[index] = { ...wrap, available: e.target.checked };
                    setColors(next);
                  }}
                />
                on
              </label>
              <button
                type="button"
                className="text-brown-400 hover:text-red-500"
                onClick={() => setColors(colors.filter((_, i) => i !== index))}
                aria-label="Remove paper"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() =>
              setColors([
                ...colors,
                {
                  id: `paper-${Date.now()}`,
                  name: "New paper",
                  hex: "#F4CBD7",
                  price: 0,
                  available: true,
                },
              ])
            }
          >
            <Plus size={12} /> Add paper
          </button>
        </div>
      </div>

      <div className="card-soft p-4">
        <h3 className="font-display text-xl">Wrapping styles</h3>
        <div className="mt-3 space-y-3">
          {styles.map((style, index) => (
            <div key={style.id} className="rounded-xl border border-brown-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <input
                  className="field w-44 py-1.5 text-sm"
                  value={style.name}
                  onChange={(e) => {
                    const next = [...styles];
                    next[index] = { ...style, name: e.target.value };
                    setStyles(next);
                  }}
                />
                <input
                  type="number"
                  className="field w-24 py-1.5 text-sm"
                  value={style.price}
                  onChange={(e) => {
                    const next = [...styles];
                    next[index] = { ...style, price: Number(e.target.value) };
                    setStyles(next);
                  }}
                />
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-[#5F7153]"
                    checked={style.available}
                    onChange={(e) => {
                      const next = [...styles];
                      next[index] = { ...style, available: e.target.checked };
                      setStyles(next);
                    }}
                  />
                  on
                </label>
                <button
                  type="button"
                  className="ml-auto text-brown-400 hover:text-red-500"
                  onClick={() => setStyles(styles.filter((_, i) => i !== index))}
                  aria-label="Remove style"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <input
                className="field mt-2 py-1.5 text-sm"
                value={style.description}
                onChange={(e) => {
                  const next = [...styles];
                  next[index] = { ...style, description: e.target.value };
                  setStyles(next);
                }}
              />
            </div>
          ))}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() =>
              setStyles([
                ...styles,
                {
                  id: `style-${Date.now()}`,
                  name: "New style",
                  description: "",
                  price: 0,
                  available: true,
                },
              ])
            }
          >
            <Plus size={12} /> Add style
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <SaveButton saving={saving} onClick={() => onSave(colors, styles)} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Accessories                                                         */
/* ------------------------------------------------------------------ */

function AccessoriesEditor({
  accessories,
  saving,
  onSave,
}: {
  accessories: Accessory[];
  saving: boolean;
  onSave: (accessories: Accessory[]) => void;
}) {
  const [rows, setRows] = useState<Accessory[]>(accessories);
  const update = (index: number, patch: Partial<Accessory>) =>
    setRows((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {rows.map((acc, index) => (
          <div key={acc.id} className="card-soft flex flex-wrap items-end gap-2 p-3">
            <TextInput label="Name" className="w-44" value={acc.name} onChange={(v) => update(index, { name: v })} />
            <label className="w-36">
              <span className="label">Category</span>
              <select
                className="field py-2 text-sm"
                value={acc.category}
                onChange={(e) => update(index, { category: e.target.value as Accessory["category"] })}
              >
                <option value="gift">Gift</option>
                <option value="tag">Tag / card</option>
                <option value="accessory">Accessory</option>
              </select>
            </label>
            <NumInput label="Price" min={0} className="w-24" value={acc.price} onChange={(v) => update(index, { price: v })} />
            <TextInput
              label="Description"
              className="min-w-[12rem] flex-1"
              value={acc.description ?? ""}
              onChange={(v) => update(index, { description: v })}
            />
            <Toggle label="Available" checked={acc.available} onChange={(v) => update(index, { available: v })} />
            <button
              type="button"
              className="pb-3 text-brown-400 hover:text-red-500"
              onClick={() => setRows(rows.filter((_, i) => i !== index))}
              aria-label="Remove item"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() =>
            setRows([
              ...rows,
              {
                id: `item-${Date.now()}`,
                name: "New gift",
                category: "gift",
                price: 100,
                available: true,
                description: "",
              },
            ])
          }
        >
          <Plus size={12} /> Add item
        </button>
        <SaveButton saving={saving} onClick={() => onSave(rows)} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Delivery                                                            */
/* ------------------------------------------------------------------ */

function DeliveryEditor({
  catalog,
  saving,
  onSave,
}: {
  catalog: Catalog;
  saving: boolean;
  onSave: (options: Catalog["deliveryOptions"]) => void;
}) {
  const [rows, setRows] = useState(catalog.deliveryOptions);
  const update = (index: number, patch: Partial<Catalog["deliveryOptions"][number]>) =>
    setRows((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));

  return (
    <div className="space-y-3">
      {rows.map((option, index) => (
        <div key={option.id} className="card-soft p-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <TextInput label="Name" value={option.name} onChange={(v) => update(index, { name: v })} />
            <NumInput label="Fee" min={0} value={option.fee} onChange={(v) => update(index, { fee: v })} />
            <NumInput
              label="Within (days)"
              min={0}
              value={option.withinDays}
              onChange={(v) => update(index, { withinDays: v })}
            />
            <Toggle label="Available" checked={option.available} onChange={(v) => update(index, { available: v })} />
          </div>
          <TextInput
            label="Description"
            className="mt-2 block"
            value={option.description}
            onChange={(v) => update(index, { description: v })}
          />
          <TextInput
            label="Time windows (comma separated)"
            className="mt-2 block"
            value={option.timeWindows.join(", ")}
            onChange={(v) => update(index, { timeWindows: v.split(",").map((w) => w.trim()).filter(Boolean) })}
          />
        </div>
      ))}
      <SaveButton saving={saving} onClick={() => onSave(rows)} />
    </div>
  );
}

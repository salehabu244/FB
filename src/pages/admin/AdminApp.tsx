import { useEffect, useState } from "react";
import { ClipboardList, Loader2, LogOut, PackageSearch, Settings2 } from "lucide-react";
import { LogoMark } from "../../components/Header";
import { checkAuth, login, logout } from "./adminApi";
import { ApiError } from "../../lib/api";
import OrdersTab from "./OrdersTab";
import CatalogTab from "./CatalogTab";
import SettingsTab from "./SettingsTab";

type Tab = "orders" | "catalog" | "settings";

const TABS: { id: Tab; label: string; icon: typeof ClipboardList }[] = [
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "catalog", label: "Shop & products", icon: PackageSearch },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export default function AdminApp() {
  const [phase, setPhase] = useState<"loading" | "anon" | "ok">("loading");
  const [tab, setTab] = useState<Tab>("orders");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    checkAuth()
      .then((res) => setPhase(res.authenticated ? "ok" : "anon"))
      .catch(() => setPhase("anon"));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(password);
      setPhase("ok");
      setPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    try {
      await logout();
    } finally {
      setPhase("anon");
    }
  }

  if (phase === "loading") {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="animate-spin text-blush-500" />
      </div>
    );
  }

  if (phase === "anon") {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-b from-cream to-shell/60 px-4">
        <form onSubmit={onSubmit} className="card w-full max-w-sm p-8">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <div>
              <h1 className="font-display text-2xl leading-none">Owner sign in</h1>
              <p className="text-xs text-brown-500">Bloom &amp; Beyond dashboard</p>
            </div>
          </div>

          <label className="label mt-6" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="field"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}

          <button type="submit" className="btn btn-primary mt-5 w-full" disabled={busy || !password}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : null} Sign in
          </button>

          <p className="mt-4 text-center text-[0.7rem] text-brown-500">
            Default password: <code className="rounded bg-shell px-1">BloomBeyond2026</code> — change it in
            Settings (or set <code>ADMIN_PASSWORD</code> in Netlify).
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 border-b border-brown-700/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <LogoMark size={32} />
            <div>
              <h1 className="font-display text-xl leading-none">Dashboard</h1>
              <p className="text-[0.66rem] uppercase tracking-[0.18em] text-brown-500">Bloom &amp; Beyond</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex gap-1 rounded-full bg-white p-1 shadow-sm">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    tab === item.id ? "bg-blush-600 text-white" : "text-brown-600 hover:bg-blush-50"
                  }`}
                >
                  <item.icon size={13} />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </nav>
            <a href="/" className="btn btn-ghost btn-sm hidden sm:inline-flex">
              View shop
            </a>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onLogout}>
              <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {tab === "orders" && <OrdersTab />}
        {tab === "catalog" && <CatalogTab />}
        {tab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}

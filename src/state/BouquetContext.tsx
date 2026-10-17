import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  BouquetConfig,
  Catalog,
  CustomerDetails,
  NoteType,
} from "../../shared/types";
import {
  computeQuote,
  countFlowers,
  defaultBouquetConfig,
  deliveryById,
  deliveryWindow,
  isOptionAvailable,
} from "../../shared/pricing";
import { ApiError, apiGet, apiSend, FN, type CatalogResponse, type CreateOrderResponse } from "../lib/api";
import { captureCampaign, setAnalyticsConsent, trackPurchase } from "../lib/analytics";

export const EMPTY_CUSTOMER: CustomerDetails = {
  name: "",
  phone: "",
  email: "",
  whatsapp: "",
  address: "",
  area: "",
  instructions: "",
};

type State = {
  phase: "loading" | "ready" | "error";
  loadError: string;
  catalog: Catalog | null;
  expressAvailable: boolean;
  config: BouquetConfig;
  customer: CustomerDetails;
  specialRequest: string;
  photoKey?: string;
  photoUrl?: string;
  consent: boolean;
  analyticsConsent: boolean;
  step: number;
  activePackageId?: string;
  submitting: boolean;
  submitError?: string;
  fieldErrors: Record<string, string>;
};

type Action =
  | { type: "loaded"; catalog: Catalog; expressAvailable: boolean }
  | { type: "load-error"; message: string }
  | { type: "flower-qty"; flowerId: string; qty: number }
  | { type: "flower-color"; flowerId: string; color: string }
  | { type: "books"; books: number }
  | { type: "book-titles"; value: string }
  | { type: "wrap-color"; id: string }
  | { type: "wrap-style"; id: string }
  | { type: "note"; patch: Partial<BouquetConfig["note"]> }
  | { type: "gift-qty"; id: string; qty: number }
  | { type: "delivery"; optionId: string }
  | { type: "delivery-date"; date: string }
  | { type: "delivery-window"; window: string }
  | { type: "customer"; patch: Partial<CustomerDetails> }
  | { type: "special"; value: string }
  | { type: "photo"; key?: string; url?: string }
  | { type: "consent"; value: boolean }
  | { type: "analytics-consent"; value: boolean }
  | { type: "step"; step: number }
  | { type: "apply-package"; config: BouquetConfig; packageId: string }
  | { type: "reset" }
  | { type: "submit-start" }
  | { type: "submit-error"; message: string; fields?: Record<string, string> }
  | { type: "submit-done" };

function initialConfig(): BouquetConfig {
  return {
    flowers: [],
    books: 2,
    bookTitles: "",
    wrapColorId: "blush-pink",
    wrapStyleId: "classic",
    note: { type: "handwritten", message: "", from: "", to: "" },
    gifts: [],
    deliveryOptionId: "",
    deliveryDate: "",
    deliveryWindow: "",
  };
}

const initialState: State = {
  phase: "loading",
  loadError: "",
  catalog: null,
  expressAvailable: false,
  config: initialConfig(),
  customer: EMPTY_CUSTOMER,
  specialRequest: "",
  consent: false,
  analyticsConsent: false,
  step: 1,
  submitting: false,
  fieldErrors: {},
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function withDeliveryDefaults(config: BouquetConfig, catalog: Catalog, optionId: string): BouquetConfig {
  const option = deliveryById(catalog, optionId);
  const win = option ? deliveryWindow(option, catalog.settings) : undefined;
  return {
    ...config,
    deliveryOptionId: optionId,
    deliveryDate: win?.expected ?? "",
    deliveryWindow: option?.timeWindows[0] ?? "",
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loaded": {
      const config = defaultBouquetConfig(action.catalog);
      return {
        ...state,
        phase: "ready",
        catalog: action.catalog,
        expressAvailable: action.expressAvailable,
        config,
      };
    }
    case "load-error":
      return { ...state, phase: "error", loadError: action.message };

    case "flower-qty": {
      const flower = state.catalog?.flowers.find((f) => f.id === action.flowerId);
      const existing = state.config.flowers.find((f) => f.flowerId === action.flowerId);
      const qty = clamp(action.qty, 0, 50);
      let flowers = state.config.flowers;
      if (qty === 0) {
        flowers = flowers.filter((f) => f.flowerId !== action.flowerId);
      } else if (existing) {
        flowers = flowers.map((f) => (f.flowerId === action.flowerId ? { ...f, qty } : f));
      } else if (flower) {
        flowers = [...flowers, { flowerId: flower.id, qty, color: flower.defaultColor }];
      }
      return { ...state, config: { ...state.config, flowers }, activePackageId: undefined };
    }

    case "flower-color": {
      const flowers = state.config.flowers.map((f) =>
        f.flowerId === action.flowerId ? { ...f, color: action.color } : f,
      );
      return { ...state, config: { ...state.config, flowers } };
    }

    case "books":
      return {
        ...state,
        config: { ...state.config, books: clamp(action.books, 0, 10) },
        activePackageId: undefined,
      };
    case "book-titles":
      return { ...state, config: { ...state.config, bookTitles: action.value.slice(0, 300) } };
    case "wrap-color":
      return { ...state, config: { ...state.config, wrapColorId: action.id } };
    case "wrap-style":
      return { ...state, config: { ...state.config, wrapStyleId: action.id } };
    case "note":
      return { ...state, config: { ...state.config, note: { ...state.config.note, ...action.patch } } };
    case "gift-qty": {
      const qty = clamp(action.qty, 0, 20);
      const existing = state.config.gifts.find((g) => g.id === action.id);
      let gifts = state.config.gifts;
      if (qty === 0) gifts = gifts.filter((g) => g.id !== action.id);
      else if (existing) gifts = gifts.map((g) => (g.id === action.id ? { ...g, qty } : g));
      else gifts = [...gifts, { id: action.id, qty }];
      return { ...state, config: { ...state.config, gifts }, activePackageId: undefined };
    }
    case "delivery": {
      if (!state.catalog) return state;
      return { ...state, config: withDeliveryDefaults(state.config, state.catalog, action.optionId) };
    }
    case "delivery-date":
      return { ...state, config: { ...state.config, deliveryDate: action.date } };
    case "delivery-window":
      return { ...state, config: { ...state.config, deliveryWindow: action.window } };
    case "customer":
      return { ...state, customer: { ...state.customer, ...action.patch } };
    case "special":
      return { ...state, specialRequest: action.value.slice(0, 2000) };
    case "photo":
      return { ...state, photoKey: action.key, photoUrl: action.url };
    case "consent":
      return { ...state, consent: action.value, fieldErrors: { ...state.fieldErrors, consent: "" } };
    case "analytics-consent":
      setAnalyticsConsent(action.value);
      return { ...state, analyticsConsent: action.value };
    case "step":
      return { ...state, step: action.step };
    case "apply-package":
      return { ...state, config: action.config, activePackageId: action.packageId, step: 1 };
    case "reset":
      return state.catalog
        ? { ...state, config: defaultBouquetConfig(state.catalog), activePackageId: undefined }
        : state;
    case "submit-start":
      return { ...state, submitting: true, submitError: undefined, fieldErrors: {} };
    case "submit-error":
      return {
        ...state,
        submitting: false,
        submitError: action.message,
        fieldErrors: action.fields ?? {},
      };
    case "submit-done":
      return { ...state, submitting: false };
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

type Ctx = {
  state: State;
  dispatch: React.Dispatch<Action>;
  quote: ReturnType<typeof computeQuote> | null;
  totalFlowers: number;
  expressAvailable: boolean;
  activeOptionAvailable: boolean;
  submit: () => Promise<CreateOrderResponse | null>;
  idempotencyKey: string;
};

export const BouquetContext = createContext<Ctx | null>(null);

export function BouquetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [idempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `k-${Math.random().toString(36).slice(2)}-${Date.now()}`,
  );
  const sessionRef = useRef<Record<string, string>>({});

  useEffect(() => {
    sessionRef.current = captureCampaign();
    let cancelled = false;
    apiGet<CatalogResponse>(`${FN}/catalog`)
      .then((res) => {
        if (!cancelled) dispatch({ type: "loaded", catalog: res.catalog, expressAvailable: res.expressAvailable });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          dispatch({
            type: "load-error",
            message:
              err instanceof Error
                ? err.message
                : "We could not load the shop. Please refresh the page.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const quote = useMemo(
    () => (state.catalog ? computeQuote(state.config, state.catalog) : null),
    [state.catalog, state.config],
  );

  const totalFlowers = countFlowers(state.config);

  const activeOptionAvailable = useMemo(() => {
    if (!state.catalog) return false;
    const option = deliveryById(state.catalog, state.config.deliveryOptionId);
    return option ? isOptionAvailable(option, state.catalog.settings) : false;
  }, [state.catalog, state.config.deliveryOptionId]);

  const submit = useCallback(async () => {
    if (!state.catalog) return null;
    dispatch({ type: "submit-start" });
    try {
      const payload = {
        config: state.config,
        customer: state.customer,
        specialRequest: state.specialRequest,
        photoKey: state.photoKey,
        consent: state.consent,
        campaign: sessionRef.current,
        idempotencyKey,
      };
      const res = await apiSend<CreateOrderResponse>(`${FN}/orders`, "POST", payload);
      dispatch({ type: "submit-done" });
      trackPurchase(res.order.id, res.order.total, res.order.currency.code);
      return res;
    } catch (err) {
      if (err instanceof ApiError) {
        dispatch({ type: "submit-error", message: err.message, fields: err.fields });
        const first = Object.keys(err.fields ?? {})[0];
        if (first) {
          const el = document.querySelector<HTMLElement>(`[data-field="${first}"]`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        dispatch({
          type: "submit-error",
          message:
            "We could not place the order. Nothing was charged — please check your connection and try again.",
        });
      }
      return null;
    }
  }, [state.catalog, state.config, state.customer, state.specialRequest, state.photoKey, state.consent, idempotencyKey]);

  const value: Ctx = {
    state,
    dispatch,
    quote,
    totalFlowers,
    expressAvailable: state.expressAvailable,
    activeOptionAvailable,
    submit,
    idempotencyKey,
  };

  return <BouquetContext.Provider value={value}>{children}</BouquetContext.Provider>;
}

export function useBouquet(): Ctx {
  const ctx = useContext(BouquetContext);
  if (!ctx) throw new Error("useBouquet must be used inside <BouquetProvider>");
  return ctx;
}

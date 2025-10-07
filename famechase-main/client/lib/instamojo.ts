const INSTAMOJO_SCRIPT_URL = "https://js.instamojo.com/v1/checkout.js";

let scriptPromise: Promise<void> | null = null;
let scriptLoaded = false;

declare global {
  interface Window {
    Instamojo?: {
      open: (checkoutUrl: string) => void;
    };
  }
}

export interface InstamojoCheckoutParams {
  amount: number;
  purpose: string;
  name?: string;
  email?: string;
  phone?: string;
  redirectUrl?: string;
  notes?: Record<string, string | number>;
  allowRepeatedPayments?: boolean;
  lockAmount?: boolean;
}

export const ensureInstamojoScript = async (): Promise<void> => {
  if (scriptLoaded) {
    return;
  }

  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${INSTAMOJO_SCRIPT_URL}"]`,
      );

      if (existing) {
        if (existing.dataset.loaded === "true") {
          scriptLoaded = true;
          resolve();
          return;
        }
        existing.addEventListener("load", () => {
          existing.dataset.loaded = "true";
          scriptLoaded = true;
          resolve();
        });
        existing.addEventListener("error", (event) => {
          reject(new Error(`Instamojo script failed: ${event}`));
        });
        return;
      }

      const script = document.createElement("script");
      script.src = INSTAMOJO_SCRIPT_URL;
      script.async = true;
      script.dataset.loaded = "false";
      script.onload = () => {
        script.dataset.loaded = "true";
        scriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error("Failed to load Instamojo checkout script"));
      };
      document.body.appendChild(script);
    }).catch((error) => {
      scriptPromise = null;
      throw error;
    });
  }

  await scriptPromise;
};

export const buildInstamojoCheckoutUrl = (
  baseUrl: string,
  params: InstamojoCheckoutParams,
): string => {
  const url = new URL(baseUrl);
  const searchParams = url.searchParams;

  searchParams.set("embed", "form");
  searchParams.set("amount", params.amount.toFixed(2));
  searchParams.set("purpose", params.purpose);
  if (params.lockAmount === false) {
    searchParams.delete("data_readonly");
  } else {
    searchParams.set("data_readonly", "amount");
  }
  searchParams.set(
    "allow_repeated_payments",
    params.allowRepeatedPayments ? "true" : "false",
  );

  if (params.name) {
    searchParams.set("name", params.name);
    searchParams.set("data_name", params.name);
  }
  if (params.email) {
    searchParams.set("email", params.email);
    searchParams.set("data_email", params.email);
  }
  if (params.phone) {
    searchParams.set("phone", params.phone);
    searchParams.set("data_phone", params.phone);
  }
  if (params.redirectUrl) {
    searchParams.set("redirect_url", params.redirectUrl);
  }

  if (params.notes) {
    Object.entries(params.notes).forEach(([key, value]) => {
      searchParams.set(`data_${key}`, String(value));
    });
  }

  url.search = searchParams.toString();
  return url.toString();
};

export const openInstamojoCheckout = async (
  checkoutUrl: string,
): Promise<void> => {
  try {
    await ensureInstamojoScript();
  } catch (error) {
    console.warn("Falling back to direct navigation for Instamojo", error);
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    return;
  }

  if (window.Instamojo && typeof window.Instamojo.open === "function") {
    window.Instamojo.open(checkoutUrl);
    return;
  }

  window.open(checkoutUrl, "_blank", "noopener,noreferrer");
};

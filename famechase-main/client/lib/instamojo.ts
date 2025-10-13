const INSTAMOJO_SCRIPT_URL = "https://js.instamojo.com/v1/checkout.js";

let scriptPromise: Promise<void> | null = null;
let scriptLoaded = false;

declare global {
  interface Window {
    Instamojo?: {
      open: (checkoutUrl: string) => void;
      configure?: (options: {
        handlers?: {
          onOpen?: () => void;
          onClose?: () => void;
          onSuccess?: (response?: any) => void;
          onFailure?: (response?: any) => void;
        };
      }) => void;
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
  mode?: "popup" | "embed"; // default: popup
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

  // Only use embed=form when explicitly requested
  const mode = params.mode || "popup";
  if (mode === "embed") {
    searchParams.set("embed", "form");
  }

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
  handlers?: {
    onOpen?: () => void;
    onClose?: () => void;
    onSuccess?: (response?: any) => void;
    onFailure?: (response?: any) => void;
  },
): Promise<void> => {
  // If caller passed an embed URL, render it in our own overlay iframe
  const isEmbed = /[?&]embed=form(&|$)/.test(checkoutUrl);
  if (isEmbed) {
    const overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "9999",
    });

    const frameWrapper = document.createElement("div");
    Object.assign(frameWrapper.style, {
      width: "100%",
      maxWidth: "520px",
      height: "700px",
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
      overflow: "hidden",
      position: "relative",
    });

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "×";
    Object.assign(closeBtn.style, {
      position: "absolute",
      top: "6px",
      right: "12px",
      fontSize: "28px",
      lineHeight: "1",
      background: "transparent",
      border: "none",
      color: "#333",
      cursor: "pointer",
      zIndex: "2",
    });

    const iframe = document.createElement("iframe");
    iframe.src = checkoutUrl;
    iframe.title = "Secure payment";
    iframe.allow = "payment *; clipboard-write";
    iframe.frameBorder = "0";
    Object.assign(iframe.style, {
      width: "100%",
      height: "100%",
      border: "0",
      display: "block",
    });

    const closeOverlay = () => {
      try { handlers?.onClose?.(); } catch {}
      overlay.remove();
    };

    closeBtn.addEventListener("click", closeOverlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeOverlay();
    });
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape") closeOverlay();
      },
      { once: true },
    );

    try { handlers?.onOpen?.(); } catch {}

    frameWrapper.appendChild(closeBtn);
    frameWrapper.appendChild(iframe);
    overlay.appendChild(frameWrapper);
    document.body.appendChild(overlay);
    return;
  }

  // Default: use Instamojo JS popup
  try {
    await ensureInstamojoScript();
  } catch (error) {
    console.warn("Falling back to direct navigation for Instamojo", error);
    window.location.href = checkoutUrl;
    return;
  }

  if (window.Instamojo && typeof window.Instamojo.open === "function") {
    try {
      if (typeof window.Instamojo.configure === "function" && handlers) {
        window.Instamojo.configure({ handlers });
      }
    } catch (e) {}
    window.Instamojo.open(checkoutUrl);
    return;
  }

  window.location.href = checkoutUrl;
};

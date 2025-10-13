import CryptoJS from "crypto-js";

// PayU Configuration
const PAYU_CONFIG = {
  merchantKey: import.meta.env.VITE_PAYU_MERCHANT_KEY || "WBtjxn",
  salt: import.meta.env.VITE_PAYU_SALT || "Ui1z2GLGDx7sUixAtCdl42",
  baseUrl:
    import.meta.env.VITE_PAYU_BASE_URL || "https://test.payu.in/_payment",
  mode: import.meta.env.VITE_PAYU_MODE || "test",
};

// UPI App Configuration
const UPI_APPS = {
  phonepe: {
    name: "PhonePe",
    appScheme: "phonepe://",
    webFallback: "https://phon.pe/",
  },
  googlepay: {
    name: "Google Pay",
    appScheme: "tez://upi/",
    webFallback: "https://pay.google.com/",
  },
  paytm: {
    name: "Paytm",
    appScheme: "paytmmp://",
    webFallback: "https://paytm.com/",
  },
  bhim: {
    name: "BHIM",
    appScheme: "bhim://",
    webFallback: "https://www.bhimupi.org.in/",
  },
};

export interface PayUPaymentData {
  txnid: string;
  amount: number;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string; // Success URL
  furl: string; // Failure URL
  hash?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

export interface PayUResponse {
  mihpayid: string;
  mode: string;
  status: string;
  unmappedstatus: string;
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  lastname: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  email: string;
  phone: string;
  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
  field6: string;
  field7: string;
  field8: string;
  field9: string;
  error: string;
  error_Message: string;
  net_amount_debit: string;
  disc: string;
  addedon: string;
  payment_source: string;
  PG_TYPE: string;
  bank_ref_num: string;
  bankcode: string;
  cardnum: string;
  hash: string;
}

// Generate transaction ID
export function generateTransactionId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `FAMECHASE_${timestamp}_${random}`.toUpperCase();
}

// Generate hash for PayU
export function generatePayUHash(paymentData: PayUPaymentData): string {
  const { merchantKey, salt } = PAYU_CONFIG;

  const hashString = [
    merchantKey,
    paymentData.txnid,
    paymentData.amount,
    paymentData.productinfo,
    paymentData.firstname,
    paymentData.email,
    paymentData.udf1 || "",
    paymentData.udf2 || "",
    paymentData.udf3 || "",
    paymentData.udf4 || "",
    paymentData.udf5 || "",
    salt,
  ].join("|");

  return CryptoJS.SHA512(hashString).toString();
}

// Verify response hash
export function verifyPayUResponse(response: PayUResponse): boolean {
  const { merchantKey, salt } = PAYU_CONFIG;

  const hashString = [
    salt,
    response.status,
    response.udf5 || "",
    response.udf4 || "",
    response.udf3 || "",
    response.udf2 || "",
    response.udf1 || "",
    response.email,
    response.firstname,
    response.productinfo,
    response.amount,
    response.txnid,
    merchantKey,
  ].join("|");

  const calculatedHash = CryptoJS.SHA512(hashString).toString();
  return calculatedHash === response.hash;
}

// Create PayU payment form
export function createPayUForm(paymentData: PayUPaymentData): HTMLFormElement {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = PAYU_CONFIG.baseUrl;

  // Add hash to payment data
  const dataWithHash = {
    ...paymentData,
    hash: generatePayUHash(paymentData),
    key: PAYU_CONFIG.merchantKey,
  };

  // Create form fields
  Object.entries(dataWithHash).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value.toString();
    form.appendChild(input);
  });

  return form;
}

// Handle UPI app payment with fallback
export async function handleUpiAppPayment(
  appName: keyof typeof UPI_APPS,
  paymentUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    const app = UPI_APPS[appName];
    
    if (!app) {
      throw new Error(`Unknown UPI app: ${appName}`);
    }

    console.log(`Attempting to open ${app.name}...`);

    // Try to open the app
    const appOpened = await attemptAppOpen(paymentUrl);

    if (appOpened) {
      return {
        success: true,
        message: `Opening ${app.name}...`,
      };
    } else {
      // Fallback to web version
      console.log(`${app.name} app not available, using web fallback`);
      window.location.href = paymentUrl;
      
      return {
        success: true,
        message: `Redirecting to payment page...`,
      };
    }
  } catch (error) {
    console.error("UPI app payment failed:", error);
    return {
      success: false,
      message: "Failed to open payment app. Please try again or use a different payment method.",
    };
  }
}

// Attempt to open app with timeout detection
function attemptAppOpen(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Try to open in a new window/tab
    const paymentWindow = window.open(url, "_blank");

    // Set timeout to check if app opened
    const timeout = setTimeout(() => {
      // If we reach here, assume app didn't open
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }
      resolve(false);
    }, 2000);

    // Check if window was blocked by popup blocker
    if (!paymentWindow || paymentWindow.closed) {
      clearTimeout(timeout);
      resolve(false);
      return;
    }

    // Listen for window close (indicates app opened)
    const checkInterval = setInterval(() => {
      if (paymentWindow.closed) {
        clearTimeout(timeout);
        clearInterval(checkInterval);
        resolve(true);
      }
    }, 100);

    // Clean up after timeout
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 2100);
  });
}

// Initialize PayU payment with improved error handling
export function initiatePayUPayment(paymentData: PayUPaymentData): void {
  try {
    const form = createPayUForm(paymentData);
    document.body.appendChild(form);
    form.submit();
    
    // Clean up form after submission
    setTimeout(() => {
      if (form.parentNode) {
        form.parentNode.removeChild(form);
      }
    }, 1000);
  } catch (error) {
    console.error("Failed to initiate payment:", error);
    alert("Payment initialization failed. Please try again.");
  }
}

// Payment helper functions
export const paymentHelpers = {
  // Create payment data object
  createPaymentData(
    amount: number,
    productInfo: string,
    customerInfo: {
      name: string;
      email: string;
      phone: string;
      city?: string;
    },
    successUrl: string,
    failureUrl: string,
    additionalData?: {
      udf1?: string;
      udf2?: string;
      udf3?: string;
      udf4?: string;
      udf5?: string;
    },
  ): PayUPaymentData {
    return {
      txnid: generateTransactionId(),
      amount,
      productinfo: productInfo,
      firstname: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      surl: successUrl,
      furl: failureUrl,
      ...additionalData,
    };
  },

  // Process payment with UPI app support
  async processPayment(
    paymentData: PayUPaymentData,
    upiApp?: keyof typeof UPI_APPS
  ): Promise<void> {
    try {
      // Log payment attempt (for analytics)
      console.log("Initiating PayU payment:", {
        txnid: paymentData.txnid,
        amount: paymentData.amount,
        product: paymentData.productinfo,
        upiApp: upiApp || "default",
      });

      // If UPI app is specified, handle it specially
      if (upiApp) {
        // First submit to PayU to get payment URL
        const form = createPayUForm(paymentData);
        const paymentUrl = form.action;
        
        // Try to open with UPI app
        const result = await handleUpiAppPayment(upiApp, paymentUrl);
        
        if (!result.success) {
          // Fallback to standard payment
          console.log("UPI app failed, falling back to standard payment");
          initiatePayUPayment(paymentData);
        }
      } else {
        // Standard payment flow
        initiatePayUPayment(paymentData);
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      throw new Error("Failed to initiate payment. Please try again.");
    }
  },

  // Handle payment response
  handlePaymentResponse(response: PayUResponse): {
    isValid: boolean;
    isSuccess: boolean;
    message: string;
    data: PayUResponse;
  } {
    const isValid = verifyPayUResponse(response);
    const isSuccess = response.status === "success";

    let message = "";
    if (!isValid) {
      message = "Payment verification failed. Please contact support.";
    } else if (isSuccess) {
      message = "Payment completed successfully!";
    } else {
      message = response.error_Message || "Payment failed. Please try again.";
    }

    return {
      isValid,
      isSuccess,
      message,
      data: response,
    };
  },

  // Format amount for display
  formatAmount(amount: number): string {
    return `₹${amount.toLocaleString("en-IN")}`;
  },

  // Get payment status color
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "success":
        return "text-green-600";
      case "failed":
      case "failure":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  },

  // Get available UPI apps
  getAvailableUpiApps() {
    return Object.keys(UPI_APPS);
  },

  // Get UPI app details
  getUpiAppDetails(appName: keyof typeof UPI_APPS) {
    return UPI_APPS[appName];
  },
};

// Export configuration for server-side use
export { PAYU_CONFIG, UPI_APPS };
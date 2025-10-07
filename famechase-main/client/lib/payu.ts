import CryptoJS from "crypto-js";

// PayU Configuration
const PAYU_CONFIG = {
  merchantKey: import.meta.env.VITE_PAYU_MERCHANT_KEY || "WBtjxn",
  salt: import.meta.env.VITE_PAYU_SALT || "Ui1z2GLGDx7sUixAtCdl42",
  baseUrl:
    import.meta.env.VITE_PAYU_BASE_URL || "https://test.payu.in/_payment",
  mode: import.meta.env.VITE_PAYU_MODE || "test",
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

// Initialize PayU payment
export function initiatePayUPayment(paymentData: PayUPaymentData): void {
  const form = createPayUForm(paymentData);
  document.body.appendChild(form);
  form.submit();
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

  // Process payment
  async processPayment(paymentData: PayUPaymentData): Promise<void> {
    try {
      // Log payment attempt (for analytics)
      console.log("Initiating PayU payment:", {
        txnid: paymentData.txnid,
        amount: paymentData.amount,
        product: paymentData.productinfo,
      });

      // Initiate payment
      initiatePayUPayment(paymentData);
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
};

// Export configuration for server-side use
export { PAYU_CONFIG };

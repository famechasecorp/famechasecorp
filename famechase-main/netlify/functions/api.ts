import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import CryptoJS from "crypto-js";

// PayU Test Credentials
const PAYU_KEY = "WBtjxn";
const PAYU_SALT = "Ui1z2GLGDjBOiQtBmZDx7sUixAtCdl42";

// Supabase Credentials
const SUPABASE_URL = "https://ecdwpwodxiyelnnsxryk.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZHdwd29keGl5ZWxubnN4cnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjQ2NzIsImV4cCI6MjA3MDA0MDY3Mn0.dvrYSy9miIaut030oE8TeWd64XO7lMPciZJn4ITHiZo";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const handler: Handler = async (event, context) => {
  const path = event.path || "";
  let response;

  if (path.endsWith("/payment/success")) {
    response = await handlePaymentSuccess(event);
  } else if (path.endsWith("/payment/failure")) {
    response = await handlePaymentFailure(event);
  } else {
    response = {
      statusCode: 404,
      body: "Not Found",
    };
  }

  return response;
};

// Handler for payment success webhook
async function handlePaymentSuccess(event: any) {
  const payment = parseBody(event);

  // Log for debugging
  console.log("[PayU Success] Webhook Payload:", payment);

  // Verify PayU hash
  const isValid = verifyPayUResponse(payment);

  if (!isValid) {
    console.error("[PayU] Hash verification failed!", payment);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid PayU hash" }),
    };
  }

  // Insert payment into Supabase
  try {
    const { data, error } = await supabase.from("payments").insert([
      {
        txnid: payment.txnid,
        amount: payment.amount,
        email: payment.email,
        status: "success",
        mihpayid: payment.mihpayid,
        payu_response: payment,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.error("[Supabase] Insert error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Database error", error }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Payment success recorded", data }),
    };
  } catch (err) {
    console.error("[Supabase] Exception:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Database exception", err }),
    };
  }
}

// Handler for payment failure webhook
async function handlePaymentFailure(event: any) {
  const payment = parseBody(event);

  // Log for debugging
  console.log("[PayU Failure] Webhook Payload:", payment);

  // Insert failed payment into Supabase
  try {
    const { data, error } = await supabase.from("payments").insert([
      {
        txnid: payment.txnid,
        amount: payment.amount,
        email: payment.email,
        status: "failure",
        mihpayid: payment.mihpayid,
        payu_response: payment,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.error("[Supabase] Insert error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Database error", error }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Payment failure recorded", data }),
    };
  } catch (err) {
    console.error("[Supabase] Exception:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Database exception", err }),
    };
  }
}

// Helper to parse PayU POST body (x-www-form-urlencoded)
function parseBody(event: any): Record<string, any> {
  try {
    if (!event.body) return {};
    return Object.fromEntries(
      event.body.split("&").map((pair: string) => {
        const [key, value] = pair.split("=");
        return [key, decodeURIComponent(value || "")];
      })
    );
  } catch (err) {
    console.error("Failed to parse webhook body", err);
    return {};
  }
}

// Verify PayU response hash
function verifyPayUResponse(payment: any): boolean {
  const hashString = [
    PAYU_KEY,
    payment.txnid,
    payment.amount,
    payment.productinfo,
    payment.firstname,
    payment.email,
    payment.udf1 || "",
    payment.udf2 || "",
    payment.udf3 || "",
    payment.udf4 || "",
    payment.udf5 || "",
    payment.status,
    PAYU_SALT,
  ].join("|");

  const expectedHash = CryptoJS.SHA512(hashString).toString();
  return expectedHash === payment.hash;
}
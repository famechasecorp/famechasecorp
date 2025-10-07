const crypto = require("crypto");

const json = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    ...headers,
  },
  body: JSON.stringify(body),
});

const sha512 = (str) => crypto.createHash("sha512").update(str).digest("hex");

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const {
      amount,
      productinfo = "Order",
      firstname = "Test",
      email = "test@example.com",
      phone = "9999999999",
      // Return URLs can be overridden by the caller
      surl = "https://famechase.com/thank-you",
      furl = "https://famechase.com/payment-failed",
      udf1 = "",
      udf2 = "",
      udf3 = "",
      udf4 = "",
      udf5 = "",
      udf6 = "",
      udf7 = "",
      udf8 = "",
      udf9 = "",
      udf10 = "",
    } = JSON.parse(event.body || "{}");

    if (!amount) {
      return json(400, { error: "amount is required" });
    }

    // We’re using TEST mode on purpose for famechase.com
    const baseUrl = "https://test.payu.in";
    const action = `${baseUrl}/_payment`;

    const key = process.env.PAYU_KEY;
    const salt = process.env.MERCHANT_SALT;

    if (!key || !salt) {
      return json(500, {
        error:
          "Missing PAYU_KEY or MERCHANT_SALT in environment variables on Netlify.",
      });
    }

    // Build transaction
    const txnid = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const amtNum = Number(amount);
    if (Number.isNaN(amtNum)) {
      return json(400, { error: "amount must be a number" });
    }
    const amtStr = amtNum.toFixed(2);

    const productinfoStr =
      typeof productinfo === "string" ? productinfo : JSON.stringify(productinfo);

    // PayU India hash sequence:
    // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
    const fields = [
      key,
      txnid,
      amtStr,
      productinfoStr,
      firstname,
      email,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
      udf6,
      udf7,
      udf8,
      udf9,
      udf10,
    ];
    const hashString = `${fields.join("|")}|${salt}`;
    const hash = sha512(hashString);

    const params = {
      key,
      txnid,
      amount: amtStr,
      productinfo: productinfoStr,
      firstname,
      email,
      phone,
      surl,
      furl,
      // udf1..udf10 must be sent even if empty
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
      udf6,
      udf7,
      udf8,
      udf9,
      udf10,
      hash,
    };

    return json(200, { action, params, mode: "test" });
  } catch (e) {
    console.error("payu-initiate error:", e);
    return json(500, { error: "Server error", detail: String(e) });
  }
};

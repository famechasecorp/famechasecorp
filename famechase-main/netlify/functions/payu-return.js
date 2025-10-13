const crypto = require("crypto");

function sha512(s) {
  return crypto.createHash("sha512").update(s, "utf8").digest("hex");
}

function originFrom(event) {
  const proto = event.headers["x-forwarded-proto"] || "https";
  const host = event.headers.host;
  return `${proto}://${host}`;
}

exports.handler = async (event) => {
  const baseHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: baseHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 302,
      headers: { ...baseHeaders, Location: `${originFrom(event)}/thank-you.html` },
      body: "",
    };
  }

  const body = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : (event.body || "");
  const params = new URLSearchParams(body);
  const posted = Object.fromEntries(params.entries());

  const {
    key = "",
    txnid = "",
    amount = "",
    productinfo = "",
    firstname = "",
    email = "",
    status = "",
    hash: postedHash = "",
    udf1 = "", udf2 = "", udf3 = "", udf4 = "", udf5 = "",
    additionalCharges = "",
  } = posted;

  const salt = process.env.MERCHANT_SALT || "";

  const parts = [
    salt, status,
    "", "", "", "", "", "", "", "", "",
    udf5, udf4, udf3, udf2, udf1,
    email, firstname, productinfo, amount, txnid, key,
  ];
  if (additionalCharges) parts.unshift(additionalCharges);

  const calculated = sha512(parts.join("|")).toLowerCase();
  const valid = (postedHash || "").toLowerCase() === calculated;

  const o = originFrom(event);
  
  // Pass all payment parameters to the redirect URL
  const allParams = new URLSearchParams();
  for (const [key, value] of params.entries()) {
    allParams.set(key, value);
  }
  allParams.set('valid', valid ? '1' : '0');
  const queryString = allParams.toString();

  const success = status.toLowerCase() === "success" && valid;
  const target = success
    ? `${o}/thank-you.html?${queryString}`
    : `${o}/payment-failed.html?${queryString}`;

  return {
    statusCode: 303,
    headers: { ...baseHeaders, Location: target },
    body: "",
  };
};

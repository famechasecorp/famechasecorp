import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// Supabase connection
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// PayU Config
const PAYU_KEY = process.env.PAYU_KEY;
const PAYU_SALT = process.env.PAYU_SALT;
const PAYU_BASE_URL = "https://test.payu.in"; // use test endpoint

// Generate PayU payment hash
function generateHash(data) {
  const string = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${PAYU_SALT}`;
  return crypto.createHash("sha512").update(string).digest("hex");
}

// Create Payment Request
app.post("/api/payment", async (req, res) => {
  const { txnid, amount, firstname, email, productinfo } = req.body;

  const paymentData = {
    key: PAYU_KEY,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    surl: "https://famechase.com/api/payment/success",
    furl: "https://famechase.com/api/payment/failure",
  };

  paymentData.hash = generateHash(paymentData);

  return res.json({
    url: `${PAYU_BASE_URL}/_payment`,
    params: paymentData,
  });
});

// Success Webhook
app.post("/api/payment/success", async (req, res) => {
  const payment = req.body;

  // Save to Supabase
  await supabase.from("payments").insert([
    {
      txnid: payment.txnid,
      amount: payment.amount,
      email: payment.email,
      status: "success",
    },
  ]);

  return res.send("Payment Success Recorded");
});

// Failure Webhook
app.post("/api/payment/failure", async (req, res) => {
  const payment = req.body;

  await supabase.from("payments").insert([
    {
      txnid: payment.txnid,
      amount: payment.amount,
      email: payment.email,
      status: "failure",
    },
  ]);

  return res.send("Payment Failed Recorded");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

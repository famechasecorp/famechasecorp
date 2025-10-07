import express from "express";
import crypto from "crypto";

const router = express.Router();

// POST /api/payuhash
router.post("/", (req, res) => {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    salt
  } = req.body;

  if (!key || !txnid || !amount || !productinfo || !firstname || !email || !salt) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // PayU hash sequence
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;

  const hash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  return res.json({ hash });
});

export default router;

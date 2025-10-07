import express from "express";
import crypto from "crypto";

const router = express.Router();

// ✅ Your Test Credentials
const key = "WBtjn";
const salt = "U1l2zGLGDJBOIQBtZnZDxrSUlxAtCdI42"; // 32-bit Salt

router.post("/", (req, res) => {
  const { txnid, amount, productinfo, firstname, email } = req.body;

  // Hash sequence for PayU
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  res.json({ hash, key });
});

export default router;

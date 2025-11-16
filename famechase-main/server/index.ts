import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { generateProductDownload, getProductConfig } from "../client/lib/products";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Download endpoint - serves PDFs with correct headers to force download
  app.get("/api/download", (req, res) => {
    try {
      const { productId, downloadId, language } = req.query;

      if (!productId || !downloadId) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      const validLanguage = (language || "english") as "english" | "hindi";
      if (!["english", "hindi"].includes(validLanguage)) {
        return res.status(400).json({ error: "Invalid language" });
      }

      // Generate the PDF content
      const content = generateProductDownload(
        String(productId),
        String(downloadId),
        validLanguage,
        null
      );

      if (!content) {
        return res.status(404).json({ error: "Download not found" });
      }

      // Get product config for filename
      const product = getProductConfig(String(productId));
      const download = product?.downloads.find((d) => d.id === String(downloadId));

      if (!download) {
        return res.status(404).json({ error: "Download not found" });
      }

      const fileName = `${download.fileName}_${validLanguage}.pdf`;

      // Set headers to force download
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(fileName)}"`
      );
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      // Send the PDF content
      res.send(content);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to generate download" });
    }
  });

  return app;
}

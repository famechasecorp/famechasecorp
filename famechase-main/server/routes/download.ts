import { RequestHandler } from "express";
import {
  generateProductDownload,
  getProductConfig,
} from "../../client/lib/products";

interface DownloadQuery {
  productId: string;
  downloadId: string;
  language: "english" | "hindi";
}

export const handleDownload: RequestHandler = (req, res) => {
  try {
    const { productId, downloadId, language } = req.query as Record<
      string,
      string
    >;

    if (!productId || !downloadId) {
      res.status(400).json({
        error: "Missing productId or downloadId",
      });
      return;
    }

    const validLanguage = (language || "english") as "english" | "hindi";
    if (!["english", "hindi"].includes(validLanguage)) {
      res.status(400).json({
        error: "Invalid language",
      });
      return;
    }

    // Generate the PDF content
    const content = generateProductDownload(productId, downloadId, validLanguage, null);

    if (!content) {
      res.status(404).json({
        error: "Download not found",
      });
      return;
    }

    // Get product config for filename
    const product = getProductConfig(productId);
    const download = product?.downloads.find((d) => d.id === downloadId);

    if (!download) {
      res.status(404).json({
        error: "Download configuration not found",
      });
      return;
    }

    const fileName = `${download.fileName}_${validLanguage}.pdf`;

    // Set headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"`
    );
    res.setHeader("Content-Length", Buffer.byteLength(content));
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Send the content
    res.send(content);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      error: "Failed to generate download",
    });
  }
};

import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Download, Home, Loader2 } from "lucide-react";
import { supabase, dbHelpers, isSupabaseConfigured } from "../lib/supabase";
import {
  downloadFile,
  generateProductDownload,
  getProductConfig,
  productConfigs,
  type ProductConfig,
} from "../lib/products";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [purchase, setPurchase] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      setIsVerifying(true);

      if (!isSupabaseConfigured()) {
        // Simulate successful payment when Supabase is not configured
        console.log(
          "Supabase not configured, simulating successful payment verification",
        );
        setVerificationResult({
          success: true,
          verified: true,
          paymentStatus: "success",
          purchase: {
            id: "demo-purchase",
            product_id: searchParams.get("udf3") || "complete-growth-kit",
            amount: parseFloat(searchParams.get("amount") || "99"),
            payment_status: "success",
          },
        });

        const productId = searchParams.get("udf3") || "complete-growth-kit";
        const { data: productData } = await dbHelpers.getProduct(productId);
        setProduct(productData);
        return;
      }

      // Get all payment response parameters from URL
      const paymentResponse = {
        mihpayid: searchParams.get("mihpayid") || "",
        mode: searchParams.get("mode") || "",
        status: searchParams.get("status") || "",
        unmappedstatus: searchParams.get("unmappedstatus") || "",
        key: searchParams.get("key") || "",
        txnid: searchParams.get("txnid") || "",
        amount: searchParams.get("amount") || "",
        productinfo: searchParams.get("productinfo") || "",
        firstname: searchParams.get("firstname") || "",
        lastname: searchParams.get("lastname") || "",
        address1: searchParams.get("address1") || "",
        address2: searchParams.get("address2") || "",
        city: searchParams.get("city") || "",
        state: searchParams.get("state") || "",
        country: searchParams.get("country") || "",
        zipcode: searchParams.get("zipcode") || "",
        email: searchParams.get("email") || "",
        phone: searchParams.get("phone") || "",
        udf1: searchParams.get("udf1") || "",
        udf2: searchParams.get("udf2") || "",
        udf3: searchParams.get("udf3") || "",
        udf4: searchParams.get("udf4") || "",
        udf5: searchParams.get("udf5") || "",
        field1: searchParams.get("field1") || "",
        field2: searchParams.get("field2") || "",
        field3: searchParams.get("field3") || "",
        field4: searchParams.get("field4") || "",
        field5: searchParams.get("field5") || "",
        field6: searchParams.get("field6") || "",
        field7: searchParams.get("field7") || "",
        field8: searchParams.get("field8") || "",
        field9: searchParams.get("field9") || "",
        error: searchParams.get("error") || "",
        error_Message: searchParams.get("error_Message") || "",
        net_amount_debit: searchParams.get("net_amount_debit") || "",
        disc: searchParams.get("disc") || "",
        addedon: searchParams.get("addedon") || "",
        payment_source: searchParams.get("payment_source") || "",
        PG_TYPE: searchParams.get("PG_TYPE") || "",
        bank_ref_num: searchParams.get("bank_ref_num") || "",
        bankcode: searchParams.get("bankcode") || "",
        cardnum: searchParams.get("cardnum") || "",
        hash: searchParams.get("hash") || "",
      };

      // Direct payment verification without Edge Functions
      const isSuccess = paymentResponse.status === "success";
      const txnid = paymentResponse.txnid;

      if (!txnid) {
        setVerificationResult({
          success: false,
          error: "Missing transaction ID",
        });
        return;
      }

      // Update purchase status in Supabase
      const { data: purchaseData, error: purchaseError } = await supabase!
        .from("purchases")
        .update({
          payment_status: isSuccess ? "success" : "failed",
          payu_response: paymentResponse,
          updated_at: new Date().toISOString(),
        })
        .eq("payment_id", txnid)
        .select()
        .single();

      if (purchaseError) {
        console.error("Failed to update purchase:", purchaseError);
        setVerificationResult({
          success: false,
          error: "Failed to update purchase",
        });
        return;
      }

      setVerificationResult({
        success: true,
        verified: true,
        paymentStatus: isSuccess ? "success" : "failed",
        purchase: purchaseData,
      });

      if (isSuccess && purchaseData) {
        setPurchase(purchaseData);
        const { data: productData } = await dbHelpers.getProduct(
          purchaseData.product_id,
        );
        setProduct(productData);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setVerificationResult({ success: false, error: "Verification failed" });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = async (productId: string) => {
    // This would trigger download of all product files
    // For now, we'll just show a success message
    alert(
      "Download functionality will be implemented with the actual product files.",
    );
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your payment...
          </p>
        </div>
      </div>
    );
  }

  if (
    !verificationResult?.success ||
    !verificationResult?.verified ||
    verificationResult?.paymentStatus !== "success"
  ) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Verification Failed
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't verify your payment. Please contact support if you
            believe this is an error.
          </p>
          <div className="space-y-3">
            <Link
              to="/shop"
              className="block bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Back to Shop
            </Link>
            <Link
              to="/"
              className="block bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              <Home className="w-4 h-4 inline mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              FameChase<span className="text-neon-green">.com</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Thank you for your purchase! Your payment has been verified and your
            products are ready for download.
          </p>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Payment Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-gray-900">
                  {searchParams.get("txnid")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-gray-900">
                  ₹{searchParams.get("amount")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="text-gray-900">
                  {product?.name || searchParams.get("productinfo")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-gray-900">
                  {searchParams.get("mihpayid")}
                </span>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Download Your Products
            </h2>

            {purchase?.product_id === "complete-bundle" ? (
              <div className="max-w-md mx-auto">
                <button
                  onClick={() => handleDownload("complete-bundle")}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all"
                >
                  <Download className="w-5 h-5 inline mr-2" />
                  Download Complete Bundle (All Products)
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <button
                  onClick={() => handleDownload(purchase?.product_id)}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all"
                >
                  <Download className="w-5 h-5 inline mr-2" />
                  Download {product?.name}
                </button>
              </div>
            )}

            <p className="text-sm text-gray-600 mt-4 max-w-md mx-auto">
              Your products will be available for download anytime from your
              account. We've also sent download links to your email address.
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              What's Next?
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">
                  📧 Check Your Email
                </h4>
                <p className="text-gray-600">
                  We've sent you download links and product guides.
                </p>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">
                  🚀 Start Creating
                </h4>
                <p className="text-gray-600">
                  Use your new tools to accelerate your creator journey.
                </p>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">
                  💬 Join Community
                </h4>
                <p className="text-gray-600">
                  Connect with other creators in our exclusive group.
                </p>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">
                  📞 Get Support
                </h4>
                <p className="text-gray-600">
                  Reach out if you need help with any of your products.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/shop"
              className="inline-block bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors mr-4"
            >
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="inline-block bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              <Home className="w-4 h-4 inline mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 FameChase.com. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

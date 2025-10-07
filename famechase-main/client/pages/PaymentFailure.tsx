import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { XCircle, Home, RefreshCw, Mail } from "lucide-react";

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();

  const errorMessage =
    searchParams.get("error_Message") || "Payment was not completed";
  const txnid = searchParams.get("txnid");
  const amount = searchParams.get("amount");
  const productinfo = searchParams.get("productinfo");

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
          {/* Failure Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-white" />
          </div>

          {/* Failure Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Payment Failed
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We couldn't process your payment. Don't worry, no money has been
            deducted from your account.
          </p>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-red-900 mb-4">
              Payment Details
            </h3>
            <div className="space-y-2 text-sm">
              {txnid && (
                <div className="flex justify-between">
                  <span className="text-red-600">Transaction ID:</span>
                  <span className="font-mono text-red-900">{txnid}</span>
                </div>
              )}
              {amount && (
                <div className="flex justify-between">
                  <span className="text-red-600">Amount:</span>
                  <span className="font-bold text-red-900">₹{amount}</span>
                </div>
              )}
              {productinfo && (
                <div className="flex justify-between">
                  <span className="text-red-600">Product:</span>
                  <span className="text-red-900">{productinfo}</span>
                </div>
              )}
              <div className="mt-4 p-3 bg-red-100 rounded-lg">
                <p className="text-red-800 font-medium">Error:</p>
                <p className="text-red-700 text-xs mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>

          {/* Common Reasons */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Common Reasons for Payment Failure
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-left">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  💳 Card Issues
                </h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Insufficient balance</li>
                  <li>• Card expired</li>
                  <li>• Incorrect card details</li>
                  <li>• Daily limit exceeded</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  🏦 Bank Issues
                </h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Bank server down</li>
                  <li>• Transaction blocked by bank</li>
                  <li>• International payments disabled</li>
                  <li>• Network connectivity issues</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              What You Can Do
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-left">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  🔄 Try Again
                </h4>
                <p className="text-gray-600">
                  Wait a few minutes and retry the payment with the same or
                  different card.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  💬 Contact Bank
                </h4>
                <p className="text-gray-600">
                  Call your bank to check if they blocked the transaction.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  💳 Try Different Method
                </h4>
                <p className="text-gray-600">
                  Use a different card, net banking, or UPI for payment.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  📞 Get Help
                </h4>
                <p className="text-gray-600">
                  Contact our support team if the issue persists.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/shop"
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all mr-4"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Try Payment Again
            </Link>
            <Link
              to="/"
              className="inline-block bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              <Home className="w-4 h-4 inline mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Support Section */}
          <div className="mt-12 p-6 border-2 border-gray-200 rounded-2xl max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              If you're still having trouble, our support team is here to help.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:support@famechase.com"
                className="block bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email Support
              </a>
              <p className="text-xs text-gray-500">
                Include your transaction ID ({txnid}) for faster assistance
              </p>
            </div>
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

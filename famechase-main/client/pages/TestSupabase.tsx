import React, { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured, dbHelpers } from "../lib/supabase";

export default function TestSupabase() {
  const [status, setStatus] = useState("Testing...");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        setStatus("❌ Supabase not configured");
        setError("Environment variables not set");
        return;
      }

      setStatus("✅ Supabase configured");

      // Test products fetch
      const { data: productsData, error: productsError } =
        await dbHelpers.getProducts();

      if (productsError) {
        setError(`Products error: ${productsError.message}`);
        return;
      }

      setProducts(productsData || []);
      setStatus(
        `✅ Connection successful! Loaded ${productsData?.length || 0} products`,
      );
    } catch (err) {
      setError(`Connection failed: ${err.message}`);
      setStatus("❌ Connection failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>

        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <p className="text-lg mb-2">{status}</p>

          <div className="bg-gray-50 rounded p-4 mb-4">
            <h3 className="font-semibold mb-2">Environment Variables</h3>
            <p className="text-sm text-gray-600">
              URL: {import.meta.env.VITE_SUPABASE_URL || "Not set"}
            </p>
            <p className="text-sm text-gray-600">
              Key:{" "}
              {import.meta.env.VITE_SUPABASE_ANON_KEY
                ? "Set (hidden)"
                : "Not set"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Products Data</h2>
          {products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-gray-600">{product.description}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="font-bold text-green-600">
                      ₹{product.price}
                    </span>
                    <span className="text-gray-500 line-through">
                      ₹{product.original_price}
                    </span>
                    <span className="text-sm text-blue-600">
                      Category: {product.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No products loaded yet...</p>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={testConnection}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Test Connection Again
          </button>
        </div>
      </div>
    </div>
  );
}

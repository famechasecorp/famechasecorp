import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Star, Download, CircleCheck as CheckCircle, CreditCard, Shield, Zap, Clock, TrendingUp, Award, Users, CirclePlay as PlayCircle, FileText, Mail, Calendar, Sparkles, Target, DollarSign, Globe, Chrome as Home, Settings, Eye, EyeOff, User } from "lucide-react";
import {
  getAllProducts,
  getProductConfig,
  toggleProductAvailability,
  generateProductDownload,
  downloadFile,
  ProductConfig,
  productConfigs,
} from "../lib/products";
import { supabase, dbHelpers, isSupabaseConfigured } from "@/lib/supabase";
import { sanitizeDeep } from "@/lib/sanitize";
import { buildInstamojoCheckoutUrl } from "../lib/instamojo";

interface PurchasedProduct {
  id: string;
  purchaseDate: string;
  customerInfo: any;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  city: string;
}

export default function Shop() {
  const [language, setLanguage] = useState<"english" | "hindi">(() => {
    const savedLanguage = localStorage.getItem("famechase-language");
    return (savedLanguage as "english" | "hindi") || "english";
  });
  const [products, setProducts] = useState<ProductConfig[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null);
  const [showQuizRequiredPopup, setShowQuizRequiredPopup] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(86400); // 24 hours in seconds
  const [recentPurchases, setRecentPurchases] = useState<string[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    city: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchasedProducts, setPurchasedProducts] = useState<
    PurchasedProduct[]
  >([]);
  const [showSuccessPage, setShowSuccessPage] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);

  // Load products and purchased items
  useEffect(() => {
    setProducts(getAllProducts());
    const stored = localStorage.getItem("purchasedProducts");
    if (stored) {
      setPurchasedProducts(JSON.parse(stored));
    }
    const storedQuizData = localStorage.getItem("fameChaseQuizData");
    if (storedQuizData) {
      const data = JSON.parse(storedQuizData);
      setQuizData(data);
      setLanguage(data.language || "english");
    }

    // Check for pending purchase completion
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const pendingPurchase = localStorage.getItem('pendingProductPurchase');

    if (pendingPurchase && (paymentStatus === 'Credit' || paymentStatus === 'success')) {
      // Mark product as purchased
      const purchase: PurchasedProduct = {
        id: pendingPurchase,
        purchaseDate: new Date().toISOString(),
        customerInfo: storedQuizData ? JSON.parse(storedQuizData) : {},
      };
      const existingPurchases = stored ? JSON.parse(stored) : [];
      // Check if already purchased
      const alreadyPurchased = existingPurchases.some((p: PurchasedProduct) => p.id === pendingPurchase);
      if (!alreadyPurchased) {
        const updated = [...existingPurchases, purchase];
        setPurchasedProducts(updated);
        localStorage.setItem("purchasedProducts", JSON.stringify(updated));
      }
      localStorage.removeItem('pendingProductPurchase');
      // Show success page
      setShowSuccessPage(pendingPurchase);
      // Clean up URL
      window.history.replaceState({}, '', '/shop');
    }
  }, []);

  // Save language preference
  useEffect(() => {
    localStorage.setItem("famechase-language", language);
  }, [language]);

  useEffect(() => {
    const storedQuizData = localStorage.getItem("fameChaseQuizData");
    let complete = false;
    if (storedQuizData) {
      try {
        const data = JSON.parse(storedQuizData);
        complete = !!(
          data.name &&
          data.niche &&
          data.primaryPlatform &&
          data.followerCount &&
          data.goals
        );
      } catch (e) {
        complete = false;
      }
    }
    if (!complete) {
      window.location.replace("/quiz");
    }
  }, []);

  // Auto-scroll to top when component mounts (for proper navigation)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 86400)); // Reset after 24 hours
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate recent purchases for FOMO
  useEffect(() => {
    const names = [
      "Rahul from Mumbai",
      "Priya from Delhi",
      "Arjun from Bangalore",
      "Sneha from Pune",
      "Vikash from Hyderabad",
      "Anita from Chennai",
      "Rohit from Kolkata",
      "Kavya from Ahmedabad",
      "Amit from Jaipur",
    ];

    const addRecentPurchase = () => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      setRecentPurchases((prev) => [randomName, ...prev.slice(0, 4)]); // Keep last 5
    };

    // Add initial purchases
    addRecentPurchase();

    // Add new purchase every 15-30 seconds
    const interval = setInterval(
      () => {
        if (Math.random() > 0.3) {
          // 70% chance
          addRecentPurchase();
        }
      },
      Math.random() * 15000 + 15000,
    );

    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const checkQuizCompletion = () => {
    const storedQuizData = localStorage.getItem("fameChaseQuizData");
    if (!storedQuizData) {
      return false;
    }

    try {
      const data = JSON.parse(storedQuizData);
      // Check if quiz is completed by verifying essential fields exist
      return !!(
        data.name &&
        data.niche &&
        data.primaryPlatform &&
        data.followerCount &&
        data.goals
      );
    } catch {
      return false;
    }
  };

  const handleBuyClick = async (productId: string) => {
    if (!checkQuizCompletion()) {
      setShowQuizRequiredPopup(true);
      return;
    }

    const product = getProductConfig(productId);
    if (!product) return;

    // Calculate amount with discount if applied
    const amount = calculateDiscountedPrice(product.price);

    // Get customer info from quizData
    const name = quizData?.name || '';
    const email = quizData?.email || '';
    const phone = quizData?.phone || '';

    // Build Instamojo checkout URL with all parameters
    const baseUrl = 'https://www.instamojo.com/@famechase';
    const redirectUrl = `${window.location.origin}/payment-success.html?product_id=${productId}`;
    
    const checkoutUrl = buildInstamojoCheckoutUrl(baseUrl, {
      amount: amount,
      purpose: product.name,
      name: name,
      email: email,
      phone: phone,
      redirectUrl: redirectUrl,
      notes: {
        product_id: productId,
        product_name: product.name,
      },
      lockAmount: true,
      allowRepeatedPayments: false,
      mode: 'popup',
    });

    localStorage.setItem('pendingProductPurchase', productId);

    // Navigate to checkout URL in same tab
    window.location.href = checkoutUrl;
  };

  const validatePromoCode = (code: string) => {
    const validCodes = {
      CREATOR20: 20,
      LAUNCH50: 50,
      FIRST25: 25,
      SAVE30: 30,
      WELCOME15: 15,
      SPECIAL40: 40,
    };

    const upperCode = code.toUpperCase();
    if (validCodes[upperCode]) {
      setAppliedDiscount(validCodes[upperCode]);
      return true;
    }
    setAppliedDiscount(0);
    return false;
  };

  const applyPromoCode = () => {
    if (validatePromoCode(promoCode)) {
      // Code is valid, discount already applied
    } else {
      alert(language === "hindi" ? "अमान्य प्रोमो कोड" : "Invalid promo code");
    }
  };

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (appliedDiscount > 0) {
      return Math.round(originalPrice * (1 - appliedDiscount / 100));
    }
    return originalPrice;
  };

  const t = {
    english: {
      title: "Creator Tools & Resources",
      subtitle: "Professional tools to accelerate your creator journey",
      freeResources: "Free Creator Resources",
      premiumTools: "Premium Creator Tools",
      adminPanel: "Admin Panel",
      toggleProduct: "Toggle Product",
      enabled: "Enabled",
      disabled: "Disabled",
      bestseller: "BESTSELLER",
      trending: "TRENDING",
      limited: "LIMITED",
      offerEnds: "Offer ends in",
      downloads: "downloads",
      rating: "Rating",
      securePayment: "Secure payment",
      instantDownload: "Instant download",
      buyNow: "Buy Now",
      downloadFree: "Download Free",
      bundleOffer: "LIMITED TIME BUNDLE OFFER 🔥",
      save: "Save",
      getBundle: "Get Complete Bundle",
      validFor: "Offer valid for next 24 hours only",
      paymentForm: "Complete Your Information",
      fullName: "Full Name",
      emailAddress: "Email Address",
      phoneNumber: "Phone Number",
      city: "City",
      processing: "Processing...",
      paySecure: "Pay Securely",
      downloadYourProducts: "Download Your Products",
      purchaseSuccess: "Purchase Successful! 🎉",
      thanksForPurchase:
        "Thank you for your purchase! Your products are ready for download.",
      backToShop: "Back to Shop",
    },
    hindi: {
      title: "क्रिएटर टू���्स और संसाधन",
      subtitle: "आपकी क्रिएटर यात्रा को तेज़ करने के लिए प्रोफे��नल टूल्स",
      freeResources: "फ्री क्रिएटर संसाधन",
      premiumTools: "प्रीमियम क्रिएटर टूल्स",
      adminPanel: "एडमिन पैनल",
      toggleProduct: "प्रोडक्ट टॉगल",
      enabled: "सक्षम",
      disabled: "निष्क्रिय",
      bestseller: "बेस्टसेलर",
      trending: "ट्रेंडिंग",
      limited: "सीमित समय",
      offerEnds: "ऑफर समाप्त होता है",
      downloads: "डाउनलोड",
      rating: "रेटिंग",
      securePayment: "सुरक्षित भुगतान",
      instantDownload: "तुरंत डाउनलोड",
      buyNow: "अभी खरीदें",
      downloadFree: "फ्री डाउनलोड करें",
      bundleOffer: "सीमित समय बंडल ऑफर 🔥",
      save: "बचाएं",
      getBundle: "कम्प्लीट बंडल पाएं",
      validFor: "ऑफर केवल अगले 24 घंटे के लिए वैध",
      paymentForm: "अपनी जानकारी पूरी करें",
      fullName: "पूरा नाम",
      emailAddress: "ईमेल पता",
      phoneNumber: "फोन नंबर",
      city: "शहर",
      processing: "प्रसंस्���रण...",
      paySecure: "सुरक्षित भुगतान करें",
      downloadYourProducts: "अपने प्रोडक्ट्स डाउनलोड करें",
      purchaseSuccess: "खरीदारी सफल! 🎉",
      thanksForPurchase:
        "आपकी खरीदारी के लिए धन्यवाद! आपके प्���ोडक्ट्स डाउनलोड के लिए तैयार हैं।",
      backToShop: "शॉप पर वापस जाएं",
    },
  };

  const currentLang = sanitizeDeep(t[language]);

  const handlePurchase = async (productId: string) => {
    setIsSubmitting(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Save purchase
    const purchase: PurchasedProduct = {
      id: productId,
      purchaseDate: new Date().toISOString(),
      customerInfo: { ...customerInfo, ...quizData },
    };

    const updated = [...purchasedProducts, purchase];
    setPurchasedProducts(updated);
    localStorage.setItem("purchasedProducts", JSON.stringify(updated));

    setIsSubmitting(false);
    setShowPaymentForm(null);
    setShowSuccessPage(productId);
  };

  const handleDownload = async (productId: string, downloadId: string) => {
    const content = generateProductDownload(
      productId,
      downloadId,
      language,
      quizData,
    );
    const product = getProductConfig(productId);
    const download = product?.downloads.find((d) => d.id === downloadId);

    if (content && download) {
      const localizedFileName = `${download.fileName}_${language}.pdf`;
      await downloadFile(content, localizedFileName);
      try {
        if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.auth.getUser();
          const userId = data.user?.id;
          if (userId) {
            await dbHelpers.recordDownload({
              user_id: userId,
              product_id: productId,
              download_id: downloadId,
              downloaded_at: new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        // no-op
      }
    }
  };

  const handleBundleDownload = () => {
    // Download all products from bundle
    const bundleProducts = [
      "complete-growth-kit",
      "reels-mastery",
      "brand-masterclass",
    ];

    bundleProducts.forEach((productId) => {
      const product = getProductConfig(productId);
      if (product) {
        product.downloads.forEach((download) => {
          setTimeout(() => {
            void handleDownload(productId, download.id);
          }, 500); // Stagger downloads
        });
      }
    });
  };

  const toggleProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      toggleProductAvailability(productId, !product.isEnabled);
      setProducts(getAllProducts());
    }
  };

  const isProductPurchased = (productId: string) => {
    return (
      purchasedProducts.some((p) => p.id === productId) ||
      (productId !== "complete-bundle" &&
        purchasedProducts.some((p) => p.id === "complete-bundle"))
    );
  };

  // Success page for purchased products
  if (showSuccessPage) {
    const product = getProductConfig(showSuccessPage);
    if (!product) return null;

    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                FameChase<span className="text-neon-green">.com</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  {language === "hindi" ? "होम पर लौटें" : "Back to Home"}
                </Link>
                <select
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value as "english" | "hindi")
                  }
                  className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  <option value="english">English</option>
                  <option value="hindi">हिंदी</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-neon-green to-electric-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {currentLang.purchaseSuccess}
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              {currentLang.thanksForPurchase}
            </p>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {currentLang.downloadYourProducts}
              </h2>

              {showSuccessPage === "complete-bundle" ? (
                <div className="grid gap-4 max-w-md mx-auto">
                  <button
                    onClick={handleBundleDownload}
                    className="w-full bg-gradient-to-r from-neon-green to-electric-blue text-black font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Download Complete Bundle (All Products)
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {product.downloads.map((download) => (
                    <div
                      key={download.id}
                      className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-neon-green transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        {download.name}
                      </h3>
                      <button
                        onClick={() =>
                          void handleDownload(showSuccessPage, download.id)
                        }
                        className="w-full bg-gradient-to-r from-neon-green to-electric-blue text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
                      >
                        <Download className="w-4 h-4 inline mr-2" />
                        {currentLang.downloadFree}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSuccessPage(null)}
              className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              {currentLang.backToShop}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              FameChase<span className="text-neon-green">.com</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as "english" | "hindi")
                }
                className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm font-medium"
              >
                <option value="english">English</option>
                <option value="hindi">हिंदी</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Clean Value Proposition Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-5 h-5" />
              <span className="font-semibold">
                {language === "hindi"
                  ? "प्रीमियम क्रिएटर टूल्स"
                  : "Premium Creator Tools"}
              </span>
            </div>
            <p className="text-sm opacity-90">
              {language === "hindi"
                ? "5000+ ��्रिएटर्स का भरोसा • सफलता गारंटी • तुरंत डाउनलोड"
                : "Trusted by 5000+ creators • Success guaranteed • Instant download"}
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {currentLang.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {currentLang.subtitle}
          </p>
        </div>

        {/* Premium Tools */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {currentLang.premiumTools}
          </h2>

          <div className="grid gap-8">
            {products.map((product) => {
              const isPurchased = isProductPurchased(product.id);

              return (
                <div
                  key={product.id}
                  className={`border-2 rounded-2xl p-8 relative overflow-hidden ${
                    product.category === "growth-kit"
                      ? "bg-gradient-to-br from-green-50 to-blue-50 border-green-200"
                      : product.category === "course"
                        ? "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
                        : product.category === "masterclass"
                          ? "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"
                          : "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                  }`}
                >
                  <div className="absolute top-4 right-4 space-y-2">
                    {product.category === "growth-kit" && (
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {currentLang.bestseller}
                      </div>
                    )}
                    {product.category === "course" && (
                      <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {currentLang.trending}
                      </div>
                    )}
                    {product.category === "masterclass" && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {language === "hindi"
                          ? "एक���सपर्ट गाइड"
                          : "Expert Guide"}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {language === "hindi" &&
                        product.id === "complete-growth-kit"
                          ? "कम्प्लीट क्रिएटर ग्रो��� किट"
                          : language === "hindi" &&
                              product.id === "reels-mastery"
                            ? "इंस्टाग्राम रील्स मास्टरी कोर्स"
                            : language === "hindi" &&
                                product.id === "brand-masterclass"
                              ? "ब्रांड कोलैबोरेशन मास्टरक्लास"
                              : language === "hindi" &&
                                  product.id === "complete-bundle"
                                ? "कम्प्लीट क्रिएटर बंडल"
                                : product.name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {product.description}
                      </p>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold">4.9</span>
                        </div>
                        <span className="text-gray-600">
                          2,547 {currentLang.downloads}
                        </span>
                        {isPurchased && (
                          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            ✅ Purchased
                          </div>
                        )}
                      </div>

                      <ul className="space-y-2 text-gray-700 mb-6">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* Value Guarantee */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-green-700 text-sm">
                          <Shield className="w-4 h-4" />
                          <span className="font-semibold">
                            {language === "hindi"
                              ? "100% संतुष्टि गारंटी"
                              : "100% Satisfaction Guarantee"}
                          </span>
                        </div>
                        <div className="text-green-600 text-xs mt-1">
                          {language === "hindi"
                            ? "तुरंत डाउनलोड • सफलता गारंटी"
                            : "Instant download • Success guarantee"}
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-80">
                      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900 mb-2">
                            ₹{product.price}
                          </div>
                          {product.originalPrice > product.price && (
                            <div className="text-lg text-gray-500 line-through">
                              ₹{product.originalPrice}
                            </div>
                          )}
                          <div className="text-sm text-blue-600 font-medium mt-2">
                            💰{" "}
                            {language === "hindi"
                              ? "प्रोमो कोड से और भी छूट पाएं!"
                              : "Get extra discount with promo codes!"}
                          </div>
                          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-4">
                            {Math.round(
                              ((product.originalPrice - product.price) /
                                product.originalPrice) *
                                100,
                            )}
                            % OFF
                          </div>

                          {isPurchased ? (
                            <button
                              onClick={() => setShowSuccessPage(product.id)}
                              className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-600 transition-all mb-4"
                            >
                              <Download className="w-4 h-4 inline mr-2" />
                              Download Products
                            </button>
                          ) : (
                            <button
                              onClick={() => void handleBuyClick(product.id)}
                              className="w-full bg-gradient-to-r from-neon-green to-electric-blue text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all mb-4"
                            >
                              <CreditCard className="w-4 h-4 inline mr-2" />
                              {language === "hindi" ? "भुगतान करें" : "Pay with Instamojo"} - ₹{product.price}
                            </button>
                          )}

                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center justify-center gap-2">
                              <Shield className="w-4 h-4" />
                              {currentLang.securePayment}
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <Download className="w-4 h-4" />
                              {currentLang.instantDownload}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Quiz Required Popup */}
      {showQuizRequiredPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "hindi"
                ? "❌ पहले अपनी प्रोफाइल बनाएं!"
                : "❌ Complete Your Profile First!"}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === "hindi"
                ? "प्रीमियम टूल्स को खरीदने से पहले आपको अपनी क���रिएटर प्रोफाइल बनानी होगी। यह केवल 2 मिनट में ह��� जाएगा!"
                : "Before purchasing premium tools, you need to complete your creator profile. It takes only 2 minutes!"}
            </p>
            <div className="space-y-3">
              <Link
                to="/quiz"
                className="w-full bg-gradient-to-r from-neon-green to-electric-blue text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all inline-block"
              >
                {language === "hindi"
                  ? "🎯 अभी प्रोफाइल बनाएं"
                  : "🎯 Create Profile Now"}
              </Link>
              <button
                onClick={() => setShowQuizRequiredPopup(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                {language === "hindi" ? "बाद में" : "Later"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Sticky FOMO Banner for Mobile */}
      <div className="fixed bottom-4 right-4 md:hidden z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 animate-pulse" />
            <div className="text-sm font-bold">
              {language === "hindi" ? "⏰ स���मित स���य!" : "��� Limited Time!"}
            </div>
          </div>
          <div className="text-xs font-mono bg-black bg-opacity-20 px-2 py-1 rounded">
            {formatTimeLeft()}
          </div>
          <Link
            to="/quiz"
            className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors"
          >
            {language === "hindi" ? "शुरू करें" : "Start Quiz"}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 FameChase.com. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

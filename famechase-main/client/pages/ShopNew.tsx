import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  CheckCircle,
  CreditCard,
  Download,
  Home,
  Shield,
  Star,
  Target,
  Zap,
} from "lucide-react";
import {
  getAllProducts,
  getProductConfig,
  toggleProductAvailability,
  generateProductDownload,
  downloadFile,
  type ProductConfig,
  productConfigs,
} from "../lib/products";
import { supabase, dbHelpers, isSupabaseConfigured } from "@/lib/supabase";
import { sanitizeDeep } from "@/lib/sanitize";
import SupabaseConfigBanner from "../components/SupabaseConfigBanner";

interface PurchasedProduct {
  id: string;
  purchaseDate: string;
  customerInfo: unknown;
}

function ShopNew() {
  const [language, setLanguage] = useState<"english" | "hindi">("english");
  const [products, setProducts] = useState<ProductConfig[]>([]);
  const [showQuizRequiredPopup, setShowQuizRequiredPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(86400);
  const [recentPurchases, setRecentPurchases] = useState<string[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>(
    [],
  );
  const [showSuccessPage, setShowSuccessPage] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);

  useEffect(() => {
    setProducts(getAllProducts());

    const storedPurchases = localStorage.getItem("purchasedProducts");
    let existingPurchases: PurchasedProduct[] = [];

    if (storedPurchases) {
      try {
        const parsed = JSON.parse(storedPurchases);
        if (Array.isArray(parsed)) {
          existingPurchases = parsed;
          setPurchasedProducts(parsed);
        }
      } catch (error) {
        console.warn("Unable to parse stored purchases", error);
      }
    }

    const storedQuizData = localStorage.getItem("fameChaseQuizData");
    let parsedQuizData: any = null;

    if (storedQuizData) {
      try {
        parsedQuizData = JSON.parse(storedQuizData);
        setQuizData(parsedQuizData);
        /* keep default language (English) */
      } catch (error) {
        console.warn("Unable to parse quiz data", error);
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const rawStatus = (urlParams.get("payment_status") || urlParams.get("status") || "").toLowerCase();
    const urlProductId = urlParams.get("product_id") || urlParams.get("data_product_id");
    const pendingPurchase = localStorage.getItem("pendingProductPurchase");
    const success =
      rawStatus === "credit" ||
      rawStatus === "success" ||
      rawStatus === "completed" ||
      rawStatus === "paid" ||
      !!urlParams.get("payment_id");

    const resolvedProductId = urlProductId || pendingPurchase || null;

    if (resolvedProductId && success) {
      const alreadyPurchased = existingPurchases.some(
        (purchase) => purchase.id === resolvedProductId,
      );

      if (!alreadyPurchased) {
        const purchase: PurchasedProduct = {
          id: resolvedProductId,
          purchaseDate: new Date().toISOString(),
          customerInfo: parsedQuizData ?? {},
        };
        existingPurchases = [...existingPurchases, purchase];
        setPurchasedProducts(existingPurchases);
        localStorage.setItem(
          "purchasedProducts",
          JSON.stringify(existingPurchases),
        );
      }

      localStorage.removeItem("pendingProductPurchase");
      setShowSuccessPage(resolvedProductId);
      window.history.replaceState({}, "", "/shop");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("famechase-language", language);
  }, [language]);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const names = [
      "Rahul from Mumbai",
      "Priya from Delhi",
      "Arjun from Bengaluru",
      "Sneha from Pune",
      "Vikash from Hyderabad",
      "Anita from Chennai",
      "Rohit from Kolkata",
      "Kavya from Ahmedabad",
      "Amit from Jaipur",
    ];

    const addRecentPurchase = () => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      setRecentPurchases((prev) => [randomName, ...prev.slice(0, 4)]);
    };

    addRecentPurchase();
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        addRecentPurchase();
      }
    }, Math.random() * 15000 + 15000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const checkQuizCompletion = () => {
    const storedQuizData = localStorage.getItem("fameChaseQuizData");
    if (!storedQuizData) {
      return false;
    }

    try {
      const data = JSON.parse(storedQuizData);
      return Boolean(
        data.name &&
          data.niche &&
          data.primaryPlatform &&
          data.followerCount &&
          data.goals,
      );
    } catch (error) {
      console.warn("Unable to parse quiz data", error);
      return false;
    }
  };

  const handleBuyClick = async (productId: string) => {
    if (!checkQuizCompletion()) {
      setShowQuizRequiredPopup(true);
      return;
    }

    const product = getProductConfig(productId);
    if (!product) {
      return;
    }

    const alreadyPurchased = purchasedProducts.some((p) => p.id === productId);
    if (!alreadyPurchased) {
      const purchase: PurchasedProduct = {
        id: productId,
        purchaseDate: new Date().toISOString(),
        customerInfo: quizData ?? {},
      };
      const updated = [...purchasedProducts, purchase];
      setPurchasedProducts(updated);
      localStorage.setItem("purchasedProducts", JSON.stringify(updated));
    }

    setShowSuccessPage(productId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };



  const translations = {
    english: {
      title: "Creator Tools & Resources",
      subtitle: "Professional tools to accelerate your creator journey",
      premiumTools: "Premium Creator Tools",
      adminPanel: "Admin Panel",
      toggleProduct: "Toggle Product",
      enabled: "Enabled",
      disabled: "Disabled",
      bestseller: "BESTSELLER",
      trending: "TRENDING",
      expertGuide: "Expert Guide",
      offerEnds: "Offer ends in",
      downloads: "downloads",
      rating: "Rating",
      securePayment: "No payment required",
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
      recentHeadline: "Creators who just grabbed their kit",
      adminToggleShow: "Open Admin Panel",
      adminToggleHide: "Hide Admin Panel",
      instamojoNote:
        "After paying with Instamojo, please return and click ‘Download�� to access your product.",
      instamojoNoteShort:
        "After paying, come back and click ‘Download’ to get your files.",
    },
    hindi: {
      title: "क्रिएटर ��ूल्स और संसाधन",
      subtitle: "आपकी क्रिएट��� यात्रा को तेज़ करने के लिए प्रोफेशनल टूल्स",
      premiumTools: "प्रीमियम क्रिएटर टूल्स",
      adminPanel: "एडमिन पैनल",
      toggleProduct: "प्रोडक्ट टॉगल",
      enabled: "सक्रिय",
      disabled: "निष्क्रिय",
      bestseller: "बेस्टसेलर",
      trending: "ट्रेंडिंग",
      expertGuide: "एक्सपर���ट गाइड",
      offerEnds: "ऑफर समाप्त होता है",
      downloads: "डाउनलोड",
      rating: "रेटिंग",
      securePayment: "भुगतान की आवश्यकता नहीं",
      instantDownload: "तुरंत ��ाउनलोड",
      buyNow: "अभ��� खरीदें",
      downloadFree: "फ्री ��ाउनलोड करें",
      bundleOffer: "सीम��त समय बंडल ऑफर 🔥",
      save: "बचत करें",
      getBundle: "कम्प्लीट बंडल प्राप्त करें",
      validFor: "ऑफर केवल अगले 24 घंटे के लिए मान्य",
      paymentForm: "अपनी जानकारी पूरी करें",
      fullName: "पूरा नाम",
      emailAddress: "ईमेल पता",
      phoneNumber: "फोन नंबर",
      city: "शहर",
      processing: "प्रसंस्करण...",
      paySecure: "सुरक्षित भुगतान करें",
      downloadYourProducts: "अपने प्र��डक्ट्स डाउनलोड करें",
      purchaseSuccess: "खरीदारी सफल! 🎉",
      thanksForPurchase:
        "आपकी खरीदारी के लिए धन्यवाद! आपके प्रोडक्ट्स डाउनलोड के लिए तैयार हैं।",
      backToShop: "शॉप पर वापस जाएं",
      recentHeadline: "अ��ी-अभी ज��न्होंने अपना किट लिया",
      adminToggleShow: "एडमिन पैनल खोलें",
      adminToggleHide: "एड��िन पैन�� बंद करें",
      instamojoNote:
        "Instamojo ���े भुगतान करने के बाद यह���ँ लौटें और ‘Download’ पर क्लिक करें।",
      instamojoNoteShort:
        "भुगतान के बाद वाप��� आकर ‘Download’ पर क���लिक करें।",
    },
  } as const;

  const currentLang = useMemo(
    () => sanitizeDeep(translations[language]),
    [language],
  );

  const handleDownload = async (productId: string | null, downloadId: string) => {
    if (!productId) {
      return;
    }
    const content = generateProductDownload(
      productId,
      downloadId,
      language,
      quizData,
    );
    const product = getProductConfig(productId);
    const download = product?.downloads.find((item) => item.id === downloadId);

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
      } catch (error) {
        console.warn("Unable to record download", error);
      }
    }
  };

  const handleBundleDownload = () => {
    const bundleProducts = [
      "complete-growth-kit",
      "reels-mastery",
      "brand-masterclass",
      "youtube-mastery",
      "facebook-posting-mastery",
    ];

    bundleProducts.forEach((productId, index) => {
      const product = getProductConfig(productId);
      if (product) {
        product.downloads.forEach((download) => {
          setTimeout(() => {
            void handleDownload(productId, download.id);
          }, (index + 1) * 300);
        });
      }
    });
  };

  const toggleProduct = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      return;
    }
    toggleProductAvailability(productId, !product.isEnabled);
    setProducts(getAllProducts());
  };

  const isProductPurchased = (productId: string) => {
    return (
      purchasedProducts.some((purchase) => purchase.id === productId) ||
      (productId !== "complete-bundle" &&
        purchasedProducts.some((purchase) => purchase.id === "complete-bundle"))
    );
  };

  if (showSuccessPage) {
    const product = getProductConfig(showSuccessPage);
    if (!product) {
      return null;
    }

    return (
      <div className="min-h-screen bg-white">
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
                  onChange={(event) =>
                    setLanguage(event.target.value as "english" | "hindi")
                  }
                  className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  <option value="english">English</option>
                  <option value="hindi">हि��दी</option>
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
                    {language === "hindi" ? "कम्प्लीट बंडल डाउनलोड करें (सभी प्रोडक्ट्स)" : "Download Complete Bundle (All Products)"}
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
                        <Download className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        {download.name}
                      </h3>
                      <button
                        onClick={() => void handleDownload(showSuccessPage, download.id)}
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
                onChange={(event) =>
                  setLanguage(event.target.value as "english" | "hindi")
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
                ? "5000+ क्रिएटर्स का भरोसा • सफलता गार���टी • तुरंत डाउनल���ड"
                : "Trusted by 5000+ creators • Success guaranteed • Instant download"}
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <SupabaseConfigBanner />

        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {currentLang.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {currentLang.subtitle}
          </p>
        </div>

        {recentPurchases.length > 0 && (
          <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4 mb-10">
            <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
              <Zap className="w-4 h-4 text-neon-green" />
              <span>{currentLang.recentHeadline}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentPurchases.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="bg-white border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Admin panel removed for production */}

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
                        {currentLang.expertGuide}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {language === "hindi" && product.id === "complete-growth-kit"
                          ? "कम्प्लीट क्रिएटर ग्रोथ किट"
                          : language === "hindi" && product.id === "reels-mastery"
                            ? "इंस्टाग्राम रील्स मास्टरी कोर्स"
                            : language === "hindi" && product.id === "brand-masterclass"
                              ? "ब्रांड कोलैबोरेशन मास्टरक्लास"
                              : language === "hindi" && product.id === "complete-bundle"
                                ? "कम्प्लीट क्रिएटर बंडल"
                                : product.name}
                      </h3>
                      <p className="text-gray-600 mb-4">{product.description}</p>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold">4.9</span>
                        </div>
                        <span className="text-gray-600">
                          2,547 {currentLang.downloads}
                        </span>
                        {isPurchased && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            ✅ {language === "hindi" ? "खरीदा ग��ा" : "Purchased"}
                          </span>
                        )}
                      </div>

                      <ul className="space-y-2 text-gray-700 mb-6">
                        {product.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-green-700 text-sm">
                          <Shield className="w-4 h-4" />
                          <span className="font-semibold">
                            {language === "hindi"
                              ? "100% संतुष्टि गारंटी"
                              : "100% Satisfaction Guarantee"}
                          </span>
                        </div>
                        <p className="text-green-600 text-xs mt-1">
                          {language === "hindi"
                            ? "तुरंत डाउन���ोड • सफ��ता की गारंटी"
                            : "Instant download • Success guarantee"}
                        </p>
                      </div>
                    </div>

                    <div className="lg:w-80">
                      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900 mb-2">
                            {language === "hindi" ? "फ्री" : "Free"}
                          </div>
                          {product.originalPrice > product.price && (
                            <div className="text-lg text-gray-500 line-through">
                              ₹{product.originalPrice}
                            </div>
                          )}
                          {isPurchased ? (
                            <button
                              onClick={() => setShowSuccessPage(product.id)}
                              className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-600 transition-all mb-4"
                            >
                              <Download className="w-4 h-4 inline mr-2" />
                              {language === "hindi" ? "���्रोडक्���्स डाउनलोड करें" : "Download Products"}
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleBuyClick(product.id)}
                                className="w-full bg-gradient-to-r from-neon-green to-electric-blue text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all mb-4"
                              >
                                <Download className="w-4 h-4 inline mr-2" />
                                {currentLang.downloadFree}
                              </button>
                            </>
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

      {showQuizRequiredPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "hindi"
                ? "�� पहले अपनी प्रोफाइल पू���्ण करें"
                : "❌ Complete Your Profile First"}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === "hindi"
                ? "प्रीमियम टूल्स खरीदने से पहले आ���को केवल 2 मिनट का क्विज़ पूरा करना होगा।"
                : "Before purchasing premium tools, please finish the 2-minute creator quiz."}
            </p>
            <div className="space-y-3">
              <Link
                to="/quiz"
                className="w-full bg-gradient-to-r from-neon-green to-electric-blue text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all inline-block"
              >
                {language === "hindi" ? "🎯 अभी क्विज़ लें" : "🎯 Take the Quiz Now"}
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


      <div className="fixed bottom-4 right-4 md:hidden z-40">
        <div className="flex items-center justify-between gap-3 bg-gray-900 text-white px-4 py-3 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon-green" />
            <div className="text-sm font-bold">
              {language === "hindi" ? "⏰ सीमित समय!" : "⏰ Limited Time!"}
            </div>
          </div>
          <div className="text-xs font-mono bg-white text-gray-900 px-2 py-1 rounded">
            {formatTimeLeft()}
          </div>
          <Link
            to="/quiz"
            className="bg-neon-green text-black px-3 py-1 rounded-full text-sm font-bold hover:bg-emerald-400 transition-colors"
          >
            {language === "hindi" ? "शुरू कर��ं" : "Start Quiz"}
          </Link>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 FameChase.com. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default ShopNew;

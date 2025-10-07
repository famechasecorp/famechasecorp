import React, { useState } from "react";
import { X, Mail } from "lucide-react";

const footerContent = {
  about: {
    title: "📄 About FameChase",
    content: `FameChase helps aspiring influencers and creators unlock their growth potential. Whether you're just starting out or looking to turn your audience into income, we provide personalized insights, tools, and digital products to accelerate your journey.

With AI-powered reports, custom growth strategies, and creator kits designed for Indian and global platforms, we make it easier to grow, brand, and monetize your content—step by step.

Our mission is to make influencer success accessible, strategic, and profitable for creators of all levels.`,
  },
  contact: {
    title: "📬 Contact Us",
    content: `Have a question, feedback, or partnership inquiry?
We're here to help!

📧 Email us at: mail@famechase.com
📍 Address: A1471/9, Indira Nagar Lucknow, UP
📱 Mobile: 8009785785`,
  },
  privacy: {
    title: "🔒 Privacy Policy",
    content: `Effective Date: July 9, 2025

At FameChase, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.

1. What We Collect:
• Personal details (name, email) via forms or purchases
• Quiz responses to generate personalized results
• Device and usage data (via cookies or analytics tools)

2. How We Use It:
• To provide personalized growth plans
• To deliver downloadable content
• To improve our services and user experience
• To communicate updates and offers

3. Your Data Is Safe:
We never sell or share your data with third parties. All information is stored securely and used only for service delivery and improvement.

You can request deletion or correction of your data at any time by emailing mail@famechase.com.`,
  },
  terms: {
    title: "📜 Terms & Conditions (T&C) By Famechase.com",
    content: `Effective Date: July 9, 2025

By using FameChase.com, you agree to the following terms:

1. Use of Service:
Our services and digital downloads are for personal, non-commercial use. You may not redistribute, resell, or republish them.

2. Payments:
All purchases are final. Refunds are governed by our Refund Policy.

3. Intellectual Property:
All content, designs, and tools provided are the intellectual property of FameChase. Unauthorized use is prohibited.

4. Service Availability:
We reserve the right to modify or discontinue services (free or paid) at any time.

5. Contact:
For any questions, email us at mail@famechase.com

by famechase.com`,
  },
  refund: {
    title: "↩️ Refund Policy",
    content: `Effective Date: July 9, 2025

For digital products delivered instantly after purchase, we do not offer refunds.
If you were charged by mistake or have a billing concern, email mail@famechase.com within 7 days and we will review on a case-by-case basis.`,
  },
};

interface ExpandableFooterProps {
  className?: string;
}

export default function ExpandableFooter({
  className = "",
}: ExpandableFooterProps) {
  const [activePopup, setActivePopup] = useState<string | null>(null);

  const openPopup = (section: string) => {
    setActivePopup(section);
  };

  const closePopup = () => {
    setActivePopup(null);
  };

  return (
    <footer
      className={`bg-fame-darker py-12 border-t border-gray-800 ${className}`}
    >
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-xl font-bold text-white mb-4">
              FameChase<span className="text-neon-green">.com</span>
            </div>
            <p className="text-gray-400">
              India's premier platform for aspiring content creators and
              influencers.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <div className="space-y-2 text-sm">
              <div className="text-gray-400">Fame Score Quiz</div>
              <div className="text-gray-400">Creator Tools</div>
              <div className="text-gray-400">Growth Analytics</div>
              <div className="text-gray-400">Monetization Guides</div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <div className="space-y-2 text-sm">
              <div className="text-gray-400">Digital Templates</div>
              <div className="text-gray-400">Brand Outreach Kits</div>
              <div className="text-gray-400">Media Kits</div>
              <div className="text-gray-400">Pricing Guidelines</div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="space-y-2 text-sm">
              <a
                href="mailto:mail@famechase.com"
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                mail@famechase.com
              </a>
              <div className="text-gray-400">Support & Partnerships</div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="border-t border-gray-800 pt-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(footerContent).map(([key, section]) => (
              <button
                key={key}
                onClick={() => openPopup(key)}
                className="bg-fame-dark rounded-lg p-4 text-left hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-white font-medium text-sm">
                  {section.title}
                </span>
                <div className="text-gray-400 text-xs mt-1">
                  Click to read more
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Popup Modal */}
        {activePopup && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-garden-dark">
                  {
                    footerContent[activePopup as keyof typeof footerContent]
                      .title
                  }
                </h2>
                <button
                  onClick={closePopup}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {
                    footerContent[activePopup as keyof typeof footerContent]
                      .content
                  }
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={closePopup}
                  className="w-full bg-neon-green text-black font-semibold py-3 rounded-lg hover:bg-green-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 FameChase.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

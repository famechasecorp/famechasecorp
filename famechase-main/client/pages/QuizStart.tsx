import {
  ArrowRight,
  Target,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Star,
  Users,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function QuizStart() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative z-10 px-4 py-6 bg-white border-b border-gray-100">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-900">
            FameChase<span className="text-neon-green">.com</span>
          </Link>
          <div className="text-gray-600 text-sm font-medium">Step 1 of 5</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50"></div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Progress indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-2">
                <div className="w-12 h-3 bg-neon-green rounded-full"></div>
                <div className="w-12 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-12 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-12 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-12 h-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Ready to Discover Your{" "}
              <span className="bg-gradient-to-r from-neon-green to-electric-blue bg-clip-text text-transparent">
                Creator Potential
              </span>
              ?
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Our AI-powered quiz analyzes your content strategy, audience, and
              growth potential to give you{" "}
              <span className="font-semibold text-gray-900">
                personalized insights and real tools
              </span>{" "}
              to monetize your content.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm border">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 font-medium">
                  100% Free Analysis
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm border">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700 font-medium">
                  15,000+ Creators Helped
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm border">
                <Clock className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700 font-medium">
                  Results in 3 Minutes
                </span>
              </div>
            </div>

            {/* What you'll get */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <Target className="w-12 h-12 text-electric-blue mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Fame Score
                </h3>
                <p className="text-gray-600 text-sm">
                  Your personalized influence rating (0-100) with detailed
                  analysis
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <TrendingUp className="w-12 h-12 text-neon-green mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Growth Plan
                </h3>
                <p className="text-gray-600 text-sm">
                  3-6 month personalized strategy to scale your content
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <DollarSign className="w-12 h-12 text-soft-violet mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Income Potential
                </h3>
                <p className="text-gray-600 text-sm">
                  Realistic revenue projections and monetization roadmap
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <Sparkles className="w-12 h-12 text-electric-blue mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Free Tools
                </h3>
                <p className="text-gray-600 text-sm">
                  Professional media kit, templates, and growth resources
                </p>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-gradient-to-r from-neon-green/10 to-electric-blue/10 rounded-2xl p-8 mb-12 border border-neon-green/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Join Successful Creators
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    15,000+
                  </div>
                  <div className="text-gray-600">Creators Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ₹2.5Cr+
                  </div>
                  <div className="text-gray-600">Revenue Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-1">
                    4.9
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  </div>
                  <div className="text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Success Stories Preview */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Recent Success Stories
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                      S
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Shreya M.
                      </div>
                      <div className="text-gray-600 text-sm">
                        Fashion Creator
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    "Went from 5K to 50K followers in 4 months using the growth
                    strategy. Now earning ₹45K monthly!"
                  </p>
                  <div className="text-neon-green font-semibold text-sm">
                    +₹45K monthly income
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Arjun K.
                      </div>
                      <div className="text-gray-600 text-sm">Tech Reviewer</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    "The media kit template helped me land my first brand deal
                    worth ₹25K within 2 weeks!"
                  </p>
                  <div className="text-electric-blue font-semibold text-sm">
                    First brand deal secured
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                      P
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Priya R.
                      </div>
                      <div className="text-gray-600 text-sm">Fitness Coach</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    "Launched my online course using the monetization roadmap.
                    Made ₹1.2L in first month!"
                  </p>
                  <div className="text-soft-violet font-semibold text-sm">
                    +₹1.2L course sales
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-6">
              <Link
                to="/quiz"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-neon-green to-electric-blue text-black font-bold py-6 px-12 rounded-full text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              >
                Start Your Creator Success Quiz
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>

              <p className="text-gray-600">
                ✓ Takes 3 minutes ✓ 100% Free ✓ Instant results ✓ Real
                downloadable tools
              </p>

              <div className="text-sm text-gray-500">
                No credit card required • No spam • Your data is secure
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-4">
            FameChase<span className="text-neon-green">.com</span>
          </div>
          <p className="text-gray-600 mb-6">
            Empowering creators to build profitable businesses
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 FameChase.com. All rights reserved. | Built for creators, by
            creators.
          </p>
        </div>
      </footer>
    </div>
  );
}

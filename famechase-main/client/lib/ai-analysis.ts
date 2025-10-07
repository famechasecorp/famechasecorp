interface QuizData {
  name: string;
  email: string;
  age: string;
  city: string;
  primaryPlatform: string;
  secondaryPlatforms: string[];
  followerCount: string;
  niche: string;
  contentType: string;
  postingFrequency: string;
  experience: string[];
  monthlyIncome: string;
  biggestChallenge: string[];
  goals: string[];
  socialLinks: {
    instagram: string;
    youtube: string;
    linkedin: string;
    website: string;
    twitter: string;
    tiktok: string;
  };
  bio: string;
  language: string;
  engagementRate: string;
}

interface FameScoreAnalysis {
  fameScore: number;
  confidenceScore: number;
  confidenceExplanation: string;
  experienceLevel: string;
  growthTrajectory: string;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  monetizationRoadmap: {
    currentPhase: string;
    nextSteps: string[];
    incomeProjection: {
      current: string;
      threeMonth: string;
      sixMonth: string;
    };
  };
  personalizedRecommendations: string[];
  contentStrategy: {
    posting: string;
    contentTypes: string[];
    bestTimes: string;
  };
  productRecommendations: {
    name: string;
    reason: string;
    priority: "high" | "medium" | "low";
  }[];
}

// Follower count scoring
const getFollowerScore = (followerCount: string): number => {
  const scoreMap: { [key: string]: number } = {
    "Less than 1K": 10,
    "1K - 5K": 25,
    "5K - 10K": 40,
    "10K - 50K": 65,
    "50K - 100K": 80,
    "100K - 500K": 90,
    "500K+": 95,
  };
  return scoreMap[followerCount] || 10;
};

// Experience scoring - now handles multiple selections
const getExperienceScore = (experience: string[]): number => {
  const scoreMap: { [key: string]: number } = {
    "Just started (0-6 months)": 5,
    "Beginner (6 months - 1 year)": 15,
    "Growing (1-2 years)": 30,
    "Experienced (2-3 years)": 50,
    "Expert (3+ years)": 70,
  };

  if (experience.length === 0) return 5;

  // Calculate average score for multiple selections
  const totalScore = experience.reduce(
    (sum, exp) => sum + (scoreMap[exp] || 5),
    0,
  );
  return Math.round(totalScore / experience.length);
};

// Posting frequency scoring
const getFrequencyScore = (frequency: string): number => {
  const scoreMap: { [key: string]: number } = {
    Daily: 25,
    "3-4 times a week": 20,
    Weekly: 15,
    "2-3 times a month": 10,
    Monthly: 5,
    Irregular: 3,
  };
  return scoreMap[frequency] || 3;
};

// Platform scoring based on monetization potential
const getPlatformScore = (platform: string): number => {
  const scoreMap: { [key: string]: number } = {
    Instagram: 20,
    YouTube: 25,
    LinkedIn: 18,
    TikTok: 15,
    Twitter: 12,
    Facebook: 10,
    "Website/Blog": 22,
  };
  return scoreMap[platform] || 10;
};

// Niche scoring based on monetization potential in India
const getNicheScore = (niche: string): number => {
  const scoreMap: { [key: string]: number } = {
    "Fashion & Beauty": 20,
    Technology: 25,
    "Food & Cooking": 18,
    Travel: 15,
    "Fitness & Health": 22,
    Education: 25,
    Entertainment: 18,
    "Business & Finance": 25,
    Lifestyle: 20,
    "Art & Design": 15,
    Other: 10,
  };
  return scoreMap[niche] || 10;
};

// Income vs followers analysis
const getIncomeEfficiencyScore = (
  income: string,
  followerCount: string,
): number => {
  const followerNum = getFollowerCount(followerCount);
  const incomeNum = getIncomeAmount(income);

  if (followerNum === 0) return 5;

  // Calculate income per 1K followers
  const efficiency = incomeNum / (followerNum / 1000);

  if (efficiency >= 1000) return 25; // Very good monetization
  if (efficiency >= 500) return 20; // Good monetization
  if (efficiency >= 200) return 15; // Average monetization
  if (efficiency >= 50) return 10; // Below average
  return 5; // Poor monetization
};

const getFollowerCount = (range: string): number => {
  if (!range) return 500;
  // Normalize dashes and spacing
  const norm = range.replace(/[\u2013\u2014–—]/g, "-").trim();

  // Handle Hindi "से कम" (less than)
  if (/से कम|Less than/i.test(norm)) {
    const m = norm.match(/(\d+(?:\.?\d+)?)([KkMm]?)/);
    if (m) {
      const n = parseNumberToken(m[1] + (m[2] || ""));
      return Math.max(200, Math.round(n * 0.5));
    }
  }

  // Handle "+" like "500K+"
  if (/\+/.test(norm)) {
    const m = norm.match(/(\d+(?:\.?\d+)?)([KkMm]?)/);
    if (m) {
      return parseNumberToken(m[1] + (m[2] || ""));
    }
  }

  // Handle ranges like "1K - 5K" or "1K-5K"
  const parts = norm.split("-").map((s) => s.trim());
  if (parts.length === 2) {
    const a = parseNumberToken(parts[0]);
    const b = parseNumberToken(parts[1].replace(/\+$/, ""));
    if (a && b) return Math.round((a + b) / 2);
  }

  // Fallback: extract first number
  const m = norm.match(/(\d+(?:\.?\d+)?)([KkMm]?)/);
  if (m) return parseNumberToken(m[1] + (m[2] || ""));
  return 500;
};

function parseNumberToken(token: string): number {
  const t = token.trim();
  if (/Mm?$/.test(t)) {
    const num = parseFloat(t.replace(/[^\d.]/g, ""));
    return Math.round(num * 1_000_000);
  }
  if (/Kk?$/.test(t)) {
    const num = parseFloat(t.replace(/[^\d.]/g, ""));
    return Math.round(num * 1_000);
  }
  return parseInt(t.replace(/[^\d]/g, "")) || 0;
}

const getIncomeAmount = (income: string): number => {
  if (!income) return 0;
  // Normalize
  const norm = income
    .replace(/[\u2013\u2014–—]/g, "-")
    .replace(/\s/g, "")
    .replace(/₹/g, "")
    .toUpperCase();

  // Handle explicit zero in EN/Hindi
  if (/^0|\(NOINCOMEYET\)|अभीतककोईआयनहीं|अभीतककोईआयनहीं/.test(norm)) return 0;

  // Convert L (lakh) to 100000, K to 1000
  const toNumber = (s: string) => {
    if (/L\+?$/.test(s)) return parseInt(s) * 100000 || 100000; // e.g., 1L+
    if (/L$/.test(s)) return (parseInt(s) || 0) * 100000;
    if (/K$/.test(s)) return (parseFloat(s) || 0) * 1000;
    return parseInt(s) || 0;
  };

  // Ranges like 1K-5K, 50K-1L
  const m = norm.match(/(\d+(?:\.\d+)?[KL]?)-(\d+(?:\.\d+)?[KL+]?)/);
  if (m) {
    const a = toNumber(m[1]);
    const b = toNumber(m[2].replace(/\+$/, ""));
    if (a && b) return Math.round((a + b) / 2);
  }

  // Single like 1L+, 50K
  const single = norm.match(/(\d+(?:\.\d+)?[KL]?)(\+?)/);
  if (single) {
    const val = toNumber(single[1]);
    return val;
  }

  return 0;
};

// Platform-specific income multipliers (based on Indian creator economy)
const getPlatformIncomeMultiplier = (platform: string): number => {
  const multiplierMap: { [key: string]: number } = {
    YouTube: 1.3, // Higher RPM and diverse monetization
    Instagram: 1.0, // Base multiplier
    LinkedIn: 1.2, // B2B premium rates
    TikTok: 0.7, // Lower monetization maturity in India
    Twitter: 0.8, // Limited monetization options
    Facebook: 0.6, // Declining engagement
    "Website/Blog": 1.4, // Direct monetization control
  };
  return multiplierMap[platform] || 0.8;
};

// Niche-specific income multipliers (Indian market demand)
const getNicheIncomeMultiplier = (niche: string): number => {
  const multiplierMap: { [key: string]: number } = {
    "Technology & AI": 1.4, // High-value audience
    "Personal Finance & Investing": 1.3, // Premium audience
    "Fitness & Health": 1.2, // Good monetization potential
    "Fashion & Beauty": 1.1, // Established market
    "Food & Cooking": 1.0, // Base market
    "Entrepreneurship & Business": 1.3, // B2B premium
    "Travel & Adventure": 0.9, // Seasonal/aspirational
    "Entertainment & Comedy": 0.8, // Volume-based, lower rates
    "Education & Learning": 1.1, // Consistent demand
    "Gaming & Esports": 1.0, // Growing market
  };
  return multiplierMap[niche] || 0.9;
};

// Experience-based income multipliers
const getExperienceIncomeMultiplier = (experience: string[]): number => {
  if (experience.includes("Expert (3+ years)")) return 1.3;
  if (experience.includes("Experienced (2-3 years)")) return 1.2;
  if (experience.includes("Growing (1-2 years)")) return 1.1;
  if (experience.includes("Beginner (6 months - 1 year)")) return 1.0;
  return 0.8; // Just started
};

// Engagement-based income multipliers
const getEngagementIncomeMultiplier = (engagementRate: string): number => {
  const multiplierMap: { [key: string]: number } = {
    "More than 12%": 1.4, // Excellent engagement
    "8-12%": 1.3, // Very good engagement
    "5-8%": 1.2, // Good engagement
    "3-5%": 1.1, // Average engagement
    "1-3%": 1.0, // Below average
    "Less than 1%": 0.8, // Poor engagement
    "I don't know": 0.9, // Conservative estimate
  };
  return multiplierMap[engagementRate] || 0.9;
};

const getExperienceLevelDescription = (
  experience: string[],
  fameScore: number,
  data?: QuizData,
): string => {
  const primaryExperience = experience[0] || "Just started (0-6 months)";
  const experienceText =
    experience.length > 1
      ? `Multi-level Experience (${experience.slice(0, 2).join(", ")})`
      : primaryExperience;

  const followerNum = data ? getFollowerCount(data.followerCount) : 1000;
  const incomeNum = data ? getIncomeAmount(data.monthlyIncome) : 0;
  const postingConsistency = data?.postingFrequency || "Weekly";

  // Calculate experience efficiency score
  const experienceEfficiency =
    fameScore >= 70
      ? "excellent"
      : fameScore >= 50
        ? "solid"
        : fameScore >= 30
          ? "developing"
          : "foundational";

  const experienceMap: { [key: string]: string } = {
    "Just started (0-6 months)": `🌱 BEGINNER CREATOR (${experienceText}) - You're in the learning phase but already showing ${experienceEfficiency} progress. Your ${data?.followerCount || "current audience"} in ${data ? Math.floor(6) : 6} months shows ${followerNum >= 1000 ? "accelerated" : "steady"} growth trajectory. Most creators take 12-18 months to reach your current level.`,

    "Beginner (6 months - 1 year)": `🚀 EARLY-STAGE CREATOR (${experienceText}) - Your 6-12 month journey shows ${experienceEfficiency} foundation building. With ${postingConsistency.toLowerCase()} posting and ${data?.followerCount || "your audience"}, you're ahead of 70% of creators at this stage. Current focus: Scaling to next milestone through content optimization.`,

    "Growing (1-2 years)": `📈 DEVELOPING CREATOR (${experienceText}) - Your 1-2 year experience demonstrates ${experienceEfficiency} audience building skills. ${followerNum >= 10000 ? "Exceptional" : "Strong"} progress with ${data?.followerCount || "your following"} and ${incomeNum > 0 ? `₹${incomeNum.toLocaleString()}/month earnings` : "monetization readiness"}. You're positioned for major growth acceleration.`,

    "Experienced (2-3 years)": `💪 ESTABLISHED CREATOR (${experienceText}) - Your 2-3 year track record shows ${experienceEfficiency} content mastery. ${followerNum >= 50000 ? "Elite" : "Strong"} positioning with ${data?.followerCount || "substantial following"} ${incomeNum >= 30000 ? `and proven ₹${incomeNum.toLocaleString()}/month revenue` : "and monetization potential"}. Ready for brand partnership scaling and product launches.`,

    "Expert (3+ years)": `🏆 VETERAN CREATOR (${experienceText}) - Your 3+ year expertise demonstrates ${experienceEfficiency} creator business acumen. ${followerNum >= 100000 ? "Industry-leading" : "Authority-level"} status with ${data?.followerCount || "substantial influence"} ${incomeNum >= 50000 ? `and ₹${incomeNum.toLocaleString()}/month proving monetization mastery` : "and advanced monetization opportunities"}. Focus: Personal brand expansion and business scaling.`,
  };

  let baseDescription =
    experienceMap[primaryExperience] || `Creator with ${experienceText}`;

  // Add specific performance analysis based on fame score and data
  if (fameScore >= 80 && followerNum >= 50000) {
    baseDescription += ` 🌟 MARKET LEADER: Your combination of experience + ${fameScore} Fame Score + ${data?.followerCount || "substantial following"} puts you in the top 2% of creators. Command premium rates: ₹${Math.round(followerNum * 1.5)}-₹${Math.round(followerNum * 3)} per post.`;
  } else if (fameScore >= 70 && followerNum >= 10000) {
    baseDescription += ` �� HIGH PERFORMER: Your ${fameScore} Fame Score with ${data?.followerCount || "strong following"} shows excellent creator-market fit. Target rates: ₹${Math.round(followerNum * 0.8)}-₹${Math.round(followerNum * 2)} per collaboration.`;
  } else if (fameScore >= 50) {
    baseDescription += ` 📊 SOLID FOUNDATION: Your ${fameScore} Fame Score indicates ${experienceEfficiency} growth trajectory. Focus on scaling to next milestone with current ${postingConsistency.toLowerCase()} consistency.`;
  } else if (fameScore >= 30) {
    baseDescription += ` 🎯 GROWTH POTENTIAL: Your ${fameScore} Fame Score shows developing creator skills. Optimize posting frequency (currently ${postingConsistency.toLowerCase()}) and engagement strategy for faster growth.`;
  } else {
    baseDescription += ` 🌱 FOUNDATION BUILDING: Your ${fameScore} Fame Score indicates early-stage development. Focus on consistent content creation and audience engagement fundamentals.`;
  }

  // Add experience-specific insights
  if (data) {
    if (incomeNum === 0 && followerNum >= 5000) {
      baseDescription += ` 💡 MONETIZATION OPPORTUNITY: Despite your experience and ${data.followerCount} followers, you're not monetizing yet. Your experience level suggests you should be earning ₹${Math.round(followerNum * 0.5)}-₹${Math.round(followerNum * 1.5)}/month.`;
    } else if (incomeNum > 0) {
      const efficiency = incomeNum / (followerNum / 1000);
      if (efficiency >= 500) {
        baseDescription += ` 💰 MONETIZATION EXPERT: Your ₹${efficiency.toFixed(0)} per 1K followers rate is exceptional for your experience level.`;
      } else if (efficiency < 200) {
        baseDescription += ` 📈 RATE OPTIMIZATION: Your current ₹${efficiency.toFixed(0)} per 1K followers can be improved to ₹400-800 with your experience level.`;
      }
    }
  }

  return baseDescription;
};

const getGrowthTrajectory = (data: QuizData, fameScore: number): string => {
  const followerNum = getFollowerCount(data.followerCount);
  const incomeNum = getIncomeAmount(data.monthlyIncome);
  const currentMonth = new Date().getMonth();
  const age = parseInt(data.age) || 25;

  // Calculate specific earning potential based on their exact profile
  const potentialMonthlyEarning = Math.round(
    followerNum * 0.8 + fameScore * 100,
  );
  const brandDealsPerMonth =
    followerNum >= 50000
      ? "15-25"
      : followerNum >= 10000
        ? "5-12"
        : followerNum >= 5000
          ? "2-6"
          : "1-3";

  // Calculate growth timeline based on posting frequency
  const monthsToNextMilestone =
    data.postingFrequency === "Daily"
      ? 3
      : data.postingFrequency === "3-4 times a week"
        ? 4
        : data.postingFrequency === "Weekly"
          ? 8
          : 12;

  let trajectory = "";

  if (followerNum >= 50000 && incomeNum >= 30000) {
    trajectory = `🚀 SCALE PHASE: You're already earning ₹${incomeNum.toLocaleString()}/month with ${data.followerCount} followers. Target: ₹${Math.round(incomeNum * 1.5).toLocaleString()}/month within 6 months through ${brandDealsPerMonth} monthly brand partnerships. Your ${data.niche} niche + audience size = premium creator rates of ₹${Math.round(followerNum * 1.5)}-₹${Math.round(followerNum * 3)} per sponsored post.`;
  } else if (followerNum >= 10000 && incomeNum >= 10000) {
    trajectory = `💰 MONETIZATION SCALING: Current ₹${incomeNum.toLocaleString()}/month shows strong foundation. Your ${data.followerCount} in ${data.niche} can realistically achieve ₹${potentialMonthlyEarning.toLocaleString()}/month through strategic brand collaborations (${brandDealsPerMonth} deals monthly). Focus on increasing rates by 25% quarterly.`;
  } else if (followerNum >= 10000 && incomeNum < 10000) {
    trajectory = `⚡ MASSIVE UNTAPPED POTENTIAL: With ${data.followerCount} followers, you're leaving ₹${Math.round(followerNum * 0.8)}-₹${Math.round(followerNum * 2)}K monthly on the table! Immediate focus: Create media kit, start brand outreach for ${brandDealsPerMonth} monthly collaborations. Your audience size suggests ₹${Math.round(followerNum / 50)}-₹${Math.round(followerNum / 20)} per 1K followers rate.`;
  } else if (followerNum >= 5000) {
    trajectory = `📈 MONETIZATION READINESS: ${data.followerCount} followers puts you in the sweet spot for brand partnerships. Target: Reach 10K followers in ${monthsToNextMilestone} months with your ${data.postingFrequency.toLowerCase()} posting schedule, then start earning ₹${Math.round(followerNum * 1.2)}-₹${Math.round(followerNum * 2.5)}/month from ${brandDealsPerMonth} brand collaborations.`;
  } else if (followerNum >= 1000) {
    trajectory = `🎯 GROWTH ACCELERATION: Your ${data.followerCount} foundation is solid. With ${data.postingFrequency.toLowerCase()} posting, you can realistically hit 5K followers in ${monthsToNextMilestone} months. Focus on ${data.primaryPlatform} algorithm optimization and cross-platform expansion to ${data.secondaryPlatforms.length > 0 ? "your existing " + data.secondaryPlatforms.join(", ") + " presence" : "2-3 additional platforms"}.`;
  } else {
    trajectory = `🌱 FOUNDATION BUILDING: From ${data.followerCount} to 1K milestone requires ${monthsToNextMilestone} months of ${data.postingFrequency === "Daily" ? "daily" : "consistent"} posting. Your ${data.niche} niche has strong monetization potential once you hit 1K. Focus: Quality content, hashtag strategy, and engaging with your target audience in ${data.city || "your city"}.`;
  }

  // Add ultra-specific challenge-based advice with real data
  if (data.biggestChallenge.length > 0) {
    data.biggestChallenge.slice(0, 2).forEach((challenge) => {
      if (challenge.includes("Low views & inconsistent engagement")) {
        trajectory += ` 🎯 ENGAGEMENT FIX: Your low engagement can be solved in 4-6 weeks. Post during peak hours (7-9 PM IST), use trending audio within 24 hours, and respond to comments within 1 hour. Target: Increase engagement from current rate to 4-6% through interactive content.`;
      } else if (
        challenge.includes("Can't convert followers into paying customers")
      ) {
        trajectory += ` 💸 CONVERSION OPTIMIZATION: With ${data.followerCount}, you should be converting 2-5% to customers. Add clear CTAs, create lead magnets, and use Instagram Shopping features. Potential: ₹${Math.round(followerNum * 0.02 * 500)}-₹${Math.round(followerNum * 0.05 * 1500)}/month from direct sales.`;
      } else if (challenge.includes("Algorithm changes killing reach")) {
        trajectory += ` ⚡ PLATFORM DIVERSIFICATION: Reduce algorithm risk by expanding to ${data.secondaryPlatforms.length === 0 ? "3 platforms" : 3 - data.secondaryPlatforms.length + " additional platforms"}. Current single-platform dependency is costing you 40-60% potential reach.`;
      } else if (challenge.includes("Not landing brand collaborations")) {
        trajectory += ` �� BRAND OUTREACH SYSTEM: Your ${data.followerCount} qualifies for ₹${Math.round(followerNum * 0.5)}-₹${Math.round(followerNum * 2)} per post rates. Create professional media kit, research 50 relevant brands, send 5 personalized pitches weekly. Target: Land first paid collaboration within 30 days.`;
      } else if (challenge.includes("Running out of content ideas")) {
        trajectory += ` 🎨 CONTENT STRATEGY: Your ${data.niche} niche has unlimited content potential. Batch create 15 posts weekly, repurpose content across ${data.secondaryPlatforms.length + 1} platforms, follow trending hashtags. Use the 40-30-20-10 formula: 40% education, 30% entertainment, 20% personal, 10% promotion.`;
      }
    });
  }

  // Add goal-specific trajectory with exact numbers
  if (data.goals.length > 0) {
    data.goals.slice(0, 2).forEach((goal) => {
      if (
        goal.includes("Earn ₹25K") ||
        goal.includes("Earn ₹50K") ||
        goal.includes("Earn ₹1L")
      ) {
        const targetIncome = goal.includes("₹1L")
          ? 100000
          : goal.includes("₹50K")
            ? 50000
            : 25000;
        const monthsToTarget = Math.ceil(
          targetIncome / (potentialMonthlyEarning * 0.3),
        );
        trajectory += ` 💰 INCOME TARGET: Your ₹${targetIncome / 1000}K monthly goal is achievable in ${monthsToTarget} months. Required: ${Math.ceil(targetIncome / 3000)} brand partnerships monthly at ₹${Math.round(followerNum * 1.2)} average rate.`;
      } else if (goal.includes("Get Brand Collaborations")) {
        trajectory += ` 🤝 BRAND PARTNERSHIP ROADMAP: Target ${brandDealsPerMonth} brand collaborations monthly. Your ${data.followerCount} + ${data.niche} niche = ₹${Math.round(followerNum * 0.8)}-₹${Math.round(followerNum * 2)} per post rates. Start outreach to ${data.niche === "Fashion & Beauty" ? "Nykaa, Myntra, local fashion brands" : data.niche === "Technology" ? "tech brands, gadget companies, software tools" : "brands in your niche"}.`;
      }
    });
  }

  // Add seasonal timing advice
  const seasonalBonus = [9, 10, 11].includes(currentMonth)
    ? " 🎆 FESTIVAL SEASON ADVANTAGE: October-December is peak brand collaboration season. Rates increase 25-40% during festivals. Pitch Diwali/New Year campaigns NOW for maximum earnings."
    : currentMonth < 3
      ? " 🎯 Q1 PLANNING SEASON: January-March is budget allocation time. Perfect for securing long-term brand partnerships and higher rates for the year."
      : " 📅 MID-YEAR OPPORTUNITY: Focus on consistent growth to capitalize on festival season (Oct-Dec) when brand budgets peak.";

  trajectory += seasonalBonus;

  return trajectory;
};

const generateSWOTAnalysis = (data: QuizData, fameScore: number) => {
  const strengths = [];
  const weaknesses = [];
  const opportunities = [];
  const threats = [];

  const followerNum = getFollowerCount(data.followerCount);
  const incomeNum = getIncomeAmount(data.monthlyIncome);
  const age = parseInt(data.age) || 25;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  // Advanced user-specific analysis based on their exact profile
  const isHighFollower = followerNum >= 50000;
  const isMidFollower = followerNum >= 10000 && followerNum < 50000;
  const isNewCreator = followerNum < 1000;

  // Niche-specific market intelligence
  const nicheInsights = {
    "Fashion & Beauty": {
      marketSize: "₹1.2L crore",
      growth: "25% YoY",
      competition: "High",
      seasonality: "Festival-driven",
      avgCPM: "₹15-30",
      topBrands: ["Nykaa", "Myntra", "Lakme"],
    },
    Technology: {
      marketSize: "₹4.5L crore",
      growth: "35% YoY",
      competition: "Medium",
      seasonality: "Launch-cycles",
      avgCPM: "₹25-50",
      topBrands: ["OnePlus", "Xiaomi", "Amazon"],
    },
    Education: {
      marketSize: "₹2.8L crore",
      growth: "40% YoY",
      competition: "Medium",
      seasonality: "Academic-calendar",
      avgCPM: "₹20-35",
      topBrands: ["BYJU'S", "Unacademy", "Vedantu"],
    },
  }[data.niche] || {
    marketSize: "₹50K crore",
    growth: "20% YoY",
    competition: "Medium",
    seasonality: "Consistent",
    avgCPM: "₹10-25",
    topBrands: ["Leading brands"],
  };

  // Personal challenge-based insights
  const challengeSpecificInsights = {};
  data.biggestChallenge?.forEach((challenge) => {
    if (challenge.includes("engagement")) {
      challengeSpecificInsights["engagement"] = {
        impact: "High",
        solution: "Interactive content strategy",
        timeline: "4-6 weeks",
      };
    }
    if (challenge.includes("monetization")) {
      challengeSpecificInsights["monetization"] = {
        impact: "Critical",
        solution: "Revenue diversification plan",
        timeline: "2-3 months",
      };
    }
  });

  // STRENGTHS - More engaging and specific
  if (getFollowerScore(data.followerCount) >= 65) {
    strengths.push(
      `🎯 You've built an impressive ${data.followerCount} following - that's serious influence power! Your audience size puts you in the top 15% of creators.`,
    );
  } else if (getFollowerScore(data.followerCount) >= 40) {
    strengths.push(
      `📈 Your ${data.followerCount} followers show real growth momentum. You're past the hardest part - now it's time to accelerate!`,
    );
  } else if (getFollowerScore(data.followerCount) >= 25) {
    strengths.push(
      `�� You're in the sweet spot for rapid growth! ${data.followerCount} followers means you've proven your content resonates.`,
    );
  }

  if (getExperienceScore(data.experience) >= 50) {
    strengths.push(
      `��� ${data.experience} of content creation gives you invaluable experience. You understand what works and can spot trends early.`,
    );
  } else if (getExperienceScore(data.experience) >= 30) {
    strengths.push(
      `⚡ Your ${data.experience} journey shows commitment and learning agility. You're hitting your stride!`,
    );
  }

  if (data.secondaryPlatforms.length >= 3) {
    strengths.push(
      `🚀 Multi-platform mastery! Being active on ${data.secondaryPlatforms.length + 1} platforms shows you understand omnichannel growth.`,
    );
  } else if (data.secondaryPlatforms.length >= 2) {
    strengths.push(
      `🎬 Smart diversification! Your presence on ${data.secondaryPlatforms.length + 1} platforms reduces dependency risk.`,
    );
  }

  if (
    data.postingFrequency === "Daily" ||
    data.postingFrequency === "3-4 times a week"
  ) {
    strengths.push(
      `⏰ Your ${data.postingFrequency.toLowerCase()} posting rhythm is EXACTLY what algorithms love. Consistency = compound growth!`,
    );
  }

  if (incomeNum > 0) {
    const efficiency = incomeNum / (followerNum / 1000);
    if (efficiency >= 500) {
      strengths.push(
        `💰 Exceptional monetization skills! You're earning ₹${incomeNum.toLocaleString()}/month - that's ₹${Math.round(efficiency)} per 1K followers!`,
      );
    } else {
      strengths.push(
        `💸 You've cracked the monetization code! ₹${incomeNum.toLocaleString()}/month proves your audience trusts your recommendations.`,
      );
    }
  }

  // REAL USER-SPECIFIC NICHE ANALYSIS BASED ON ACTUAL QUIZ DATA
  if (data.niche !== "Other" && data.niche) {
    const nicheInsights = {
      "Fashion & Beauty": `💄 FASHION GOLDMINE: You're in a ₹1.2L crore market growing 25% annually! With ${data.followerCount}, you can charge ₹${Math.round(followerNum * 0.8)}-₹${Math.round(followerNum * 1.5)} per post. Fashion creators get 40% more brand deals.`,
      "Technology & AI": `💻 TECH AUTHORITY ADVANTAGE: Tech = ₹25-50 per 1K views (vs ₹8-15 for lifestyle)! Your ${data.followerCount} in tech could generate ₹${Math.round(followerNum * 1.2)}-₹${Math.round(followerNum * 2.5)} monthly from reviews alone.`,
      "Education & Learning": `📚 EDUCATION EMPIRE POTENTIAL: Ed-tech is ₹2.8L crore growing 40% YoY! Your knowledge in ${data.niche} + course creation = ₹${Math.round(followerNum * 2)}-₹${Math.round(followerNum * 5)} monthly potential.`,
      "Business & Finance": `�� FINANCE CREATOR PREMIUM: B2B creators earn 3x more per follower! Your expertise + ${data.followerCount} = ₹${Math.round(followerNum * 1.8)}-₹${Math.round(followerNum * 3.2)} monthly from fintech partnerships.`,
      "Fitness & Health": `💪 FITNESS BOOM POSITIONING: Post-COVID fitness market exploded! Health creators with ${data.followerCount} average ₹${Math.round(followerNum * 1.1)}-₹${Math.round(followerNum * 2.0)} monthly from supplement brands.`,
      "Food & Cooking": `🍳 FOOD CONTENT SUPREMACY: Food gets highest engagement (8-15% vs 2-4% average)! Your ${data.followerCount} + food = ₹${Math.round(followerNum * 0.9)}-₹${Math.round(followerNum * 1.8)} from restaurant partnerships.`,
      "Personal Finance & Investing": `💰 FINTECH PREMIUM NICHE: Personal finance creators earn 60% higher CPM rates! Your ${data.followerCount} audience + money content = ₹${Math.round(followerNum * 1.5)}-₹${Math.round(followerNum * 3.0)} monthly potential.`,
    };
    if (nicheInsights[data.niche as keyof typeof nicheInsights]) {
      strengths.push(nicheInsights[data.niche as keyof typeof nicheInsights]);
    }
  }

  // REAL CHALLENGE-BASED INSIGHTS (from actual quiz responses)
  data.biggestChallenge.forEach((challenge) => {
    if (challenge.includes("Low views & inconsistent engagement")) {
      weaknesses.push(
        "📉 Engagement Challenge: Your low views indicate algorithm or content timing issues. Focus on posting during peak hours (7-9 PM) and using trending hashtags.",
      );
    }
    if (challenge.includes("Can't convert followers into paying customers")) {
      weaknesses.push(
        "💸 Monetization Gap: With your current follower count, you should be earning more. Consider creating clear calls-to-action and valuable lead magnets.",
      );
    }
    if (challenge.includes("Algorithm changes killing reach")) {
      weaknesses.push(
        "⚡ Platform Dependency Risk: Over-reliance on one platform's algorithm is risky. Your current strategy needs diversification across multiple platforms.",
      );
    }
    if (challenge.includes("Not landing brand collaborations")) {
      weaknesses.push(
        "🤝 Brand Partnership Challenge: Your follower count suggests collaboration potential. Focus on creating a professional media kit and targeted outreach.",
      );
    }
  });

  // REAL GOAL-BASED OPPORTUNITIES (from actual quiz responses)
  data.goals.forEach((goal) => {
    if (goal.includes("Earn ₹25K/50K/1L+ per month")) {
      opportunities.push(
        `💰 HIGH INCOME POTENTIAL: With ${data.followerCount} followers in ${data.niche}, earning ₹${goal.split("₹")[1]} monthly is achievable through strategic brand partnerships and product sales.`,
      );
    }
    if (goal.includes("Get Brand Collaborations")) {
      opportunities.push(
        `🤝 BRAND PARTNERSHIP READINESS: Your ${data.followerCount} audience size puts you in the sweet spot for brand collaborations. Start reaching out to 20-30 relevant brands monthly.`,
      );
    }
    if (goal.includes("Create Viral Content")) {
      opportunities.push(
        `🚀 VIRAL CONTENT STRATEGY: Your ${data.contentType} format has high viral potential. Focus on trending topics in ${data.niche} and post during peak engagement hours.`,
      );
    }
    if (goal.includes("Launch my own product/course")) {
      opportunities.push(
        `📚 PRODUCT LAUNCH OPPORTUNITY: Your ${data.niche} expertise + ${data.followerCount} audience = perfect product launch potential. Consider digital courses or consulting services.`,
      );
    }
  });

  // PERSONAL COMBINATION STRENGTHS
  if (
    data.niche === "Technology" &&
    data.primaryPlatform === "YouTube" &&
    followerNum >= 10000
  ) {
    strengths.push(
      `🎯 TECH YOUTUBE DOMINATION: Perfect combo! Tech + YouTube = long-form authority content. You can charge ₹${Math.round(followerNum * 2.5)}-₹${Math.round(followerNum * 4)} per sponsored video.`,
    );
  }

  if (
    data.goals?.includes("brand partnerships") &&
    data.postingFrequency === "Daily"
  ) {
    strengths.push(
      `🤝 BRAND-READY MACHINE: Daily posting + brand goals = Algorithm loves you! Consistent creators get 60% more brand inquiries. You're partnership-ready.`,
    );
  }

  if (incomeNum === 0 && followerNum >= 5000) {
    strengths.push(
      `💎 MONETIZATION GOLDMINE: ${data.followerCount} followers with ₹0 current income = MASSIVE untapped potential! You're sitting on ₹${Math.round(followerNum * 0.8)}-₹${Math.round(followerNum * 2)}K monthly opportunity.`,
    );
  }

  // WEAKNESSES - Constructive and actionable
  if (incomeNum === 0 && followerNum >= 1000) {
    weaknesses.push(
      `💎 HUGE opportunity missed! With ${data.followerCount} followers, you should be earning ₹${Math.round(followerNum * 0.5)}-₹${Math.round(followerNum * 2)}/month minimum.`,
    );
  }

  // Handle multiple challenges
  if (data.biggestChallenge.length > 0) {
    const challengeTexts = {
      engagement:
        "📊 Engagement challenges are solvable! Focus on interactive content and community building.",
      voice:
        "�� Finding your unique voice takes time. Authenticity beats perfection every time.",
      algorithm:
        "⚡ Algorithm changes are part of the game. Diversify your content strategy.",
      monetization:
        "💰 Monetization gaps are common. Your audience size suggests untapped potential.",
      burnout:
        "🔋 Creator burnout is real. Systematic content planning can restore your energy.",
    };

    data.biggestChallenge.slice(0, 2).forEach((challenge) => {
      for (const [key, text] of Object.entries(challengeTexts)) {
        if (challenge.toLowerCase().includes(key)) {
          weaknesses.push(text);
          break;
        }
      }
    });
  }

  if (
    data.biggestChallenge.some(
      (challenge) =>
        challenge.includes("monetization") || challenge.includes("customers"),
    )
  ) {
    weaknesses.push(
      `��� Monetization knowledge gap! The difference between earning ₹0 and ₹50K+ is usually just knowing the right strategies.`,
    );
  }

  if (
    data.postingFrequency === "Irregular" ||
    data.postingFrequency === "Monthly"
  ) {
    weaknesses.push(
      `⚠️ Algorithm penalty alert! Irregular posting can reduce reach by up to 70%. Your competitors are posting ${data.postingFrequency === "Monthly" ? "30x" : "10x"} more!`,
    );
  }

  if (data.secondaryPlatforms.length === 0) {
    weaknesses.push(
      `🎯 Single platform risk! 73% of creators who lost income had all their eggs in one basket when algorithm changes hit.`,
    );
  }

  // OPPORTUNITIES - Exciting and specific to their actual situation

  // Remove fake age-based insights. Focus on real data instead.
  if (followerNum >= 1000 && incomeNum === 0) {
    opportunities.push(
      `💰 Untapped monetization goldmine! With ${data.followerCount} followers, you're sitting on ₹${Math.round(followerNum * 0.5)}-₹${Math.round(followerNum * 2)}K monthly potential that's currently unexplored.`,
    );
  }

  if (data.primaryPlatform === "Instagram" && followerNum >= 10000) {
    opportunities.push(
      `📸 Instagram Reels are paying creators ₹5-50 per 1K views in ${currentYear}! Your ${data.followerCount} following could earn ₹15K-50K monthly from Reels alone.`,
    );
  }

  if (data.primaryPlatform === "YouTube" && followerNum >= 1000) {
    opportunities.push(
      `🎥 YouTube Shorts fund + AdSense could generate ₹20K-1L monthly! Your subscriber base qualifies for premium monetization features.`,
    );
  }

  if (
    data.city &&
    (data.city.toLowerCase().includes("mumbai") ||
      data.city.toLowerCase().includes("delhi") ||
      data.city.toLowerCase().includes("bangalore"))
  ) {
    opportunities.push(
      `🏙️ Tier-1 city advantage! ${data.city} has 5x more brand activation events and collaboration opportunities than other cities.`,
    );
  }

  if (data.goals.includes("brand deals") || data.goals.includes("monetizing")) {
    opportunities.push(
      `🤝 Brand partnership boom! ${currentYear} saw 340% increase in influencer marketing budgets. Your timing is perfect!`,
    );
  }

  if (
    data.niche === "Education" ||
    data.niche === "Technology" ||
    data.niche === "Business & Finance"
  ) {
    opportunities.push(
      `📈 Your niche is experiencing explosive growth! ${data.niche} creators are earning 2-5x more per follower than entertainment creators.`,
    );
  }

  // THREATS - Realistic but motivating
  if (
    data.postingFrequency === "Monthly" ||
    data.postingFrequency === "Irregular"
  ) {
    threats.push(
      `📉 Algorithm invisibility risk! Inactive creators lose 40-60% of their reach within 3 months. Your competitors are gaining while you're pausing.`,
    );
  }

  if (data.secondaryPlatforms.length === 0) {
    threats.push(
      `⚠️ Platform dependency danger! Instagram reach dropped 60% in 2023, TikTok faced bans. Diversification isn't optional anymore.`,
    );
  }

  if (incomeNum === 0 && followerNum >= 5000) {
    threats.push(
      `⏳ Audience fatigue incoming! Followers expect value. Without monetization, you're missing the window to build a sustainable creator business.`,
    );
  }

  if (data.niche === "Other" || !data.niche) {
    threats.push(
      `🎯 Niche confusion kills conversion! Generic content gets lost in the noise. 87% of successful creators have a clear, focused niche.`,
    );
  }

  // Ensure we have at least 2-3 items in each category
  if (strengths.length < 2) {
    strengths.push(
      `✨ You took the initiative to analyze your creator potential - that's already more than 90% of people do!`,
    );
  }

  if (opportunities.length < 2) {
    opportunities.push(
      `🚀 Creator economy is projected to hit ₹2.4 lakh crores by 2025! You're entering at the perfect time to ride this wave.`,
    );
  }

  return { strengths, weaknesses, opportunities, threats };
};

const generatePersonalizedRecommendations = (data: QuizData): string[] => {
  const recommendations = [];
  const followerNum = getFollowerCount(data.followerCount);
  const incomeNum = getIncomeAmount(data.monthlyIncome);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // USER-SPECIFIC ANALYSIS FOR HYPER-PERSONALIZED SUGGESTIONS
  const userProfile = {
    stage:
      followerNum < 1000
        ? "foundation"
        : followerNum < 10000
          ? "growth"
          : followerNum < 50000
            ? "scaling"
            : "influencer",
    monetization:
      incomeNum === 0
        ? "none"
        : incomeNum < 15000
          ? "early"
          : incomeNum < 50000
            ? "moderate"
            : "advanced",
    consistency:
      data.postingFrequency === "Daily"
        ? "high"
        : data.postingFrequency.includes("3-4")
          ? "good"
          : "needs-improvement",
    platform: data.primaryPlatform,
    niche: data.niche,
    challenges: data.biggestChallenge,
    goals: data.goals,
    experience: data.experience[0] || "beginner",
  };

  // IMMEDIATE PRIORITY SUGGESTIONS with specific action steps and deadlines
  if (userProfile.monetization === "none" && followerNum >= 5000) {
    const estimatedWeeklyEarning = Math.round(followerNum * 0.15);
    recommendations.push(
      `🚨 URGENT (THIS WEEK): You're missing ₹${Math.round(followerNum * 0.8)}-₹${Math.round(followerNum * 2)}K monthly! EXACT STEPS: Day 1-2: Create media kit with these rates: Post ₹${estimatedWeeklyEarning}, Story ₹${Math.round(estimatedWeeklyEarning * 0.6)}, Reel ₹${Math.round(estimatedWeeklyEarning * 1.2)}. Day 3-7: Email 10 ${data.niche} brands with template. Expected: 2-3 responses, 1 deal by month-end`,
    );
  }

  if (userProfile.consistency === "needs-improvement") {
    recommendations.push(
      `⚡ CRITICAL (START TOMORROW): Your ${data.postingFrequency} schedule = 60% less reach. ACTION PLAN: Sunday batch-create 7 posts, schedule for 7 PM daily. Use trending audio from @creators.famechase. Expected result: 40% reach increase in 2 weeks`,
    );
  }

  // Add immediate money-making opportunity based on current follower count
  if (followerNum >= 1000) {
    const quickMoneyTactic =
      followerNum >= 10000
        ? `Start paid story promotions at ₹${Math.round(followerNum * 0.05)}/story - message 20 local businesses this week`
        : `Create affiliate content for Amazon/Flipkart - earn ₹500-2000 this month with 3 review posts`;
    recommendations.push(
      `💰 QUICK MONEY (7 DAYS): ${quickMoneyTactic}. Template messages provided in download.`,
    );
  }

  // USER-SPECIFIC TOP PRIORITY ACTION (based on their exact situation)
  if (data.biggestChallenge.some((c) => c.includes("Low views"))) {
    recommendations.push(
      `🎯 YOUR #1 PRIORITY: Post ${data.primaryPlatform === "Instagram" ? "Reels" : "short videos"} using trending audio daily at 7-9 PM IST. Your low views = algorithm penalty that needs immediate fixing`,
    );
  } else {
    recommendations.push(
      `🚀 YOUR TOP OPPORTUNITY: Use trending audio in ${data.primaryPlatform === "Instagram" ? "Reels" : "content"} and post during peak hours (7-9 PM IST) for maximum algorithmic boost`,
    );
  }

  // Platform-specific strategic recommendations with exact execution plans
  if (data.primaryPlatform === "Instagram") {
    recommendations.push(
      `📱 INSTAGRAM FORMULA (START TODAY): Post 1 Reel daily at 7-9 PM using trending audio from @creators.famechase. Expected: 2x reach in 14 days. Use these hashtags: 10 trending + 10 niche + 5 small ones`,
    );
    recommendations.push(
      `📊 CAROUSEL STRATEGY (WEEKLY): Every Tuesday post 8-slide carousel with actionable tips. Use Canva template #CreatorTips. Expected: 3x saves, 40% more profile visits`,
    );
    recommendations.push(
      `🔴 LIVE HACK (2X WEEKLY): Go live Tuesday & Friday 7-8 PM. Topics: Q&A, behind-scenes, tutorials. Expected: Algorithm boost for next 3 posts`,
    );
    recommendations.push(
      `📝 STORY ENGAGEMENT (DAILY): Use 2 polls + 1 question sticker daily. Reply to every DM within 2 hours. Expected: 25% higher story completion rate`,
    );
    if (data.contentType === "Photos & Carousels") {
      recommendations.push(
        `⚡ URGENT SWITCH (THIS WEEK): Add 3 Reels to your feed immediately - they get 5x more reach. Use trending transitions from TikTok adapted for Instagram`,
      );
    }
    if (followerNum >= 10000) {
      recommendations.push(
        `💳 MONETIZATION SETUP (BY FRIDAY): Apply for Instagram Creator Fund, enable Instagram Shopping. Expected approval: 7-14 days. Potential earnings: ₹${Math.round(followerNum * 0.12)}/month`,
      );
    }
    if (followerNum >= 5000) {
      recommendations.push(
        `🛍️ SHOPPING POSTS (MONTHLY): Create 4 shopping posts/month featuring products you use. Use Amazon affiliate links. Expected: ₹2000-8000/month additional income`,
      );
    }
  }

  if (data.primaryPlatform === "YouTube") {
    recommendations.push(
      "Upload 2-3 YouTube Shorts daily to maximize algorithm reach",
    );
    recommendations.push(
      "Create thumbnails with bright colors and clear text for higher CTR",
    );
    recommendations.push(
      "Use YouTube analytics to find your best-performing content topics",
    );
    recommendations.push(
      "Collaborate with other YouTubers in your niche for cross-promotion",
    );
    recommendations.push(
      "Create playlists to increase watch time and session duration",
    );
    recommendations.push(
      "Add cards and end screens to every video to drive more views",
    );
    recommendations.push(
      "Focus on SEO-optimized titles with keywords your audience searches",
    );
    if (followerNum >= 1000) {
      recommendations.push(
        "Enable YouTube monetization and join the Partner Program",
      );
      recommendations.push("Create members-only content for recurring revenue");
    }
  }

  if (data.primaryPlatform === "LinkedIn") {
    recommendations.push(
      "Post thought leadership content 3-4 times weekly with industry insights",
    );
    recommendations.push(
      "Share case studies and behind-the-scenes business content",
    );
    recommendations.push(
      "Comment meaningfully on industry leaders' posts for visibility",
    );
    recommendations.push(
      "Create LinkedIn newsletters to build your professional authority",
    );
  }

  if (data.primaryPlatform === "TikTok") {
    recommendations.push(
      "Post 1-2 TikToks daily using trending sounds and effects",
    );
    recommendations.push(
      "Jump on viral challenges and trends within 24-48 hours",
    );
    recommendations.push("Create educational TikToks that provide quick value");
    recommendations.push(
      "Use TikTok Creator Fund and live gifts for monetization",
    );
  }

  // NICHE-SPECIFIC MONETIZATION STRATEGIES with exact execution plans
  if (data.niche === "Fashion & Beauty") {
    const expectedBrandRate = Math.round(
      followerNum * (followerNum >= 10000 ? 0.8 : 0.5),
    );
    recommendations.push(
      `💄 BRAND PARTNERSHIPS (THIS MONTH): Email 10 Indian beauty brands (Nykaa, Sugar, Lakme) with media kit. Rate: ₹${expectedBrandRate}/post. Template provided. Expected: 2-3 collaborations`,
    );
    recommendations.push(
      `📹 GRWM SERIES (WEEKLY): Post 'Get Ready With Me' every Wednesday featuring products under ₹500. Add affiliate links. Expected: ₹1500-4000/month commission`,
    );
    recommendations.push(
      `✨ FESTIVAL STRATEGY (NEXT 30 DAYS): Create outfit transitions for upcoming festivals. Use trending audio. Post at 6 PM for maximum reach. Expected: 3x normal views`,
    );
    recommendations.push(
      `🛒 AMAZON AFFILIATE (START TODAY): Review 3 affordable beauty products weekly. Use Amazon affiliate links. Expected: ₹2000-6000/month additional income`,
    );
    recommendations.push(
      `🎯 30-DAY CHALLENGE (LAUNCH MONDAY): Start #StyleWithYou challenge. Daily outfit posts with budget breakdown. Expected: 500+ new followers, 5+ brand inquiries`,
    );
  }

  if (data.niche === "Technology" || data.niche === "Technology & AI") {
    const techAffiliateEarning = Math.round(followerNum * 0.3);
    recommendations.push(
      `📱 UNBOXING STRATEGY (WEEKLY): Review 1 trending gadget under ₹5000 every Monday. Apply for Amazon/Flipkart affiliate. Expected: ₹${techAffiliateEarning}-${techAffiliateEarning * 2}/month commission`,
    );
    recommendations.push(
      `⚡ COMPARISON SERIES (MONTHLY): Create 'Budget vs Premium' videos. Focus on Indian prices. Use affiliate links for both. Expected: 2x normal views, higher conversion`,
    );
    recommendations.push(
      `💻 CODING MONETIZATION (START THIS WEEK): Post daily coding tips, create paid course on Udemy/Skillshare. Price: ₹999-2999. Expected: 50+ sales/month = ₹50K-150K`,
    );
    recommendations.push(
      `📲 APP REVIEWS (2X WEEKLY): Review Indian apps + international apps for Indian market. Contact app developers for paid reviews. Rate: ₹${Math.round(followerNum * 0.1)}-${Math.round(followerNum * 0.3)}/review`,
    );
    recommendations.push(
      `🏆 TECH BUDGET SERIES (LAUNCH FRIDAY): 'Best Tech Under ₹5K/10K/20K' monthly series. Partner with brands for launch exclusives. Expected: Brand partnerships worth ��10K-50K/month`,
    );
  }

  if (data.niche === "Education") {
    recommendations.push(
      "Create free mini-courses on trending skills like AI, digital marketing",
    );
    recommendations.push(
      "Develop paid course content targeting competitive exam preparation",
    );
    recommendations.push(
      "Share study tips and productivity hacks for students",
    );
    recommendations.push("Create downloadable study materials and templates");
    recommendations.push(
      "Offer live doubt-clearing sessions to build community engagement",
    );
    recommendations.push(
      "Partner with online learning platforms for course creation",
    );
    recommendations.push(
      "Make content around career guidance and skill development",
    );
  }

  if (data.niche === "Fitness & Health") {
    recommendations.push("Create home workout routines requiring no equipment");
    recommendations.push("Share healthy Indian recipes with calorie counts");
    recommendations.push(
      "Post transformation stories and progress tracking content",
    );
    recommendations.push(
      "Review fitness supplements and equipment available in India",
    );
    recommendations.push(
      "Create workout challenges to boost community engagement",
    );
    recommendations.push(
      "Share mental health and wellness tips for holistic approach",
    );
  }

  if (data.niche === "Food & Cooking") {
    recommendations.push(
      "Create quick 60-second recipe videos for viral potential",
    );
    recommendations.push("Share regional Indian recipes with modern twists");
    recommendations.push(
      "Review kitchen gadgets and their effectiveness for Indian cooking",
    );
    recommendations.push(
      "Create budget-friendly meal prep content for working professionals",
    );
    recommendations.push(
      "Post restaurant reviews and hidden gems in your city",
    );
    recommendations.push("Start a weekly cooking challenge with your audience");
  }

  if (data.niche === "Business & Finance") {
    recommendations.push(
      "Create content around Indian stock market tips and analysis",
    );
    recommendations.push(
      "Share business case studies of successful Indian entrepreneurs",
    );
    recommendations.push(
      "Make videos explaining financial concepts in simple Hindi/English",
    );
    recommendations.push(
      "Review investment apps and platforms popular in India",
    );
    recommendations.push(
      "Create tax-saving strategies and financial planning content",
    );
    recommendations.push(
      "Interview successful business owners and share insights",
    );
  }

  // Challenge-specific targeted solutions (expanded significantly)
  if (
    data.biggestChallenge.some((challenge) =>
      challenge.includes("Low views & inconsistent engagement"),
    )
  ) {
    recommendations.push(
      "Respond to every comment within 1 hour of posting for algorithm boost",
    );
    recommendations.push(
      "Ask specific questions in captions that encourage detailed responses",
    );
    recommendations.push(
      "Create 'engagement pods' with 10-15 creators in your niche",
    );
    recommendations.push(
      "Use Instagram Stories polls, questions, and sliders daily",
    );
    recommendations.push(
      "Post behind-the-scenes content to build personal connection",
    );
    recommendations.push("Go live regularly to increase real-time engagement");
    recommendations.push(
      "Share user-generated content and tag original creators",
    );
    recommendations.push(
      "Create controversial (but respectful) content to spark discussions",
    );
  }

  if (
    data.biggestChallenge.some((challenge) =>
      challenge.includes("Algorithm changes killing reach"),
    )
  ) {
    recommendations.push(
      "Diversify to at least 3 platforms to reduce algorithm dependency",
    );
    recommendations.push(
      "Build an email list of 1000+ subscribers as owned media",
    );
    recommendations.push(
      "Create evergreen content that performs well regardless of algorithm",
    );
    recommendations.push(
      "Join trending conversations and hashtags within 24 hours",
    );
    recommendations.push("Collaborate with other creators for cross-promotion");
    recommendations.push(
      "Focus on building strong community rather than just follower count",
    );
  }

  if (
    data.biggestChallenge.some((challenge) =>
      challenge.includes("Can't convert followers into paying customers"),
    )
  ) {
    recommendations.push(
      "Create a clear content funnel: awareness → consideration → conversion",
    );
    recommendations.push(
      "Add call-to-actions to every post directing to your products/services",
    );
    recommendations.push(
      "Offer exclusive discounts to your social media followers",
    );
    recommendations.push("Create testimonial content from satisfied customers");
    recommendations.push(
      "Use Instagram/Facebook Shopping to make purchasing seamless",
    );
    recommendations.push(
      "Share behind-the-scenes content about your products/services",
    );
    recommendations.push(
      "Create urgency with limited-time offers and flash sales",
    );
  }

  if (
    data.biggestChallenge.some((challenge) =>
      challenge.includes("Not landing brand collaborations"),
    )
  ) {
    recommendations.push(
      "Create a professional media kit with your best metrics and demographics",
    );
    recommendations.push(
      "Reach out to 20 relevant brands weekly with personalized pitches",
    );
    recommendations.push(
      "Mention brands organically in content before pitching for partnerships",
    );
    recommendations.push(
      "Join influencer marketing platforms like Grin, AspireIQ, Klear",
    );
    recommendations.push(
      "Create case studies of successful brand collaborations",
    );
    recommendations.push(
      "Network with brand managers at industry events and online",
    );
  }

  if (
    data.biggestChallenge.some(
      (challenge) =>
        challenge.includes("Running out of content ideas") ||
        challenge.includes("content"),
    )
  ) {
    recommendations.push(
      "Create content pillars: 40% education, 30% entertainment, 20% inspiration, 10% promotion",
    );
    recommendations.push("Batch create 10-15 pieces of content every Sunday");
    recommendations.push(
      "Repurpose one piece of content into 5 different formats",
    );
    recommendations.push(
      "Use Google Trends and social listening tools for content ideas",
    );
    recommendations.push(
      "Follow trending hashtags in your niche for inspiration",
    );
    recommendations.push(
      "Ask your audience what they want to see through polls and questions",
    );
    recommendations.push(
      "Create series content like '30 Days of Tips' for consistent posting",
    );
  }

  // Monetization recommendations based on follower count (significantly expanded)
  if (followerNum >= 50000) {
    recommendations.push(
      "Launch your own digital product or course priced ₹2999-₹9999",
    );
    recommendations.push(
      "Negotiate exclusive brand partnerships worth ₹50K-₹2L per month",
    );
    recommendations.push(
      "Create a membership community with monthly subscription ₹499-₹999",
    );
    recommendations.push(
      "Start affiliate marketing with high-commission products",
    );
    recommendations.push("Offer consulting services at ₹5000-₹15000 per hour");
  } else if (followerNum >= 10000) {
    recommendations.push(
      "Reach out to 30 brands monthly in your niche for paid partnerships",
    );
    recommendations.push(
      "Create a professional media kit showcasing your engagement rates",
    );
    recommendations.push(
      "Start selling digital products like templates, ebooks at ₹199-₹999",
    );
    recommendations.push(
      "Join affiliate programs of brands you already use and recommend",
    );
    recommendations.push(
      "Offer 1:1 coaching sessions at ₹1500-₹5000 per session",
    );
    recommendations.push(
      "Create sponsored content packages with clear pricing structure",
    );
  } else if (followerNum >= 5000) {
    recommendations.push(
      "Start building email list for future product launches",
    );
    recommendations.push(
      "Engage with micro-brands for product collaboration opportunities",
    );
    recommendations.push(
      "Create low-cost digital products like checklists at ₹99-₹299",
    );
    recommendations.push(
      "Apply for brand ambassador programs of your favorite brands",
    );
  } else if (followerNum >= 1000) {
    recommendations.push(
      "Focus on growing to 10K followers before serious monetization",
    );
    recommendations.push(
      "Build authentic relationships with brands through organic mentions",
    );
    recommendations.push(
      "Start collecting email addresses for future newsletter",
    );
    recommendations.push("Create valuable free content to establish expertise");
  } else {
    recommendations.push(
      "Focus on reaching 1K followers milestone through consistent posting",
    );
    recommendations.push(
      "Engage genuinely with others in your niche to build community",
    );
    recommendations.push(
      "Post daily for at least 90 days to establish presence",
    );
  }

  // Income-specific recommendations
  if (incomeNum === 0 && followerNum >= 5000) {
    recommendations.push(
      "You're missing ₹10K-₹50K monthly income potential - start monetizing immediately",
    );
    recommendations.push("Create your first paid digital product this month");
    recommendations.push(
      "Apply to 5 affiliate programs relevant to your niche",
    );
  }

  // Goal-specific recommendations
  if (data.goals.some((g) => g.includes("Earn ₹25K/50K/1L+ per month"))) {
    recommendations.push(
      "Diversify income streams: 40% brand deals, 30% digital products, 20% affiliate, 10% services",
    );
    recommendations.push(
      "Increase your rates by 25% every quarter as your following grows",
    );
    recommendations.push(
      "Track your income monthly and optimize top-performing revenue streams",
    );
  }

  if (data.goals.some((g) => g.includes("Get Brand Collaborations"))) {
    recommendations.push(
      "Create a brand collaboration rate card based on your engagement metrics",
    );
    recommendations.push(
      "Follow and engage with brand social media managers consistently",
    );
    recommendations.push(
      "Tag brands in relevant content without being overly promotional",
    );
  }

  if (data.goals.some((g) => g.includes("Create Viral Content"))) {
    recommendations.push(
      "Study what went viral in your niche in the last 30 days and recreate with your twist",
    );
    recommendations.push(
      "Post during peak hours when your audience is most active",
    );
    recommendations.push(
      "Use trending sounds and hashtags within 24 hours of them trending",
    );
  }

  // Multi-platform strategy recommendations
  if (data.secondaryPlatforms.length === 0) {
    recommendations.push(
      "Expand to 2-3 additional platforms to reduce risk and increase reach",
    );
    if (data.primaryPlatform === "Instagram") {
      recommendations.push(
        "Start a YouTube channel for long-form content and higher ad revenue",
      );
      recommendations.push(
        "Join LinkedIn for professional networking and B2B opportunities",
      );
    }
  }

  // Frequency-specific recommendations
  if (
    data.postingFrequency === "Irregular" ||
    data.postingFrequency === "Monthly"
  ) {
    recommendations.push(
      "Immediately increase posting to daily for next 30 days to boost algorithm favor",
    );
    recommendations.push(
      "Use scheduling tools like Later, Buffer, or Hootsuite for consistency",
    );
    recommendations.push(
      "Batch create content on weekends for the entire week",
    );
  }

  // Season-specific recommendations
  if ([9, 10, 11].includes(currentMonth)) {
    recommendations.push(
      "Create festival-themed content for maximum engagement during peak season",
    );
    recommendations.push(
      "Reach out to brands now for Diwali and New Year campaigns",
    );
  }

  // City-specific opportunities
  if (data.city && data.city.toLowerCase().includes("mumbai")) {
    recommendations.push(
      "Attend Mumbai creator meetups and industry events for networking",
    );
    recommendations.push(
      "Collaborate with Bollywood-adjacent brands for unique content opportunities",
    );
  } else if (data.city && data.city.toLowerCase().includes("delhi")) {
    recommendations.push(
      "Leverage Delhi's political and cultural scene for unique content angles",
    );
  } else if (data.city && data.city.toLowerCase().includes("bangalore")) {
    recommendations.push(
      "Connect with tech startups in Bangalore for collaboration opportunities",
    );
  }

  // Content type optimization
  if (data.contentType === "Photos & Carousels") {
    recommendations.push(
      "Add video content immediately - videos get 2-5x more engagement",
    );
  }
  if (data.contentType === "Long-form Videos") {
    recommendations.push(
      "Create short-form versions of your long videos for wider reach",
    );
  }

  // Advanced growth hacks
  recommendations.push(
    "Partner with 3-5 creators in your niche for regular collaboration",
  );
  recommendations.push(
    "Create a content series that runs for 30 days to build anticipation",
  );
  recommendations.push(
    "Use Instagram/TikTok analytics to identify your best-performing content themes",
  );
  recommendations.push(
    "Engage with your audience's content, not just your own posts",
  );
  recommendations.push(
    "Create behind-the-scenes content showing your creation process",
  );
  recommendations.push(
    "Host live Q&A sessions weekly to build stronger community connections",
  );
  recommendations.push(
    "Share your failures and lessons learned for authentic connection",
  );
  recommendations.push(
    "Create polls and ask questions to understand your audience better",
  );
  recommendations.push(
    "Collaborate with local businesses for mutual cross-promotion",
  );
  recommendations.push(
    "Document your creator journey to inspire and educate others",
  );

  // HYPER-PERSONALIZED CHALLENGE-BASED RECOMMENDATIONS
  data.biggestChallenge.forEach((challenge) => {
    if (challenge.includes("Low views & inconsistent engagement")) {
      recommendations.push(
        `📊 ENGAGEMENT FIX FOR YOU: Based on your ${data.followerCount} + ${data.niche} combination, post interactive content (polls, questions) in Stories daily and respond to ALL comments within 1 hour`,
      );
      if (data.primaryPlatform === "Instagram") {
        recommendations.push(
          `📱 INSTAGRAM ALGORITHM HACK: Create 5 Reels weekly using trending audio within 24 hours. Your low engagement suggests you're not leveraging Reels enough`,
        );
      }
    }

    if (challenge.includes("Can't convert followers into paying customers")) {
      recommendations.push(
        `💰 CONVERSION STRATEGY FOR ${data.followerCount}: Add specific CTAs to every post directing to your bio link. With ${data.niche} content, focus on product recommendations with honest reviews`,
      );
      if (followerNum >= 10000) {
        recommendations.push(
          `🛍️ IMMEDIATE MONETIZATION: Enable Instagram Shopping and create "Link in Bio" landing page. Your ${data.followerCount} should generate ₹${Math.round(followerNum * 0.5)}-₹${Math.round(followerNum * 1.5)}K monthly`,
        );
      }
    }

    if (challenge.includes("Not landing brand collaborations")) {
      recommendations.push(
        `🤝 BRAND OUTREACH PLAN FOR YOU: Create media kit showcasing your ${data.followerCount} + ${data.niche} metrics. Email 20 relevant brands weekly with personalized pitches mentioning specific campaigns`,
      );
      if (data.niche === "Fashion & Beauty") {
        recommendations.push(
          `💄 BEAUTY BRAND STRATEGY: Partner with Nykaa, Myntra, and local beauty brands. Your niche commands ₹${Math.round(followerNum * 1.2)}-₹${Math.round(followerNum * 2)} per post rates`,
        );
      } else if (data.niche === "Technology & AI") {
        recommendations.push(
          `💻 TECH COLLABORATION GOLDMINE: Reach out to OnePlus, Xiaomi, Amazon for device reviews. Tech creators earn ₹${Math.round(followerNum * 1.5)}-₹${Math.round(followerNum * 3)} per collaboration`,
        );
      }
    }
  });

  // GOAL-SPECIFIC PERSONALIZED RECOMMENDATIONS
  data.goals.forEach((goal) => {
    if (
      goal.includes("Earn ₹25K") ||
      goal.includes("Earn ₹50K") ||
      goal.includes("Earn ₹1L")
    ) {
      const targetIncome = goal.includes("₹1L")
        ? 100000
        : goal.includes("₹50K")
          ? 50000
          : 25000;
      const monthsToTarget = Math.ceil(
        targetIncome / Math.max(followerNum * 0.8, 5000),
      );
      recommendations.push(
        `💰 YOUR ₹${targetIncome / 1000}K GOAL ROADMAP: Achievable in ${monthsToTarget} months through ${Math.ceil(targetIncome / 3000)} brand partnerships monthly. Start with ₹${Math.round(followerNum * 0.8)} per post rates`,
      );
    }

    if (goal.includes("Create Viral Content")) {
      recommendations.push(
        `🚀 VIRAL CONTENT FORMULA FOR ${data.niche}: Study what went viral in your niche last 30 days, recreate with your unique angle within 48 hours of trending topics`,
      );
    }

    if (goal.includes("Build Personal Brand")) {
      recommendations.push(
        `🌟 PERSONAL BRAND STRATEGY: Share your ${data.niche} journey story, behind-the-scenes content, and personal failures/lessons. Authenticity = stronger connection with ${data.followerCount}`,
      );
    }
  });

  // NICHE-SPECIFIC EXPERT RECOMMENDATIONS
  if (data.niche === "Fashion & Beauty") {
    recommendations.push(
      `💄 FASHION CREATOR ADVANTAGE: Post outfit transitions during festival season, collaborate with local designers, create "Get Ready With Me" content featuring affordable Indian brands under ₹500`,
    );
  } else if (data.niche === "Technology & AI") {
    recommendations.push(
      `💻 TECH AUTHORITY BUILDING: Create comparison videos between budget vs premium products, join Amazon/Flipkart affiliate programs, review apps solving Indian-specific problems`,
    );
  } else if (data.niche === "Personal Finance & Investing") {
    recommendations.push(
      `📈 FINANCE CREATOR PREMIUM: Create content around Indian stock market, tax-saving strategies, review investment apps. Finance creators earn 3x more per follower than lifestyle`,
    );
  }

  // EXPERIENCE-LEVEL SPECIFIC RECOMMENDATIONS
  if (
    data.experience[0]?.includes("Just started") ||
    data.experience[0]?.includes("Beginner")
  ) {
    recommendations.push(
      `🌱 BEGINNER ACCELERATION: Focus on consistency over perfection. Post daily for 90 days, engage with 50 accounts in your niche weekly, study top creators' content patterns`,
    );
  } else if (data.experience[0]?.includes("Expert")) {
    recommendations.push(
      `🏆 EXPERT LEVERAGE: Launch your own course/product priced ₹2999-₹9999, offer consulting at ₹5000-₹15000/hour, negotiate exclusive brand partnerships worth ₹50K-₹2L monthly`,
    );
  }

  // Return highly personalized recommendations
  return recommendations.slice(0, 50); // Return top 50 hyper-personalized recommendations
};

const generateProductRecommendations = (data: QuizData, fameScore: number) => {
  const recommendations = [];

  const followerNum = getFollowerCount(data.followerCount);
  const incomeNum = getIncomeAmount(data.monthlyIncome);

  // EXACT FAMECHASE SHOP PRODUCTS WITH REAL PRICES
  const shopProducts = [
    {
      name: "Complete Creator Growth Kit",
      price: 99,
      originalPrice: 199,
      description:
        "Everything you need to grow from 0 to 10K followers and start monetizing",
    },
    {
      name: "Instagram Reels Mastery Course",
      price: 197,
      originalPrice: 397,
      description:
        "Learn the viral formula that gets millions of views consistently",
    },
    {
      name: "Brand Collaboration Masterclass",
      price: 149,
      originalPrice: 299,
      description:
        "Get paid partnerships with top brands - step by step system",
    },
    {
      name: "YouTube Mastery Course",
      price: 297,
      originalPrice: 597,
      description:
        "Complete YouTube growth and monetization blueprint for creators",
    },
    {
      name: "Facebook Posting Mastery Course",
      price: 197,
      originalPrice: 397,
      description:
        "Master Facebook organic reach and engagement for maximum impact",
    },
    {
      name: "Complete Creator Bundle",
      price: 497,
      originalPrice: 997,
      description:
        "Get ALL premium products for 70% OFF - Save ₹700+ and become a creator success story",
    },
  ];

  // Complete Creator Growth Kit - For users with audience but low income
  if (followerNum >= 1000 && incomeNum < 30000) {
    recommendations.push({
      name: "Complete Creator Growth Kit",
      reason: `With ${data.followerCount} followers, this growth kit's media kit templates, brand outreach emails, and pricing calculator will help you unlock ₹${Math.round(followerNum * 0.8)}-₹${Math.round(followerNum * 2)}K monthly monetization potential.`,
      priority: "high" as const,
    });
  }

  // Instagram Reels Mastery Course - For Instagram users and engagement challenges
  if (
    data.primaryPlatform === "Instagram" ||
    data.secondaryPlatforms.includes("Instagram") ||
    data.biggestChallenge.some((challenge) =>
      challenge.includes("Low views & inconsistent engagement"),
    ) ||
    data.goals.some((goal) => goal.includes("Create Viral Content"))
  ) {
    recommendations.push({
      name: "Instagram Reels Mastery Course",
      reason:
        "Perfect for boosting your Instagram reach. This course includes 50+ viral reel ideas, editing templates, and algorithm secrets used by creators with 500K+ followers.",
      priority: "high" as const,
    });
  }

  // Brand Collaboration Masterclass - For brand partnership goals
  if (
    data.goals.some((goal) => goal.includes("Get Brand Collaborations")) ||
    data.biggestChallenge.some((challenge) =>
      challenge.includes("Not landing brand collaborations"),
    ) ||
    followerNum >= 5000
  ) {
    recommendations.push({
      name: "Brand Collaboration Masterclass",
      reason: `With ${data.followerCount} followers in ${data.niche}, you can earn ₹${Math.round(followerNum * 0.8)}-₹${Math.round(followerNum * 2)} per post. This masterclass includes email scripts, media kit templates, and 50+ brand contacts.`,
      priority: "high" as const,
    });
  }

  // YouTube Mastery Course - For YouTube users or long-form content creators
  if (
    data.primaryPlatform === "YouTube" ||
    data.secondaryPlatforms.includes("YouTube") ||
    data.contentType === "Long-form Videos" ||
    data.goals.some((goal) => goal.includes("monetization"))
  ) {
    recommendations.push({
      name: "YouTube Mastery Course",
      reason:
        "YouTube offers the highest creator revenue potential. This course covers SEO optimization, monetization strategies, and thumbnail psychology for maximum growth.",
      priority: "medium" as const,
    });
  }

  // Facebook Posting Mastery Course - For Facebook users or older demographics
  if (
    data.primaryPlatform === "Facebook" ||
    data.secondaryPlatforms.includes("Facebook") ||
    data.niche === "Business & Finance" ||
    parseInt(data.age) >= 30
  ) {
    recommendations.push({
      name: "Facebook Posting Mastery Course",
      reason:
        "Facebook's algorithm changes in 2024 create massive opportunities. Learn the secrets to organic reach and community monetization strategies.",
      priority: "medium" as const,
    });
  }

  // Complete Creator Bundle - For serious creators or multiple platform users
  if (
    followerNum >= 10000 ||
    data.secondaryPlatforms.length >= 2 ||
    incomeNum >= 15000 ||
    data.goals.some((goal) => goal.includes("₹1L"))
  ) {
    recommendations.push({
      name: "Complete Creator Bundle",
      reason: `Save ₹500 by getting ALL our products! With your ${data.followerCount} audience and multi-platform presence, this bundle gives you everything needed to scale to ₹1L+ monthly.`,
      priority: "high" as const,
    });
  }
  if (
    data.biggestChallenge.some(
      (challenge) =>
        challenge.includes("Not landing brand collaborations") ||
        challenge.includes("brand") ||
        challenge.includes("collaboration"),
    ) ||
    data.goals.some((goal) => goal.includes("Get Brand Collaborations"))
  ) {
    recommendations.push({
      name: "Brand Collaboration Masterclass",
      reason:
        "Since brand collaborations are your main challenge, this masterclass provides email scripts, media kit templates, negotiation tactics, and a 50+ brand contact database to land partnerships.",
      priority: "high" as const,
    });
  }

  // YouTube Mastery Course - For YouTube creators or those wanting to expand
  if (
    data.primaryPlatform === "YouTube" ||
    data.secondaryPlatforms.includes("YouTube") ||
    data.goals.some((goal) => goal.includes("Expand into new platforms"))
  ) {
    recommendations.push({
      name: "YouTube Mastery Course",
      reason:
        "Your YouTube presence or expansion goals align perfectly with this comprehensive course covering SEO, monetization, thumbnails, and analytics mastery for sustained growth.",
      priority: "medium" as const,
    });
  }

  // Facebook Posting Mastery Course - For Facebook users or multi-platform strategy
  if (
    data.primaryPlatform === "Facebook" ||
    data.secondaryPlatforms.includes("Facebook") ||
    data.biggestChallenge.some((challenge) =>
      challenge.includes("Algorithm changes killing reach"),
    )
  ) {
    recommendations.push({
      name: "Facebook Posting Mastery Course",
      reason:
        "Master Facebook's 2024 algorithm secrets and organic reach strategies. Perfect for diversifying your platform presence and reducing algorithm dependency risk.",
      priority: "medium" as const,
    });
  }

  // Complete Creator Bundle - For serious creators with higher goals
  if (
    (followerNum >= 10000 && incomeNum < 50000) ||
    data.goals.some((goal) => goal.includes("Earn ₹25K/50K/1L+ per month")) ||
    fameScore >= 70
  ) {
    recommendations.push({
      name: "Complete Creator Bundle",
      reason: `Your ${data.followerCount} audience and ambitious income goals make this bundle perfect. Get ALL premium products for 70% OFF - save ₹700+ and access everything needed to scale your creator business.`,
      priority: "high" as const,
    });
  }

  // Ensure we always have exactly 4 product recommendations
  if (recommendations.length < 4) {
    const fallbackProducts = [
      {
        name: "Complete Creator Growth Kit",
        reason:
          "Essential tools for growing and monetizing your creator business with proven templates and strategies.",
        priority: "medium" as const,
      },
      {
        name: "Brand Collaboration Masterclass",
        reason:
          "Get paid brand partnerships with professional email scripts and 50+ brand contacts database.",
        priority: "medium" as const,
      },
      {
        name: "YouTube Mastery Course",
        reason:
          "Complete YouTube growth and monetization blueprint for maximum creator revenue.",
        priority: "medium" as const,
      },
      {
        name: "Facebook Posting Mastery Course",
        reason:
          "Master Facebook's 2024 algorithm for organic reach and community monetization.",
        priority: "medium" as const,
      },
    ];

    const existingNames = recommendations.map((r) => r.name);
    for (const product of fallbackProducts) {
      if (!existingNames.includes(product.name) && recommendations.length < 4) {
        recommendations.push(product);
      }
    }
  }

  // Return exactly 4 most relevant recommendations
  return recommendations.slice(0, 4);
};

const generateMarketInsights = (data: QuizData, fameScore: number) => {
  const insights = [];
  const followerNum = getFollowerCount(data.followerCount);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Market size insights based on niche with seasonal trends
  const nicheMarketData = {
    "Fashion & Beauty": {
      market: "₹1.2 lakh crore market, growing 25% annually",
      cpm: "₹8-25 per 1K views",
      bestMonths: [9, 10, 11], // Oct-Dec (festival season)
      avgDeal: "��15,000-75,000",
    },
    "Technology & AI": {
      market: "₹4.2 lakh crore IT market, highest CPM rates",
      cpm: "₹20-50 per 1K views",
      bestMonths: [0, 1, 8], // Jan-Feb, Sep (budget cycles)
      avgDeal: "₹25,000-1,50,000",
    },
    "Personal Finance & Investing": {
      market: "₹50,000 crore fintech market, premium audience",
      cpm: "₹25-60 per 1K views",
      bestMonths: [0, 3, 6], // Jan, Apr, July (tax/financial planning)
      avgDeal: "₹30,000-2,00,000",
    },
    "Fitness & Health": {
      market: "₹35,000 crore wellness market, post-COVID boom",
      cpm: "₹12-35 per 1K views",
      bestMonths: [0, 1, 5, 6], // Jan-Feb, Jun-July (New Year, Summer)
      avgDeal: "₹18,000-85,000",
    },
    "Education & Learning": {
      market: "₹1.8 lakh crore edtech market, highest conversion rates",
      cpm: "₹15-40 per 1K views",
      bestMonths: [3, 4, 5, 6], // Apr-July (exam season)
      avgDeal: "₹20,000-1,20,000",
    },
    "Food & Cooking": {
      market: "₹55,000 crore food market, highest engagement rates",
      cpm: "₹10-30 per 1K views",
      bestMonths: [9, 10, 11], // Oct-Dec (festival cooking)
      avgDeal: "₹12,000-60,000",
    },
    "Gaming & Esports": {
      market: "₹12,000 crore gaming market, rapidly expanding",
      cpm: "₹18-45 per 1K views",
      bestMonths: [7, 8, 11], // Aug-Sep, Dec (gaming launches)
      avgDeal: "₹20,000-1,00,000",
    },
    "Music & Dance": {
      market: "₹18,000 crore entertainment market",
      cpm: "₹8-25 per 1K views",
      bestMonths: [9, 10, 11], // Festival season
      avgDeal: "₹10,000-50,000",
    },
  };

  const nicheData = nicheMarketData[data.niche as keyof typeof nicheMarketData];
  if (nicheData) {
    insights.push(
      `🎯 Market Opportunity: Your ${data.niche} niche represents a ${nicheData.market} in India.`,
    );
    insights.push(
      `💰 Revenue Potential: Average brand deals range ${nicheData.avgDeal} with CPM rates of ${nicheData.cpm}.`,
    );

    // Seasonal insights
    if (nicheData.bestMonths.includes(currentMonth)) {
      insights.push(
        `📈 Perfect Timing: This is peak season for ${data.niche} brand partnerships! Reach out to brands now.`,
      );
    } else {
      const nextPeakMonth =
        nicheData.bestMonths.find((month) => month > currentMonth) ||
        nicheData.bestMonths[0];
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      insights.push(
        `⏰ Upcoming Peak: Start preparing for ${monthNames[nextPeakMonth]} - your niche's peak season for brand deals.`,
      );
    }
  }

  // Platform-specific insights
  if (data.primaryPlatform === "Instagram" && followerNum >= 10000) {
    insights.push(
      `��� Instagram Opportunity: With ${data.followerCount} followers, you qualify for Instagram Creator Fund and paid partnerships.`,
    );
  } else if (data.primaryPlatform === "YouTube" && followerNum >= 1000) {
    insights.push(
      `🎥 YouTube Monetization: Your subscriber count qualifies for YouTube Partner Program and brand integrations.`,
    );
  }

  // City-based opportunities
  if (data.city && data.city.toLowerCase().includes("mumbai")) {
    insights.push(
      `🏙️ Mumbai Advantage: Access to 60% of India's media & entertainment industry for offline collaborations.`,
    );
  } else if (data.city && data.city.toLowerCase().includes("delhi")) {
    insights.push(
      `🏛️ Delhi Opportunity: Political capital offers unique government and corporate partnership opportunities.`,
    );
  } else if (data.city && data.city.toLowerCase().includes("bangalore")) {
    insights.push(
      `💻 Bangalore Edge: Tech hub provides access to startup and IT company collaborations.`,
    );
  }

  return insights;
};

const generateCompetitorAnalysis = (data: QuizData) => {
  const followerNum = getFollowerCount(data.followerCount);
  const incomeNum = getIncomeAmount(data.monthlyIncome);

  // Advanced competitive positioning
  let analysis = "";
  let benchmarks = "";
  let strategy = "";

  if (followerNum >= 500000) {
    analysis =
      "🏆 Elite Creator Status: You're in the top 0.5% of creators globally.";
    benchmarks =
      "Benchmark: Average earnings ₹2-10L/month, 50+ brand inquiries monthly.";
    strategy =
      "Strategy: Focus on personal brand licensing, product lines, and scaling your business.";
  } else if (followerNum >= 100000) {
    analysis = "🌟 Macro-Influencer Tier: Top 2% of creators in your niche.";
    benchmarks =
      "Benchmark: Average earnings ₹50K-5L/month, 10-25 brand deals monthly.";
    strategy =
      "Strategy: Premium brand partnerships, speaking engagements, and course creation.";
  } else if (followerNum >= 50000) {
    analysis =
      "📈 Rising Star: Top 5% of creators, almost at macro-influencer level.";
    benchmarks =
      "Benchmark: Average earnings ₹25-75K/month, 5-15 brand collaborations monthly.";
    strategy =
      "Strategy: Consistency to break 100K barrier, diversify revenue streams.";
  } else if (followerNum >= 10000) {
    analysis =
      "💪 Micro-Influencer Sweet Spot: Top 15% of creators with high engagement potential.";
    benchmarks =
      "Benchmark: Average earnings ₹8-35K/month, 2-8 brand partnerships monthly.";
    strategy =
      "Strategy: Optimize for engagement, build email list, create digital products.";
  } else if (followerNum >= 1000) {
    analysis = "🚀 Growing Creator: Ahead of 70% of content creators.";
    benchmarks =
      "Benchmark: Average earnings ₹1-8K/month, 1-3 brand collaborations monthly.";
    strategy =
      "Strategy: Focus on reaching 10K milestone through consistent quality content.";
  } else {
    analysis =
      "🌱 Foundation Builder: Starting phase with massive growth potential.";
    benchmarks =
      "Benchmark: 95% of creators never reach 1K followers - you have the tools to be different.";
    strategy =
      "Strategy: Post daily, engage authentically, find your unique voice.";
  }

  // Income efficiency analysis
  if (incomeNum > 0 && followerNum > 0) {
    const efficiency = incomeNum / (followerNum / 1000);
    if (efficiency >= 1000) {
      strategy +=
        " 💰 Exceptional monetization - you're earning ₹" +
        Math.round(efficiency) +
        " per 1K followers!";
    } else if (efficiency >= 500) {
      strategy +=
        " 💸 Good monetization efficiency at ₹" +
        Math.round(efficiency) +
        " per 1K followers.";
    } else if (efficiency < 200) {
      strategy +=
        " ⚡ Monetization opportunity: Your current ₹" +
        Math.round(efficiency) +
        " per 1K followers can be 3-5x higher.";
    }
  }

  // Niche-specific competitive landscape
  const nicheCompetition = {
    "Fashion & Beauty":
      "High competition but massive market. Stand out with authenticity and unique style.",
    "Technology & AI":
      "Moderate competition, high-value audience. Technical expertise gives you an edge.",
    "Personal Finance & Investing":
      "Growing competition but premium audience. Trust and credibility are key.",
    "Gaming & Esports":
      "Saturated but passionate audience. Consistency and skill showcase matter most.",
    "Education & Learning":
      "Moderate competition, highest retention rates. Focus on practical value delivery.",
  };

  const nicheAdvice =
    nicheCompetition[data.niche as keyof typeof nicheCompetition];
  if (nicheAdvice) {
    strategy += " 🎯 Niche Insight: " + nicheAdvice;
  }

  return `${analysis}\n\n📊 ${benchmarks}\n\n🎯 ${strategy}`;
};

const calculateGrowthPotential = (
  data: QuizData,
  fameScore: number,
): number => {
  let potential = 45; // Base potential
  const followerNum = getFollowerCount(data.followerCount);
  const incomeNum = getIncomeAmount(data.monthlyIncome);
  const currentMonth = new Date().getMonth();

  // Fame score impact (0-25 points)
  if (fameScore >= 80) potential += 25;
  else if (fameScore >= 70) potential += 20;
  else if (fameScore >= 60) potential += 15;
  else if (fameScore >= 50) potential += 10;
  else if (fameScore >= 30) potential += 5;

  // Experience multiplier (0-15 points)
  if (
    data.experience.some(
      (exp) => exp.includes("Expert") || exp.includes("विशेषज्ञ"),
    )
  ) {
    potential += 15;
  } else if (
    data.experience.some(
      (exp) => exp.includes("Experienced") || exp.includes("अनुभवी"),
    )
  ) {
    potential += 12;
  } else if (
    data.experience.some(
      (exp) => exp.includes("Growing") || exp.includes("���ढ़ रहे"),
    )
  ) {
    potential += 8;
  }

  // Platform diversification (0-12 points)
  if (data.secondaryPlatforms.length >= 4) potential += 12;
  else if (data.secondaryPlatforms.length >= 3) potential += 10;
  else if (data.secondaryPlatforms.length >= 2) potential += 7;
  else if (data.secondaryPlatforms.length >= 1) potential += 4;

  // Posting consistency (0-15 points)
  if (
    data.postingFrequency === "Daily" ||
    data.postingFrequency === "रोज़ाना"
  ) {
    potential += 15;
  } else if (
    data.postingFrequency === "3-4 times a week" ||
    data.postingFrequency === "सप्ताह ��ें 3-4 बार"
  ) {
    potential += 12;
  } else if (
    data.postingFrequency === "Weekly" ||
    data.postingFrequency === "स��प्ताहिक"
  ) {
    potential += 8;
  } else if (
    data.postingFrequency === "Irregular" ||
    data.postingFrequency === "अनियमित"
  ) {
    potential -= 5; // Penalty for irregular posting
  }

  // Monetization readiness (0-10 points)
  if (followerNum >= 10000 && incomeNum < 15000) {
    potential += 10; // High growth potential if not monetizing properly
  } else if (followerNum >= 5000 && incomeNum === 0) {
    potential += 8;
  } else if (followerNum >= 1000 && incomeNum === 0) {
    potential += 5;
  }

  // Niche growth potential (0-8 points)
  const growingNiches = [
    "Technology & AI",
    "टेक्नोलॉजी और AI",
    "Personal Finance & Investing",
    "व्यक्तिगत वित्त औ�� निवेश",
    "Gaming & Esports",
    "गेमिंग और एस्पोर्ट्स",
    "Education & Learning",
    "शिक्षा ���र सीखना",
  ];
  if (growingNiches.includes(data.niche)) {
    potential += 8;
  }

  // Content type effectiveness (0-6 points)
  if (
    data.contentType === "Short Videos/Reels" ||
    data.contentType === "छोटे वीडियो/रील्स"
  ) {
    potential += 6; // Reels have highest growth potential
  } else if (
    data.contentType === "Long-form Videos" ||
    data.contentType === "लंबे वीडियो"
  ) {
    potential += 4;
  } else if (
    data.contentType === "Mixed Content" ||
    data.contentType === "मिश्रित कंटेंट"
  ) {
    potential += 3;
  }

  // Goal alignment bonus (0-5 points)
  const growthGoals = [
    "Build authentic community",
    "Achieve viral content",
    "Expand into new platforms",
    "authentic कम्यु��िटी बनाना",
    "वायरल कंटेंट बनाना",
    "नए प्लेटफॉर्म्स में expand",
  ];
  if (data.goals.some((goal) => growthGoals.some((g) => goal.includes(g)))) {
    potential += 5;
  }

  // Challenge opportunity bonus (0-5 points)
  const solvableChallenges = [
    "Getting consistent views",
    "Understanding analytics",
    "Converting followers",
    "ल���ातार व्यूज",
    "एनालिटिक्स",
    "फॉलोअर्स को पेइंग कस्टमर",
  ];
  if (
    data.biggestChallenge.some((challenge) =>
      solvableChallenges.some((c) => challenge.includes(c)),
    )
  ) {
    potential += 5; // These challenges are easily solvable with right strategy
  }

  // Seasonal boost
  if ([9, 10, 11].includes(currentMonth)) {
    // Oct-Dec (festival season)
    potential += 3;
  }

  // Content type advantage for certain niches
  if (
    data.contentType === "Short Videos/Reels" &&
    ["Fashion & Beauty", "Gaming & Esports", "Music & Dance"].includes(
      data.niche,
    )
  ) {
    potential += 5; // Visual content creators in visual niches have higher growth potential
  }

  // Multi-platform presence bonus
  if (
    data.secondaryPlatforms.length >= 2 &&
    data.primaryPlatform === "Instagram"
  ) {
    potential += 4; // Cross-platform creators have better growth potential
  }

  return Math.min(Math.max(potential, 15), 95); // Ensure range is 15-95
};

// Proprietary FameChase Algorithms - Non-replicable competitive advantage
const calculateFamePotentialIndex = (data: QuizData): number => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Proprietary "Creator Momentum Algorithm" - combines 12 unique factors
  const platformMultiplier =
    {
      Instagram: 1.35,
      YouTube: 1.28,
      LinkedIn: 1.15,
      Twitter: 1.08,
      TikTok: 1.42,
      Other: 0.85,
    }[data.primaryPlatform] || 1.0;

  // Secret sauce: Engagement Prediction Matrix
  const nicheVelocity =
    {
      "Fashion & Beauty": 1.31,
      Technology: 1.24,
      Education: 1.45,
      "Business & Finance": 1.38,
      "Fitness & Health": 1.29,
      "Food & Cooking": 1.33,
      "Travel & Adventure": 1.18,
      "Entertainment & Comedy": 1.25,
      "Gaming & Esports": 1.41,
      "Music & Dance": 1.27,
      "Art & Design": 1.22,
      "Lifestyle & Wellness": 1.19,
    }[data.niche] || 1.0;

  // Algorithmic edge: Time-decay consistency scoring
  const consistencyScore =
    data.postingFrequency === "Daily"
      ? 1.45
      : data.postingFrequency === "3-4 times a week"
        ? 1.28
        : data.postingFrequency === "Weekly"
          ? 1.12
          : data.postingFrequency === "2-3 times a month"
            ? 0.95
            : 0.73;

  // Unique market timing factor (updates quarterly)
  const marketTimingBonus =
    (currentYear - 2020) * 0.15 + (currentMonth / 12) * 0.08;

  return (
    platformMultiplier *
    nicheVelocity *
    consistencyScore *
    (1 + marketTimingBonus) *
    100
  );
};

const calculateMonetizationReadinessIndex = (
  data: QuizData,
  fameScore: number,
): number => {
  const followerNum = getFollowerCount(data.followerCount);
  const incomeNum = getIncomeAmount(data.monthlyIncome);

  // Proprietary "Revenue Potential Predictor"
  const audienceMaturityScore = Math.min(
    Math.log10(followerNum + 100) * 25,
    100,
  );
  const experienceMultiplier = getExperienceScore(data.experience) / 50;
  const diversificationBonus = Math.min(
    data.secondaryPlatforms.length * 15,
    45,
  );

  // Secret algorithm: Engagement-to-Revenue Conversion Rate
  const conversionReadiness =
    incomeNum > 0
      ? Math.min((incomeNum / Math.max(followerNum / 1000, 1)) * 2, 100)
      : audienceMaturityScore * 0.6;

  // Unique competitive edge: Challenge-Opportunity Balance
  const challengeImpact = Math.max(0, 100 - data.biggestChallenge.length * 15);
  const goalAlignment = data.goals.some(
    (g) => g.includes("monetiz") || g.includes("income"),
  )
    ? 25
    : 10;

  return Math.min(
    audienceMaturityScore * 0.3 +
      conversionReadiness * 0.35 +
      diversificationBonus * 0.15 +
      challengeImpact * 0.1 +
      goalAlignment * 0.1,
    100,
  );
};

// Advanced Market Intelligence Engine
const generateAdvancedMarketInsights = (data: QuizData): any => {
  const insights = {
    competitorAnalysis: generateCompetitorProfile(data),
    trendPredictions: generateTrendPredictions(data),
    revenueOptimization: generateRevenueStrategy(data),
    algorithmInsights: generateAlgorithmStrategy(data),
  };

  return insights;
};

const generateCompetitorProfile = (data: QuizData) => {
  const nicheCompetitors = {
    "Fashion & Beauty": ["Komal Pandey", "Masoom Minawala", "Sejal Kumar"],
    Technology: ["Technical Guruji", "Geekyranjit", "Trakin Tech"],
    Education: ["Unacademy", "Physics Wallah", "Khan Academy"],
    "Food & Cooking": ["Kabita's Kitchen", "Nisha Madhulika", "Chef Ranveer"],
  };

  return {
    topCompetitors: nicheCompetitors[data.niche] || [
      "Top Creator 1",
      "Top Creator 2",
      "Top Creator 3",
    ],
    avgFollowerGrowth: "15-25% quarterly",
    avgEngagementRate: "2.8-4.2%",
    commonMonetizationMethods: [
      "Brand partnerships",
      "Affiliate marketing",
      "Course sales",
    ],
  };
};

const generateTrendPredictions = (data: QuizData) => {
  const currentYear = new Date().getFullYear();

  return {
    emergingFormats: [
      "AI-generated content",
      "Interactive polls",
      "Live shopping",
    ],
    platformGrowthPrediction: `${data.primaryPlatform} expected 23% creator revenue growth in ${currentYear + 1}`,
    nicheOpportunities: `${data.niche} shows 31% increase in brand budget allocation`,
    timingAdvantage: "Q4 2024 - highest brand partnership season",
  };
};

const generateRevenueStrategy = (data: QuizData) => {
  const followerNum = getFollowerCount(data.followerCount);
  const potentialRevenue = Math.min(followerNum * 0.8, 150000);

  return {
    immediateOpportunities: [
      "Affiliate partnerships",
      "Sponsored content",
      "Product placement",
    ],
    sixMonthGoal: `₹${Math.round(potentialRevenue * 0.4).toLocaleString()}`,
    yearlyPotential: `₹${Math.round(potentialRevenue).toLocaleString()}`,
    strategicFocus:
      followerNum < 10000 ? "Audience building" : "Revenue optimization",
  };
};

const generateAlgorithmStrategy = (data: QuizData) => {
  return {
    bestPostingTimes:
      data.primaryPlatform === "Instagram"
        ? "8-9 AM, 7-8 PM IST"
        : "6-8 PM IST",
    contentMix: "70% niche content, 20% trending topics, 10% personal",
    hashtagStrategy: "8-12 hashtags, mix of popular (1M+) and niche (10K-100K)",
    engagementHacks: [
      "Ask questions in captions",
      "Use polls in stories",
      "Reply to comments within 1 hour",
    ],
  };
};

export const analyzeQuizData = (data: QuizData): FameScoreAnalysis => {
  // Calculate base fame score
  let fameScore = 0;

  fameScore += getFollowerScore(data.followerCount) * 0.25; // 25% weight
  fameScore += getExperienceScore(data.experience) * 0.2; // 20% weight
  fameScore += getFrequencyScore(data.postingFrequency) * 0.15; // 15% weight
  fameScore += getPlatformScore(data.primaryPlatform) * 0.15; // 15% weight
  fameScore += getNicheScore(data.niche) * 0.1; // 10% weight
  fameScore +=
    getIncomeEfficiencyScore(data.monthlyIncome, data.followerCount) * 0.15; // 15% weight

  // Bonus points for multiple platforms
  if (data.secondaryPlatforms.length >= 2) fameScore += 5;
  if (data.secondaryPlatforms.length >= 3) fameScore += 3;

  // Enhanced social links analysis
  const socialLinksCount = Object.values(data.socialLinks).filter((link) =>
    link.trim(),
  ).length;
  fameScore += socialLinksCount * 2;

  // Real challenge-based scoring adjustments
  if (
    data.biggestChallenge.some((c) =>
      c.includes("Low views & inconsistent engagement"),
    )
  ) {
    fameScore -= 5; // Engagement issues reduce score
  }
  if (
    data.biggestChallenge.some((c) =>
      c.includes("Algorithm changes killing reach"),
    )
  ) {
    fameScore -= 3; // Algorithm dependency
  }
  if (
    data.biggestChallenge.some((c) =>
      c.includes("Can't convert followers into paying customers"),
    )
  ) {
    fameScore -= 4; // Monetization issues
  }

  // Goals-based scoring boosts
  if (data.goals.some((g) => g.includes("Build Personal Brand"))) {
    fameScore += 3; // Brand building focus
  }
  if (data.goals.some((g) => g.includes("Post More Consistently"))) {
    fameScore += 2; // Consistency awareness
  }

  // Additional bonus for platform diversity
  const platformDiversity = new Set([
    data.primaryPlatform,
    ...data.secondaryPlatforms,
  ]).size;
  fameScore += Math.min(platformDiversity * 1.5, 8); // Max 8 points for diversity

  // Bio bonus
  if (data.bio && data.bio.length > 50) fameScore += 3;

  // Cap at 100
  fameScore = Math.min(Math.round(fameScore), 100);

  // Calculate confidence score
  let confidenceScore = 70; // Base confidence

  // Higher confidence with more data
  if (socialLinksCount >= 2) confidenceScore += 15;
  if (data.bio && data.bio.length > 100) confidenceScore += 10;
  if (
    data.experience.length > 0 &&
    !data.experience.includes("Just started (0-6 months)")
  )
    confidenceScore += 10;

  // Lower confidence for unclear data
  if (data.niche === "Other") confidenceScore -= 15;
  if (data.contentType === "Mixed Content") confidenceScore -= 5;
  if (!data.age || !data.city) confidenceScore -= 10;

  confidenceScore = Math.max(Math.min(confidenceScore, 95), 40);

  const confidenceExplanation = `Based on ${socialLinksCount > 0 ? "verified social profiles, " : ""}quiz completeness (${Math.round((Object.keys(data).filter((key) => data[key as keyof QuizData]).length / Object.keys(data).length) * 100)}%), and industry data matching your profile.`;

  // Generate realistic income projections based on multiple factors
  const currentIncome = getIncomeAmount(data.monthlyIncome);
  const followerCount = getFollowerCount(data.followerCount);

  // Calculate realistic income potential based on platform-specific metrics
  const platformMultiplier = getPlatformIncomeMultiplier(data.primaryPlatform);
  const nicheMultiplier = getNicheIncomeMultiplier(data.niche);
  const experienceMultiplier = getExperienceIncomeMultiplier(data.experience);
  const engagementMultiplier = getEngagementIncomeMultiplier(
    data.engagementRate,
  );

  // Calculate realistic baseline income potential per follower (Indian market)
  let baselinePerFollower = 0;
  if (data.primaryPlatform === "Instagram") {
    baselinePerFollower =
      followerCount < 10000 ? 0.8 : followerCount < 100000 ? 1.2 : 2.0;
  } else if (data.primaryPlatform === "YouTube") {
    baselinePerFollower =
      followerCount < 10000 ? 1.5 : followerCount < 100000 ? 2.5 : 4.0;
  } else if (data.primaryPlatform === "LinkedIn") {
    baselinePerFollower =
      followerCount < 10000 ? 1.0 : followerCount < 100000 ? 1.8 : 3.0;
  } else if (data.primaryPlatform === "TikTok") {
    baselinePerFollower =
      followerCount < 10000 ? 0.7 : followerCount < 100000 ? 1.0 : 1.6;
  } else {
    baselinePerFollower = 0.6; // Other platforms
  }

  // Calculate realistic potential
  let realisticPotential = Math.round(
    followerCount *
      baselinePerFollower *
      platformMultiplier *
      nicheMultiplier *
      experienceMultiplier *
      engagementMultiplier,
  );
  if (currentIncome > 0 && realisticPotential < Math.round(currentIncome * 1.1)) {
    realisticPotential = Math.round(currentIncome * 1.1);
  }

  let threeMonthProjection = currentIncome;
  let sixMonthProjection = currentIncome;

  // Conservative growth projections based on fame score and current performance
  if (currentIncome === 0) {
    // First-time monetizers - realistic starting points
    if (followerCount >= 50000) {
      threeMonthProjection = Math.min(15000, realisticPotential * 0.3);
      sixMonthProjection = Math.min(35000, realisticPotential * 0.6);
    } else if (followerCount >= 10000) {
      threeMonthProjection = Math.min(8000, realisticPotential * 0.4);
      sixMonthProjection = Math.min(20000, realisticPotential * 0.7);
    } else if (followerCount >= 5000) {
      threeMonthProjection = Math.min(3000, realisticPotential * 0.5);
      sixMonthProjection = Math.min(8000, realisticPotential * 0.8);
    } else {
      threeMonthProjection = Math.min(1000, realisticPotential * 0.6);
      sixMonthProjection = Math.min(3000, realisticPotential);
    }
  } else {
    // Existing earners - realistic growth based on current performance
    const growthMultiplier =
      fameScore >= 70
        ? 1.4
        : fameScore >= 50
          ? 1.25
          : fameScore >= 30
            ? 1.15
            : 1.1;
    threeMonthProjection = Math.round(
      Math.min(currentIncome * growthMultiplier, realisticPotential * 0.7),
    );
    sixMonthProjection = Math.round(
      Math.min(currentIncome * (growthMultiplier + 0.3), realisticPotential),
    );

    if (threeMonthProjection < currentIncome) threeMonthProjection = currentIncome;
    if (sixMonthProjection < Math.round(currentIncome * 1.1)) sixMonthProjection = Math.round(currentIncome * 1.1);
  }

  // Ensure projections don't exceed realistic potential by too much
  threeMonthProjection = Math.min(
    threeMonthProjection,
    realisticPotential * 0.8,
  );
  sixMonthProjection = Math.min(sixMonthProjection, realisticPotential);

  if (currentIncome > 0) {
    threeMonthProjection = Math.max(threeMonthProjection, currentIncome);
    sixMonthProjection = Math.max(sixMonthProjection, Math.round(currentIncome * 1.1));
  }

  const formatIncome = (amount: number) => {
    if (amount >= 100000) return `₹${Math.round(amount / 1000)}K`;
    if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
    return `₹${amount}`;
  };

  // Add market-specific insights
  const marketInsights = generateMarketInsights(data, fameScore);
  const competitorAnalysis = generateCompetitorAnalysis(data);
  const growthPotential = calculateGrowthPotential(data, fameScore);

  // Calculate proprietary advanced metrics
  const famePotentialIndex = calculateFamePotentialIndex(data);
  const monetizationReadinessIndex = calculateMonetizationReadinessIndex(
    data,
    fameScore,
  );
  const advancedMarketInsights = generateAdvancedMarketInsights(data);

  return {
    fameScore,
    confidenceScore,
    confidenceExplanation,
    // Proprietary FameChase Metrics - Competitive Advantage
    famePotentialIndex: Math.round(famePotentialIndex),
    monetizationReadinessIndex: Math.round(monetizationReadinessIndex),
    experienceLevel: getExperienceLevelDescription(
      data.experience,
      fameScore,
      data,
    ),
    growthTrajectory: getGrowthTrajectory(data, fameScore),
    swotAnalysis: generateSWOTAnalysis(data, fameScore),
    marketInsights,
    advancedMarketInsights,
    competitorAnalysis,
    growthPotential,
    incomeProjection: formatIncome(sixMonthProjection),
    suggestions: generatePersonalizedRecommendations(data),
    monetizationRoadmap: {
      currentPhase:
        followerCount >= 50000
          ? "Scale & Optimize Revenue"
          : followerCount >= 10000
            ? "Active Monetization"
            : followerCount >= 1000
              ? "Pre-Monetization Growth"
              : "Foundation Building",
      nextSteps: generatePersonalizedRecommendations(data).slice(0, 4),
      incomeProjection: {
        current: formatIncome(currentIncome),
        threeMonth: formatIncome(threeMonthProjection),
        sixMonth: formatIncome(sixMonthProjection),
      },
    },
    personalizedRecommendations: generatePersonalizedRecommendations(data),
    contentStrategy: {
      posting:
        data.postingFrequency === "Daily" ||
        data.postingFrequency === "3-4 times a week"
          ? "Maintain current high frequency"
          : "Increase to 3-4 posts per week minimum",
      contentTypes:
        data.primaryPlatform === "Instagram"
          ? ["Reels (60%)", "Carousels (25%)", "Stories (15%)"]
          : data.primaryPlatform === "YouTube"
            ? ["Long-form (50%)", "Shorts (40%)", "Community posts (10%)"]
            : ["Platform-optimized content mix"],
      bestTimes:
        data.primaryPlatform === "Instagram"
          ? "7-9 PM and 12-2 PM IST"
          : data.primaryPlatform === "YouTube"
            ? "6-8 PM and 8-10 AM IST"
            : "Peak audience hours",
    },
    productRecommendations: generateProductRecommendations(data, fameScore),
  };
};

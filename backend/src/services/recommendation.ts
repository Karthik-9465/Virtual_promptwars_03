import prisma from '../config/db';

export interface RawRecommendation {
  title: string;
  description: string;
  category: string;
  co2Reduction: number;
  difficulty: 'low' | 'medium' | 'high';
  estimatedSavings: number; // in local currency (INR)
  timeRequired: 'immediate' | 'short_term' | 'long_term';
}

const TEMPLATE_RECOMMENDATIONS: RawRecommendation[] = [
  // TRANSPORT
  {
    title: 'Walk or cycle for trips under 2 km',
    description: 'Replace short car or motorcycle trips with walking or cycling to reduce carbon emissions and stay active.',
    category: 'transport',
    co2Reduction: 12.0,
    difficulty: 'low',
    estimatedSavings: 600,
    timeRequired: 'immediate',
  },
  {
    title: 'Carpool to work 3 days a week',
    description: 'Share your daily commute with colleagues or neighbors to divide transport footprint.',
    category: 'transport',
    co2Reduction: 38.0,
    difficulty: 'medium',
    estimatedSavings: 2500,
    timeRequired: 'short_term',
  },
  {
    title: 'Switch to public transport 3 days/week',
    description: 'Use the subway, train, or bus instead of driving to work/study.',
    category: 'transport',
    co2Reduction: 48.0,
    difficulty: 'medium',
    estimatedSavings: 3000,
    timeRequired: 'short_term',
  },
  {
    title: 'Switch to an Electric Vehicle (EV)',
    description: 'If planning a new vehicle purchase, opt for an EV to drastically cut tailpipe emissions.',
    category: 'transport',
    co2Reduction: 160.0,
    difficulty: 'high',
    estimatedSavings: 7000,
    timeRequired: 'long_term',
  },

  // ENERGY
  {
    title: 'Replace 5 incandescent bulbs with LEDs',
    description: 'Switch energy-guzzling legacy bulbs to energy-efficient LED alternatives.',
    category: 'energy',
    co2Reduction: 15.0,
    difficulty: 'low',
    estimatedSavings: 250,
    timeRequired: 'immediate',
  },
  {
    title: 'Turn off AC 1 hour earlier daily',
    description: 'Set your air conditioner timer or turn it off manually to conserve residential grid energy.',
    category: 'energy',
    co2Reduction: 12.0,
    difficulty: 'low',
    estimatedSavings: 450,
    timeRequired: 'immediate',
  },
  {
    title: 'Unplug vampire appliances',
    description: 'Turn off power strips and chargers at the wall when devices are fully charged or not in use.',
    category: 'energy',
    co2Reduction: 6.0,
    difficulty: 'low',
    estimatedSavings: 150,
    timeRequired: 'immediate',
  },
  {
    title: 'Adopt residential solar power',
    description: 'Install rooftop solar panels to cover your home electricity demands cleanly.',
    category: 'energy',
    co2Reduction: 220.0,
    difficulty: 'high',
    estimatedSavings: 5000,
    timeRequired: 'long_term',
  },

  // FOOD
  {
    title: 'Adopt Meatless Mondays',
    description: 'Avoid meat eating for just 1 day per week to reduce demand for intensive agricultural farming.',
    category: 'food',
    co2Reduction: 20.0,
    difficulty: 'low',
    estimatedSavings: 800,
    timeRequired: 'immediate',
  },
  {
    title: 'Go vegetarian 4 days a week',
    description: 'Shift your diet to focus primarily on plant-based alternatives and local vegetables.',
    category: 'food',
    co2Reduction: 65.0,
    difficulty: 'medium',
    estimatedSavings: 2200,
    timeRequired: 'short_term',
  },
  {
    title: 'Transition to a fully vegan diet',
    description: 'Eliminate dairy and animal products to lower your personal environmental footprint to the absolute minimum.',
    category: 'food',
    co2Reduction: 140.0,
    difficulty: 'high',
    estimatedSavings: 4000,
    timeRequired: 'long_term',
  },

  // SHOPPING
  {
    title: 'Reduce clothing purchases by 50%',
    description: 'Combat fast fashion waste by wearing clothes longer and buying high-quality pieces only when needed.',
    category: 'shopping',
    co2Reduction: 25.0,
    difficulty: 'medium',
    estimatedSavings: 3000,
    timeRequired: 'short_term',
  },
  {
    title: 'Purchase refurbished electronics',
    description: 'Extend device lifecycles and reduce e-waste by shopping for certified pre-owned phones and laptops.',
    category: 'shopping',
    co2Reduction: 80.0,
    difficulty: 'medium',
    estimatedSavings: 12000,
    timeRequired: 'long_term',
  },

  // WASTE
  {
    title: 'Recycle paper, metal, and plastic',
    description: 'Separate household recyclables from wet waste to divert plastic/glass from municipal landfills.',
    category: 'waste',
    co2Reduction: 8.0,
    difficulty: 'low',
    estimatedSavings: 100,
    timeRequired: 'immediate',
  },
  {
    title: 'Start organic kitchen composting',
    description: 'Turn fruit peels, vegetable scraps, and tea leaves into nutrient-rich soil compost at home.',
    category: 'waste',
    co2Reduction: 12.0,
    difficulty: 'medium',
    estimatedSavings: 200,
    timeRequired: 'short_term',
  },
];

export class RecommendationEngine {
  /**
   * Calculate dynamic recommendations for a user based on their profile and emissions.
   */
  public static async generateForUser(userId: string) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            footprints: {
              orderBy: { recordedMonth: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!profile) throw new Error('UserProfile not found');

    const latestFootprint = profile.user.footprints[0];
    if (!latestFootprint) {
      return []; // Return empty if calculator hasn't run yet
    }

    // Determine category contribution percentages
    const categoryTotals = {
      transport: latestFootprint.transportEmissions,
      energy: latestFootprint.energyEmissions,
      food: latestFootprint.foodEmissions,
      shopping: latestFootprint.shoppingEmissions,
      waste: latestFootprint.wasteEmissions,
    };

    // Calculate priority weights. Categories with higher emissions get a boost.
    const total = latestFootprint.totalEmissions || 1.0;
    const categoryWeights: Record<string, number> = {
      transport: 1.0 + (categoryTotals.transport / total),
      energy: 1.0 + (categoryTotals.energy / total),
      food: 1.0 + (categoryTotals.food / total),
      shopping: 1.0 + (categoryTotals.shopping / total),
      waste: 1.0 + (categoryTotals.waste / total),
    };

    // Filter out recommendations that are irrelevant based on profile:
    // e.g. If user is already vegan, don't recommend "Meatless Mondays"
    // If user already walks/cycles, don't suggest public transport
    const filteredTemplates = TEMPLATE_RECOMMENDATIONS.filter((rec) => {
      if (rec.category === 'food') {
        if (profile.diet === 'vegan') return false; // Already vegan
        if (profile.diet === 'vegetarian' && rec.title.toLowerCase().includes('vegetarian')) return false;
        if (profile.diet === 'vegetarian' && rec.title.toLowerCase().includes('meatless')) return false;
      }
      if (rec.category === 'transport') {
        if (profile.transportMode === 'walk' && rec.title.toLowerCase().includes('walk')) return false;
        if (profile.weeklyDistanceKm === 0) return false; // No commute
      }
      if (rec.category === 'energy') {
        if (profile.electricityKwhM === 0 && rec.title.toLowerCase().includes('electricity')) return false;
        if (profile.acHoursPerDay === 0 && rec.title.toLowerCase().includes('ac')) return false;
      }
      if (rec.category === 'waste') {
        if (profile.wasteRecyclingRate > 0.8 && rec.title.toLowerCase().includes('recycle')) return false;
      }
      return true;
    });

    // Score recommendations: Impact Score = Carbon Reduction * Feasibility * Category Weight
    const scoredRecommendations = filteredTemplates.map((rec) => {
      let feasibility = 1.0;
      if (rec.difficulty === 'medium') feasibility = 0.7;
      if (rec.difficulty === 'high') feasibility = 0.4;

      const categoryWeight = categoryWeights[rec.category] || 1.0;
      
      const impactScore = rec.co2Reduction * feasibility * categoryWeight;

      return {
        ...rec,
        impactScore: Math.round(impactScore * 10) / 10,
      };
    });

    // Sort by impact score descending
    scoredRecommendations.sort((a, b) => b.impactScore - a.impactScore);

    // Save recommendations to database if they don't already exist or are active
    const activeRecommendations = await prisma.recommendation.findMany({
      where: { userId, status: 'active' },
    });

    const activeTitles = new Set(activeRecommendations.map((r) => r.title));

    // Add up to 5 top recommendations that aren't already active or completed/skipped
    const toAdd = scoredRecommendations
      .filter((rec) => !activeTitles.has(rec.title))
      .slice(0, 5);

    if (toAdd.length > 0) {
      await prisma.recommendation.createMany({
        data: toAdd.map((rec) => ({
          userId,
          title: rec.title,
          description: rec.description,
          category: rec.category,
          co2Reduction: rec.co2Reduction,
          difficulty: rec.difficulty,
          estimatedSavings: rec.estimatedSavings,
          timeRequired: rec.timeRequired,
          impactScore: rec.impactScore,
          status: 'active',
        })),
      });
    }

    return prisma.recommendation.findMany({
      where: { userId, status: 'active' },
      orderBy: { impactScore: 'desc' },
    });
  }
}

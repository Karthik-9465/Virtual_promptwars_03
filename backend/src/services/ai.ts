import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../config/db';

export class AIService {
  private static getGeminiClient(): any {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    try {
      return new GoogleGenerativeAI(apiKey);
    } catch (e) {
      console.warn('Failed to initialize GoogleGenerativeAI client:', e);
      return null;
    }
  }

  /**
   * Generates a conversational AI response based on the user's footprint context.
   */
  public static async generateChatResponse(
    userId: string,
    userMessage: string,
    history: { sender: string; text: string }[]
  ): Promise<string> {
    // 1. Gather User Context
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            footprints: { orderBy: { recordedMonth: 'desc' }, take: 1 },
          },
        },
      },
    });

    const footprint = profile?.user?.footprints[0];
    const contextInfo = profile && footprint
      ? `User Eco Profile:
         - Location: ${profile.location}
         - Age Group: ${profile.ageGroup}
         - Diet: ${profile.diet}
         - Core Transport: ${profile.transportMode} (${profile.weeklyDistanceKm} km/week)
         - Monthly Carbon Footprint: ${footprint.totalEmissions} kg CO2
           * Transport: ${footprint.transportEmissions} kg CO2
           * Energy: ${footprint.energyEmissions} kg CO2
           * Food: ${footprint.foodEmissions} kg CO2
           * Shopping: ${footprint.shoppingEmissions} kg CO2
           * Waste: ${footprint.wasteEmissions} kg CO2
         - Sustainability Score: ${profile.sustainabilityScore}/100
         - XP: ${profile.xpPoints}, Streak: ${profile.streakDays} days`
      : 'No profile details available yet.';

    const systemPrompt = `You are "EcoBot", a friendly, encouraging, and highly knowledgeable AI Sustainability Assistant.
Your goal is to help individuals understand, track, and reduce their carbon footprint.
Be concise, practical, and action-oriented. Avoid overly dry technical jargon.
Always use local context if available. Refer to user stats (e.g. diet, transport, score) to make your answers personalized.
Whenever possible, quantify reductions (e.g., "Switching to X saves Y kg CO2/month").

${contextInfo}`;

    const client = this.getGeminiClient();
    if (client) {
      try {
        const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const contents = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...history.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ];

        const result = await model.generateContent({ contents });
        const text = result.response.text();
        if (text) return text;
      } catch (err) {
        console.error('Gemini API call failed, falling back to local reasoning:', err);
      }
    }

    // High-fidelity Local Rule-Based Heuristic AI Fallback
    return this.generateHeuristicResponse(userMessage, profile, footprint);
  }

  /**
   * Generates profile insights to show on the dashboard.
   */
  public static async generateProfileInsights(userId: string): Promise<string> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            footprints: { orderBy: { recordedMonth: 'desc' }, take: 1 },
          },
        },
      },
    });

    if (!profile || !profile.user.footprints[0]) {
      return "Let's complete your onboarding questionnaire to calculate your carbon footprint and unlock AI-driven environmental insights!";
    }

    const footprint = profile.user.footprints[0];

    const client = this.getGeminiClient();
    if (client) {
      try {
        const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Analyze the following carbon footprint profile and write a short, punchy 3-sentence summary highlighting the user's largest contributor and a practical tip to reduce it.
        Stats:
        - Total: ${footprint.totalEmissions} kg CO2/month
        - Transport: ${footprint.transportEmissions} kg
        - Energy: ${footprint.energyEmissions} kg
        - Food: ${footprint.foodEmissions} kg
        - Shopping: ${footprint.shoppingEmissions} kg
        - Waste: ${footprint.wasteEmissions} kg
        - Diet: ${profile.diet}
        - Primary Transport: ${profile.transportMode}`;

        const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
        const text = result.response.text();
        if (text) return text;
      } catch (err) {
        console.error('Gemini API failed for insights, using heuristics:', err);
      }
    }

    // Heuristic Insights fallback
    const categories = [
      { name: 'Transport', value: footprint.transportEmissions },
      { name: 'Home Energy', value: footprint.energyEmissions },
      { name: 'Food Habits', value: footprint.foodEmissions },
      { name: 'Shopping Habits', value: footprint.shoppingEmissions },
      { name: 'Waste Generation', value: footprint.wasteEmissions },
    ];
    categories.sort((a, b) => b.value - a.value);
    const topCategory = categories[0];

    let tip = '';
    if (topCategory.name === 'Transport') {
      tip = 'Consider switching to public transport or carpooling a few times a week, or walking/cycling for trips under 2 km.';
    } else if (topCategory.name === 'Home Energy') {
      tip = 'Replacing incandescent bulbs with LEDs or setting your AC to 24-26°C can reduce your household electricity consumption significantly.';
    } else if (topCategory.name === 'Food Habits') {
      tip = 'Adopting Meatless Mondays or reducing dairy consumption can substantially drop your food emissions.';
    } else if (topCategory.name === 'Shopping Habits') {
      tip = 'Slowing down fast-fashion purchases and opting for refurbished electronics will lower your manufacturing impact.';
    } else {
      tip = 'Increasing your waste recycling rate and composting food scraps will divert organic waste from methane-producing landfills.';
    }

    return `Your biggest emission source is **${topCategory.name}** at **${Math.round(topCategory.value)} kg CO₂/month** (${Math.round((topCategory.value / footprint.totalEmissions) * 100)}% of your total footprint). ${tip} Keep updating your logs to improve your Sustainability Score!`;
  }

  private static generateHeuristicResponse(message: string, profile: any, footprint: any): string {
    const msg = message.toLowerCase();

    // 1. Check for specific keywords
    if (msg.includes('meat') || msg.includes('diet') || msg.includes('food') || msg.includes('vegan') || msg.includes('vegetarian')) {
      return `Eating meat daily contributes significantly to emissions. For example, a high-meat diet produces about **7.5 kg CO₂/day**, whereas a vegetarian diet produces **2.5 kg CO₂/day**, and a vegan diet just **1.5 kg CO₂/day**.
      
By adopting **Meatless Mondays** (just one vegetarian day per week), you can reduce your personal carbon footprint by approximately **20 kg CO₂ per month** and save money on groceries!`;
    }

    if (msg.includes('cycle') || msg.includes('cycling') || msg.includes('scooter') || msg.includes('car') || msg.includes('transport') || msg.includes('bus') || msg.includes('train')) {
      let transportInfo = '';
      if (profile) {
        transportInfo = `Currently, you commute using a **${profile.transportMode}** traveling **${profile.weeklyDistanceKm} km/week**, contributing **${footprint?.transportEmissions || 0} kg CO₂/month**. `;
      }
      return `${transportInfo}Cycling is carbon-neutral (0 emissions). In contrast, driving a petrol car emits approximately **0.18 kg CO₂/km**, a motorcycle/scooter emits **0.10 kg CO₂/km**, and public transport only **0.06 kg CO₂/km**.
      
If you switch from a petrol car to cycling or public transport for just 20 km of commuting per week, you'll reduce emissions by about **10-15 kg CO₂/month**.`;
    }

    if (msg.includes('bulb') || msg.includes('led') || msg.includes('electricity') || msg.includes('ac') || msg.includes('energy') || msg.includes('solar')) {
      return `Home Energy is a major emissions category. Standard electricity grids produce about **0.5 kg CO₂ per kWh** consumed.
      
**Quick Wins for Energy:**
1. **LED Transition**: Swapping 5 traditional incandescent bulbs for LEDs saves **15 kg CO₂/month** and around ₹250/month in utility bills.
2. **AC Efficiency**: Setting your AC unit to 24°C rather than 18°C consumes up to 30% less power.
3. **Solar Power**: Installing residential solar panels is a high-impact action that can reduce up to **220 kg CO₂/month** for a typical household.`;
    }

    if (msg.includes('reduce') || msg.includes('how can i') || msg.includes('help') || msg.includes('tip')) {
      if (footprint) {
        const categories = [
          { name: 'Transport', value: footprint.transportEmissions },
          { name: 'Home Energy', value: footprint.energyEmissions },
          { name: 'Food Habits', value: footprint.foodEmissions },
          { name: 'Shopping Habits', value: footprint.shoppingEmissions },
          { name: 'Waste Generation', value: footprint.wasteEmissions },
        ];
        categories.sort((a, b) => b.value - a.value);
        const worst = categories[0];
        return `Based on your profile, your highest emission category is **${worst.name}** (${Math.round(worst.value)} kg CO₂/month).
        
To start reducing your footprint immediately, I recommend:
1. **Quick Win**: Focus on small energy savings (like LEDs or AC timers).
2. **Behavioral shift**: Shift one meal a day to plant-based, or replace one car trip with public transport.
3. **Check your Recommendations tab**: I have prepared tailored actions with specific CO₂ reductions, effort ratings, and cost savings for you!`;
      }
      return `Welcome! To start reducing your footprint, complete your Eco Profile first. Standard starting steps include adopting Meatless Mondays, switching to LED lightbulbs, unplugging vampire electronics, and walking or cycling for short commutes under 2 km.`;
    }

    // Default response
    return `Hello! I'm EcoBot, your sustainability assistant. I can help you understand the carbon impact of different activities (like diets, driving, home energy, and shopping) and help you implement practical reduction strategies.

Ask me questions like:
- *"Is cycling better than using a scooter?"*
- *"What is the environmental impact of eating meat daily?"*
- *"How can I reduce my household electricity footprint?"*`;
  }
}

export interface LifestyleProfile {
  ageGroup: string;
  location: string;
  diet: string;
  transportMode: string;
  weeklyDistanceKm: number;
  electricityKwhM: number;
  acHoursPerDay: number;
  flightHoursPerYear: number;
  shoppingFrequency: string;
  wasteRecyclingRate: number; // 0.0 to 1.0
}

export interface CalculatedFootprint {
  transportEmissions: number;
  energyEmissions: number;
  foodEmissions: number;
  shoppingEmissions: number;
  wasteEmissions: number;
  totalEmissions: number;
  sustainabilityScore: number;
}

export class CarbonCalculatorService {
  // Grid emission factors in kg CO2 per kWh based on general region profiles
  private static getGridFactor(location: string): number {
    const loc = location.toLowerCase();
    if (loc.includes('india') || loc.includes('in')) return 0.82;
    if (loc.includes('usa') || loc.includes('us') || loc.includes('america')) return 0.38;
    if (loc.includes('europe') || loc.includes('eu') || loc.includes('uk') || loc.includes('germany') || loc.includes('france')) return 0.25;
    if (loc.includes('china') || loc.includes('cn')) return 0.61;
    return 0.50; // Global default factor
  }

  public static calculate(profile: LifestyleProfile): CalculatedFootprint {
    // 1. Transportation
    let transportFactor = 0.06; // Default to public / bus
    const mode = profile.transportMode.toLowerCase();
    if (mode.includes('car_petrol') || mode.includes('petrol')) {
      transportFactor = 0.18;
    } else if (mode.includes('car_electric') || mode.includes('electric')) {
      transportFactor = 0.05;
    } else if (mode.includes('motorcycle') || mode.includes('bike_motor')) {
      transportFactor = 0.10;
    } else if (mode.includes('walk') || mode.includes('bicycle')) {
      transportFactor = 0.0;
    }

    const transportEmissions = (profile.weeklyDistanceKm * 4.33 * transportFactor) + 
      ((profile.flightHoursPerYear / 12) * 90.0); // 90 kg CO2 per hour flight

    // 2. Home Energy
    const gridFactor = this.getGridFactor(profile.location);
    const electricityEmissions = profile.electricityKwhM * gridFactor;
    const acEmissions = profile.acHoursPerDay * 30 * 1.5 * gridFactor; // Assumes 1.5kW AC unit
    const energyEmissions = electricityEmissions + acEmissions;

    // 3. Food
    let dailyFoodFactor = 4.0; // Default to low meat / mixed diet
    const diet = profile.diet.toLowerCase();
    if (diet === 'vegan') {
      dailyFoodFactor = 1.5;
    } else if (diet === 'vegetarian') {
      dailyFoodFactor = 2.5;
    } else if (diet === 'low_meat') {
      dailyFoodFactor = 4.0;
    } else if (diet === 'high_meat') {
      dailyFoodFactor = 7.5;
    }
    const foodEmissions = dailyFoodFactor * 30;

    // 4. Shopping
    let shoppingEmissions = 50.0; // Default medium frequency
    const shop = profile.shoppingFrequency.toLowerCase();
    if (shop === 'low') {
      shoppingEmissions = 15.0;
    } else if (shop === 'medium') {
      shoppingEmissions = 50.0;
    } else if (shop === 'high') {
      shoppingEmissions = 150.0;
    }

    // 5. Waste
    // Baseline waste emissions: 30kg waste * 0.5 kg CO2/kg = 15 kg CO2
    // We reduce waste by up to 60% based on recycling rate (0.0 to 1.0)
    const wasteEmissions = Math.max(0, 15.0 * (1 - (0.6 * profile.wasteRecyclingRate)));

    const totalEmissions = transportEmissions + energyEmissions + foodEmissions + shoppingEmissions + wasteEmissions;

    // 6. Sustainability Score
    // High score (100) is green/low emissions, Low score is high emissions.
    // Baseline average is around 500 kg CO2 / month.
    // If a user produces less than 150 kg/month, they are in the top tier.
    let baseScore = 100 - (totalEmissions / 8);
    
    // Add bonus points for positive habits
    if (profile.diet === 'vegan') baseScore += 10;
    if (profile.diet === 'vegetarian') baseScore += 5;
    if (profile.wasteRecyclingRate > 0.5) baseScore += 5;
    if (profile.transportMode === 'walk' || profile.transportMode === 'bicycle') baseScore += 5;

    const sustainabilityScore = Math.max(10, Math.min(100, Math.round(baseScore)));

    return {
      transportEmissions: Math.round(transportEmissions * 100) / 100,
      energyEmissions: Math.round(energyEmissions * 100) / 100,
      foodEmissions: Math.round(foodEmissions * 100) / 100,
      shoppingEmissions: Math.round(shoppingEmissions * 100) / 100,
      wasteEmissions: Math.round(wasteEmissions * 100) / 100,
      totalEmissions: Math.round(totalEmissions * 100) / 100,
      sustainabilityScore
    };
  }
}

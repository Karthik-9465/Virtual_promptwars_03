import { CarbonCalculatorService, LifestyleProfile } from '../services/calculator';

describe('CarbonCalculatorService', () => {
  test('should calculate correct emissions for a sustainable vegan profile', () => {
    const profile: LifestyleProfile = {
      ageGroup: 'student',
      location: 'germany',
      diet: 'vegan',
      transportMode: 'walk',
      weeklyDistanceKm: 0,
      electricityKwhM: 50, // 50 * 0.25 = 12.5 kg CO2
      acHoursPerDay: 0,
      flightHoursPerYear: 0,
      shoppingFrequency: 'low', // 15 kg CO2
      wasteRecyclingRate: 0.8, // 15 * (1 - (0.6 * 0.8)) = 15 * 0.52 = 7.8 kg CO2
    };

    const result = CarbonCalculatorService.calculate(profile);

    expect(result.transportEmissions).toBe(0);
    expect(result.foodEmissions).toBe(45); // 1.5 * 30
    expect(result.energyEmissions).toBe(12.5); // 50 kWh * 0.25 grid factor
    expect(result.shoppingEmissions).toBe(15);
    expect(result.wasteEmissions).toBe(7.8);
    expect(result.totalEmissions).toBe(80.3); // 0 + 45 + 12.5 + 15 + 7.8 = 80.3
    expect(result.sustainabilityScore).toBeGreaterThanOrEqual(80);
  });

  test('should calculate correct emissions for a high emitter profile', () => {
    const profile: LifestyleProfile = {
      ageGroup: 'professional',
      location: 'india', // 0.82 grid factor
      diet: 'high_meat', // 7.5 * 30 = 225 kg
      transportMode: 'car_petrol', // 0.18 factor
      weeklyDistanceKm: 200, // 200 * 4.33 * 0.18 = 155.88 kg
      electricityKwhM: 200, // 200 * 0.82 = 164 kg
      acHoursPerDay: 6, // 6 * 30 * 1.5 * 0.82 = 221.4 kg
      flightHoursPerYear: 24, // 24 / 12 * 90 = 180 kg
      shoppingFrequency: 'high', // 150 kg
      wasteRecyclingRate: 0.1, // 15 * (1 - (0.6 * 0.1)) = 14.1 kg
    };

    const result = CarbonCalculatorService.calculate(profile);

    expect(result.foodEmissions).toBe(225);
    expect(result.transportEmissions).toBeCloseTo(335.88, 1); // 155.88 + 180 = 335.88
    expect(result.energyEmissions).toBeCloseTo(385.4, 1); // 164 + 221.4 = 385.4
    expect(result.shoppingEmissions).toBe(150);
    expect(result.wasteEmissions).toBeCloseTo(14.1, 1);
    expect(result.totalEmissions).toBeCloseTo(1110.38, 1);
    expect(result.sustainabilityScore).toBeLessThan(50);
  });
});

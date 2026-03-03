import { CountryProfile } from './localisation.types';

export interface GeneratedProduct {
  name: string;
  category: string;
  flavorProfile: string;
  packSize: string;
  targetDemographic: string;
  pricePoint: 'Value' | 'Mid-Tier' | 'Premium';
  reasoning: string[];
}

export const generateProductsForCountry = (profile: CountryProfile): GeneratedProduct[] => {
  const products: GeneratedProduct[] = [];
  const { cultural, flavors, climate, gdpPerCapitaUSD } = profile;

  // Rule 1: Income Level Determination
  const incomeLevel = gdpPerCapitaUSD > 25000 ? 'High' : gdpPerCapitaUSD > 6000 ? 'Mid' : 'Low';

  // Rule 2: Climate Impact
  const isHotClimate = (climate?.averageTempHigh || 25) > 30;
  const isColdClimate = (climate?.averageTempLow || 10) < 5;

  // Rule 3: Flavor Preferences
  const likesSpicy = flavors?.preferredProfiles.includes('spicy');
  const likesSweet = flavors?.preferredProfiles.includes('sweet');
  const likesSavory = flavors?.preferredProfiles.includes('savory');
  const likesUmami = flavors?.preferredProfiles.includes('umami');
  const isTeaCulture = cultural?.diningHabits.toLowerCase().includes('tea') || flavors?.popularIngredients.includes('Tea') || cultural?.diningHabits.toLowerCase().includes('chai');

  // --- GENERATION LOGIC ---

  // 1. BEVERAGES
  if (isHotClimate) {
    if (likesSweet) {
      products.push({
        name: `Harvics Ice ${flavors?.popularIngredients[0] || 'Fruit'} Sparkle`,
        category: 'Beverage',
        flavorProfile: 'Sweet & Refreshing',
        packSize: incomeLevel === 'Low' ? '250ml Pouch' : '330ml Can',
        targetDemographic: 'Youth',
        pricePoint: incomeLevel === 'Low' ? 'Value' : 'Mid-Tier',
        reasoning: ['Hot climate demands hydration', 'Local preference for sweet flavors']
      });
    } else if (likesSavory) {
      products.push({
        name: `Harvics Salted Lemon Fizz`,
        category: 'Beverage',
        flavorProfile: 'Salty & Sour',
        packSize: '300ml Bottle',
        targetDemographic: 'Adults',
        pricePoint: 'Mid-Tier',
        reasoning: ['Hot climate', 'Savory preference for electrolyte replenishment']
      });
    }
  } else if (isColdClimate) {
     products.push({
        name: `Harvics Warm Cocoa Comfort`,
        category: 'Beverage',
        flavorProfile: 'Chocolate & Rich',
        packSize: 'Instant Sachet',
        targetDemographic: 'Family',
        pricePoint: 'Mid-Tier',
        reasoning: ['Cold climate comfort drink']
      });
  }

  // Tea Logic (New)
  if (isTeaCulture) {
      products.push({
        name: `Harvics Premium ${incomeLevel === 'High' ? 'Earl Grey' : 'Masala Chai'} Blend`,
        category: 'Beverage',
        flavorProfile: 'Aromatic',
        packSize: incomeLevel === 'Low' ? '10g Sachet' : '50 Tea Bags Box',
        targetDemographic: 'All Ages',
        pricePoint: incomeLevel === 'Low' ? 'Value' : 'Premium',
        reasoning: ['Strong local tea culture detected', 'Daily consumption staple']
      });
  }

  // 2. SNACKS
  if (likesSpicy && (profile.cultural?.diningHabits.includes('Snack') || profile.cultural?.diningHabits.includes('Street food'))) {
     products.push({
        name: `Harvics Fire ${flavors?.popularIngredients[0] || 'Chili'} Chips`,
        category: 'Snacks',
        flavorProfile: 'Extra Spicy',
        packSize: '50g Bag',
        targetDemographic: 'Youth',
        pricePoint: 'Value',
        reasoning: ['High spice tolerance', 'Snacking culture']
      });
  }

  // Umami/Savory Logic (New)
  if (likesUmami || likesSavory) {
      products.push({
        name: `Harvics ${likesUmami ? 'Soy Glazed' : 'Sea Salt'} Crackers`,
        category: 'Snacks',
        flavorProfile: likesUmami ? 'Umami Rich' : 'Savory',
        packSize: '100g Box',
        targetDemographic: 'Family',
        pricePoint: incomeLevel === 'High' ? 'Premium' : 'Mid-Tier',
        reasoning: ['Preference for savory/umami flavors', 'Shared snacking']
      });
  }

  // 3. SEASONAL (Dynamic)
  if (cultural?.seasonalEvents) {
    cultural.seasonalEvents.forEach(event => {
      // Only generate for major events to avoid clutter
      if (['Ramadan', 'Diwali', 'Christmas', 'Lunar New Year', 'Thanksgiving'].includes(event.name)) {
         products.push({
          name: `Harvics ${event.name} Celebration Box`,
          category: 'Seasonal',
          flavorProfile: 'Festive Mix',
          packSize: 'Gift Box',
          targetDemographic: 'Family',
          pricePoint: incomeLevel === 'Low' ? 'Mid-Tier' : 'Premium', // Gift boxes are usually higher tier
          reasoning: [`Specific product for ${event.name}`, `Focus on ${event.productFocus}`]
        });
      }
    });
  }

  // 4. STAPLES (Low Income Specific)
  if (incomeLevel === 'Low') {
     products.push({
        name: `Harvics Everyday Essentials`,
        category: 'Staple',
        flavorProfile: 'Standard',
        packSize: 'Single Serve Sachet',
        targetDemographic: 'Mass Market',
        pricePoint: 'Value',
        reasoning: ['Low daily disposable income', 'Need for small unit packs']
      });
  }

  return products;
};

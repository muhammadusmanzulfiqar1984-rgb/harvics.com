import { countryProfiles } from '../src/modules/localisation/localisation.data';
import { generateProductsForCountry } from '../src/modules/localisation/productGenerator.service';

const testCountries = ['US', 'PK', 'AE', 'IN', 'CN', 'GB'];

console.log('--- STARTING PRODUCT GENERATION TEST ---');

testCountries.forEach(code => {
  const profile = countryProfiles.find(p => p.code === code);
  if (profile) {
    console.log(`\nGenerating products for: ${profile.name} (${code})`);
    // DEBUG
    if (code === 'US') {
       console.log('US Profile Keys:', Object.keys(profile));
       // @ts-ignore
       console.log('Climate:', profile.climate);
    }
    const products = generateProductsForCountry(profile);
    
    if (products.length === 0) {
      console.log('No products generated. Check rules.');
    } else {
      products.forEach(p => {
        console.log(`- [${p.category}] ${p.name} (${p.pricePoint})`);
        console.log(`  Reasoning: ${p.reasoning.join(', ')}`);
      });
    }
  } else {
    console.error(`Profile not found for ${code}`);
  }
});

console.log('\n--- TEST COMPLETE ---');

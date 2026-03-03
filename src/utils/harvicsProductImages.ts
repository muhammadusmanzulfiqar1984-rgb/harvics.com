/**
 * Harvics Product Images
 * Collection of Harvics branded product images for use across the website
 * All images are from the public/Images/products directory
 */

export const harvicsProductImages = [
  // Confectionary Products
  '/Images/products/Confectionary/WhatsApp Image 2025-09-19 at 1.50.06 AM (1).jpeg',
  '/Images/products/Confectionary/WhatsApp Image 2025-09-19 at 1.50.08 AM.jpeg',
  '/Images/products/Confectionary/WhatsApp Image 2025-09-19 at 1.50.05 AM (1).jpeg',
  '/Images/products/Confectionary/WhatsApp Image 2025-09-19 at 1.50.07 AM (1).jpeg',
  '/Images/products/Confectionary/WhatsApp Image 2025-09-19 at 1.50.05 AM.jpeg',
  '/Images/products/Confectionary/WhatsApp Image 2025-09-19 at 1.50.04 AM.jpeg',
  '/Images/products/Confectionary/WhatsApp Image 2025-09-19 at 1.50.04 AM (2).jpeg',
  '/Images/products/Confectionary/WhatsApp Image 2025-09-19 at 1.50.07 AM (2).jpeg',
  '/Images/products/Confectionary/WhatsApp Image 2025-09-19 at 1.50.06 AM.jpeg',
  '/Images/products/Confectionary/WhatsApp Image 2025-09-19 at 1.50.04 AM (1).jpeg',
  '/Images/products/Confectionary/WhatsApp Image 2025-09-19 at 1.50.07 AM.jpeg',
  '/Images/products/Confectionary/4369d6f1-c1c3-41be-be7b-76372de99401.JPG',
  '/Images/products/Confectionary/a86ea5cf-ff7f-46b2-8e58-e6f4eb7a882e.JPG',
  
  // Beverages - Energy Drinks
  '/Images/products/Beverages/Energy Drinks/WhatsApp Image 2025-09-21 at 11.53.36 PM (1).jpeg',
  '/Images/products/Beverages/Energy Drinks/WhatsApp Image 2025-09-21 at 11.53.35 PM.jpeg',
  '/Images/products/Beverages/Energy Drinks/WhatsApp Image 2025-09-21 at 10.36.33 PM.jpeg',
  '/Images/products/Beverages/Energy Drinks/WhatsApp Image 2025-09-21 at 11.53.34 PM.jpeg',
  '/Images/products/Beverages/Energy Drinks/WhatsApp Image 2025-09-21 at 11.53.35 PM (2).jpeg',
  '/Images/products/Beverages/Energy Drinks/WhatsApp Image 2025-09-21 at 11.53.36 PM.jpeg',
  '/Images/products/Beverages/Energy Drinks/WhatsApp Image 2025-09-21 at 11.53.35 PM (1).jpeg',
  '/Images/products/Beverages/Energy Drinks/WhatsApp Image 2025-09-21 at 11.53.37 PM.jpeg',
  '/Images/products/Beverages/Energy Drinks/WhatsApp Image 2025-09-21 at 11.53.37 PM (1).jpeg',
  '/Images/products/Beverages/Energy Drinks/WhatsApp Image 2025-09-21 at 11.53.37 PM (2).jpeg',
  
  // Beverages - Flavored Milk
  '/Images/products/Beverages/Flavored milk/2d263ee0-4a3a-4bfb-a83b-d172356cb589.JPG',
  '/Images/products/Beverages/Flavored milk/WhatsApp Image 2025-09-21 at 10.36.32 PM.jpeg',
  '/Images/products/Beverages/Flavored milk/WhatsApp Image 2025-09-21 at 10.36.31 PM.jpeg',
  '/Images/products/Beverages/Flavored milk/WhatsApp Image 2025-09-17 at 12.44.40 AM.jpeg',
  '/Images/products/Beverages/Flavored milk/WhatsApp Image 2025-09-21 at 10.36.30 PM.jpeg',
  '/Images/products/Beverages/Flavored milk/WhatsApp Image 2025-09-21 at 10.36.34 PM.jpeg',
  '/Images/products/Beverages/Flavored milk/WhatsApp Image 2025-09-21 at 10.36.36 PM.jpeg',
  '/Images/products/Beverages/Flavored milk/WhatsApp Image 2025-09-21 at 10.36.31 PM (1).jpeg',
  
  // Beverages - Juices
  '/Images/products/Beverages/Juices/7211e9c4-96d0-4e7f-aa8c-22b73e6e15fa.JPG',
  
  // Bakery Products
  '/Images/products/Bakery/2844c337-e8e4-40f5-be1e-0545a4f1055f.JPG',
  '/Images/products/Bakery/f28925d1-0064-4d80-8223-08b420869965.JPG',
  '/Images/products/Bakery/2332.JPG',
  
  // Pasta Products
  '/Images/products/Pasta/pasta.png',
  
  // General Product Images
  '/Images/products/2d263ee0-4a3a-4bfb-a83b-d172356cb589.JPG',
  '/Images/products/2844c337-e8e4-40f5-be1e-0545a4f1055f.JPG',
  '/Images/products/7211e9c4-96d0-4e7f-aa8c-22b73e6e15fa.JPG',
  '/Images/products/f28925d1-0064-4d80-8223-08b420869965.JPG',
  '/Images/products/5c80817c-c6e8-48d0-b61a-5c202ad913c9.JPG',
  '/Images/products/4a1969df-20da-4289-b344-9b14313efe98.JPG',
  '/Images/products/4369d6f1-c1c3-41be-be7b-76372de99401.JPG',
  '/Images/products/a86ea5cf-ff7f-46b2-8e58-e6f4eb7a882e.JPG',
  '/Images/products/a109ca36-2a04-4370-9060-e0f9809aad95.JPG',
  '/Images/products/1ef0fde6-f142-4628-ae70-83bd55148225.JPG',
  '/Images/products/5720440d-9ce9-4024-b649-9111f2263a9f.JPG',
]

/**
 * Get a random product image from the Harvics collection
 */
export function getRandomProductImage(): string {
  const randomIndex = Math.floor(Math.random() * harvicsProductImages.length)
  return harvicsProductImages[randomIndex]
}

/**
 * Get a product image by index (useful for consistent display)
 */
export function getProductImage(index: number): string {
  return harvicsProductImages[index % harvicsProductImages.length]
}

/**
 * Get multiple product images
 */
export function getProductImages(count: number): string[] {
  const images: string[] = []
  for (let i = 0; i < count; i++) {
    images.push(getProductImage(i))
  }
  return images
}


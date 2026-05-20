'use client'

import React, { useState, useEffect } from 'react'

interface SmartImageProps {
  src?: string
  keyword?: string
  alt: string
  context?: {
    category?: string
    product?: string
    industry?: string
  }
  className?: string
  fallbackSrc?: string
  showSkeleton?: boolean
  style?: React.CSSProperties
}

/**
 * SmartImage — Auto-generates images using AI when missing
 * Falls back to Unsplash if AI generation fails
 */
const SmartImage: React.FC<SmartImageProps> = ({
  src,
  keyword,
  alt,
  context,
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&h=600&fit=crop&q=70',
  showSkeleton = true,
  style,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(src || null)
  const [isLoading, setIsLoading] = useState(!src)
  const [hasError, setHasError] = useState(false)

  // Static Unsplash image map for reliable loading — all 10 verticals
  const PRODUCT_IMAGES: Record<string, string> = {
    // ─── TEXTILES & APPAREL ───
    'apparel': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=800&fit=crop&auto=format&q=60',
    'fabrics': 'https://images.unsplash.com/photo-1528459105426-b9548367069b?w=800&h=800&fit=crop&auto=format&q=60',
    'accessories': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop&auto=format&q=60',
    'bags': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop&auto=format&q=60',
    'belts': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&auto=format&q=60',
    'scarves': 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&h=800&fit=crop&auto=format&q=60',
    'polyester': 'https://images.unsplash.com/photo-1528459105426-b9548367069b?w=800&h=800&fit=crop&auto=format&q=60',
    'blends': 'https://images.unsplash.com/photo-1528459105426-b9548367069b?w=800&h=800&fit=crop&auto=format&q=60',
    'curtains': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=800&fit=crop&auto=format&q=60',
    'shirt': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop&auto=format&q=60',
    'silk': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=800&fit=crop&auto=format&q=60',
    'scarf': 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&h=800&fit=crop&auto=format&q=60',
    'denim': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop&auto=format&q=60',
    'jeans': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop&auto=format&q=60',
    'linen': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=800&fit=crop&auto=format&q=60',
    'dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop&auto=format&q=60',
    'sweater': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop&auto=format&q=60',
    'leather': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop&auto=format&q=60',
    'jacket': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop&auto=format&q=60',
    'textile': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=800&fit=crop&auto=format&q=60',
    'fabric': 'https://images.unsplash.com/photo-1528459105426-b9548367069b?w=800&h=800&fit=crop&auto=format&q=60',
    'menswear': '/Industries Picture/Textile and Apparels/Mens .jpg',
    'womenswear': '/Industries Picture/Textile and Apparels/Ladies wear .jpg',
    'mens wear': '/Industries Picture/Textile and Apparels/Mens .jpg',
    'ladies wear': '/Industries Picture/Textile and Apparels/Ladies wear .jpg',
    'kids wear': '/Industries Picture/Textile and Apparels/Kids wear.jpg',
    'sportswear': '/Industries Picture/Textile and Apparels/Sports Wear.jpg',
    'home textiles': '/Industries Picture/Textile and Apparels/Home textile .jpg',
    'bed linen': '/Industries Picture/Textile and Apparels/Home textile .jpg',
    'bath linen': '/Industries Picture/Textile and Apparels/Home textile .jpg',
    'suit': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop&auto=format&q=60',
    'polo': 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&h=800&fit=crop&auto=format&q=60',
    'blazer': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=800&fit=crop&auto=format&q=60',
    'overcoat': 'https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=800&h=800&fit=crop&auto=format&q=60',
    'sports wear': '/Industries Picture/Textile and Apparels/Sports Wear.jpg',
    'gown': 'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=800&h=800&fit=crop&auto=format&q=60',
    'blouse': 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&h=800&fit=crop&auto=format&q=60',
    'handbag': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop&auto=format&q=60',
    'hoodie': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop&auto=format&q=60',
    'sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&auto=format&q=60',
    'boots': 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&h=800&fit=crop&auto=format&q=60',
    'bedsheet': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=800&fit=crop&auto=format&q=60',
    'towel': 'https://images.unsplash.com/photo-1583845112203-29329902332e?w=800&h=800&fit=crop&auto=format&q=60',
    'cushion': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop&auto=format&q=60',
    'curtain': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=800&fit=crop&auto=format&q=60',
    'chinos': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=800&fit=crop&auto=format&q=60',
    'parka': 'https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=800&h=800&fit=crop&auto=format&q=60',
    'knitwear': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=800&fit=crop&auto=format&q=60',
    'men': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&auto=format&q=60',
    'women': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop&auto=format&q=60',
    'wool': 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&h=800&fit=crop&auto=format&q=60',
    'fashion': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=800&fit=crop&auto=format&q=60',
    'technical': 'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=800&h=800&fit=crop&auto=format&q=60',
    'pack': 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&h=800&fit=crop&auto=format&q=60',
    'school': 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=800&fit=crop&auto=format&q=60',
    'decor': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop&auto=format&q=60',
    'kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop&auto=format&q=60',

    // ─── FMCG ───
    'food': 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&h=800&fit=crop&auto=format&q=60',
    'personal care': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop&auto=format&q=60',
    'home care': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&h=800&fit=crop&auto=format&q=60',
    'distribution': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=800&fit=crop&auto=format&q=60',
    'grains': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=800&fit=crop&auto=format&q=60',
    'snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=800&fit=crop&auto=format&q=60',
    'beverages': 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&h=800&fit=crop&auto=format&q=60',
    'haircare': 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&h=800&fit=crop&auto=format&q=60',
    'hygiene': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop&auto=format&q=60',
    'detergents': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&h=800&fit=crop&auto=format&q=60',
    'cleaners': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=800&fit=crop&auto=format&q=60',
    'paper': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=800&fit=crop&auto=format&q=60',
    'tools': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop&auto=format&q=60',
    'wholesale': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=800&fit=crop&auto=format&q=60',
    'storage': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=800&fit=crop&auto=format&q=60',
    'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop&auto=format&q=60',
    'flour': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=800&fit=crop&auto=format&q=60',
    'grain': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=800&fit=crop&auto=format&q=60',
    'lentils': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=800&h=800&fit=crop&auto=format&q=60',
    'oats': 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800&h=800&fit=crop&auto=format&q=60',
    'oil': 'https://images.unsplash.com/photo-1474979266404-7eaacdc948b6?w=800&h=800&fit=crop&auto=format&q=60',
    'olive': 'https://images.unsplash.com/photo-1474979266404-7eaacdc948b6?w=800&h=800&fit=crop&auto=format&q=60',
    'ghee': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&h=800&fit=crop&auto=format&q=60',
    'spices': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=800&fit=crop&auto=format&q=60',
    'noodles': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=800&fit=crop&auto=format&q=60',
    'cookies': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=800&fit=crop&auto=format&q=60',
    'chips': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&h=800&fit=crop&auto=format&q=60',
    'snack': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=800&fit=crop&auto=format&q=60',
    'milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&h=800&fit=crop&auto=format&q=60',
    'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=800&fit=crop&auto=format&q=60',
    'juice': 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&h=800&fit=crop&auto=format&q=60',
    'coffee': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=800&fit=crop&auto=format&q=60',
    'toothpaste': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop&auto=format&q=60',
    'soap': 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=800&h=800&fit=crop&auto=format&q=60',
    'shampoo': 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&h=800&fit=crop&auto=format&q=60',
    'detergent': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&h=800&fit=crop&auto=format&q=60',
    'beverage': 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&h=800&fit=crop&auto=format&q=60',
    'skincare': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop&auto=format&q=60',
    'cosmetics': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop&auto=format&q=60',
    'red': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=800&h=800&fit=crop&auto=format&q=60',
    'butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&h=800&fit=crop&auto=format&q=60',
    'bowl': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=800&fit=crop&auto=format&q=60',
    'carton': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&h=800&fit=crop&auto=format&q=60',
    'block': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=800&fit=crop&auto=format&q=60',
    'glass': 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&h=800&fit=crop&auto=format&q=60',
    'jar': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=800&fit=crop&auto=format&q=60',
    'laundry': 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&h=800&fit=crop&auto=format&q=60',

    // ─── COMMODITIES ───
    'agri': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=800&fit=crop&auto=format&q=60',
    'energy': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=800&fit=crop&auto=format&q=60',
    'metals': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop&auto=format&q=60',
    'softs': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&h=800&fit=crop&auto=format&q=60',
    'proteins': 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=800&h=800&fit=crop&auto=format&q=60',
    'crude oil': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=800&fit=crop&auto=format&q=60',
    'natural gas': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=800&fit=crop&auto=format&q=60',
    'lng': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=800&fit=crop&auto=format&q=60',
    'cotton': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop&auto=format&q=60',
    'wheat': 'https://images.unsplash.com/photo-1437252611977-07f74518abd7?w=800&h=800&fit=crop&auto=format&q=60',
    'corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&h=800&fit=crop&auto=format&q=60',
    'soybean': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop&auto=format&q=60',
    'sugar': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=800&fit=crop&auto=format&q=60',
    'cocoa': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&h=800&fit=crop&auto=format&q=60',
    'gold': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=800&fit=crop&auto=format&q=60',
    'silver': 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&h=800&fit=crop&auto=format&q=60',
    'copper': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop&auto=format&q=60',
    'steel': 'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&h=800&fit=crop&auto=format&q=60',
    'iron': 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&h=800&fit=crop&auto=format&q=60',
    'aluminum': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop&auto=format&q=60',
    'crude': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=800&fit=crop&auto=format&q=60',
    'coal': 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=800&fit=crop&auto=format&q=60',
    'beef': 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop&auto=format&q=60',
    'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=800&fit=crop&auto=format&q=60',
    'fish': 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=800&h=800&fit=crop&auto=format&q=60',
    'palm': 'https://images.unsplash.com/photo-1474979266404-7eaacdc948b6?w=800&h=800&fit=crop&auto=format&q=60',
    'fertilizer': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=800&fit=crop&auto=format&q=60',

    'field': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=800&fit=crop&auto=format&q=60',
    'farm': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=800&fit=crop&auto=format&q=60',
    'pile': 'https://images.unsplash.com/photo-1518110925495-5fe2c8dcf2f5?w=800&h=800&fit=crop&auto=format&q=60',
    'yellow': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=800&fit=crop&auto=format&q=60',
    'mine': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop&auto=format&q=60',
    'truck': 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=800&fit=crop&auto=format&q=60',
    'bars': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=800&fit=crop&auto=format&q=60',
    'metal': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop&auto=format&q=60',
    'meat': 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop&auto=format&q=60',
    'ocean': 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=800&fit=crop&auto=format&q=60',

    // ─── INDUSTRIAL ───
    'chemicals': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=800&fit=crop&auto=format&q=60',
    'machinery': 'https://images.unsplash.com/photo-1581091877018-dac6a371d50f?w=800&h=800&fit=crop&auto=format&q=60',
    'mro': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop&auto=format&q=60',
    'machine': 'https://images.unsplash.com/photo-1581091877018-dac6a371d50f?w=800&h=800&fit=crop&auto=format&q=60',
    'cnc': 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=800&fit=crop&auto=format&q=60',
    'factory': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop&auto=format&q=60',
    'safety': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop&auto=format&q=60',
    'helmet': 'https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=800&h=800&fit=crop&auto=format&q=60',
    'industrial': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop&auto=format&q=60',
    'chemical': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=800&fit=crop&auto=format&q=60',
    'polymer': 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&h=800&fit=crop&auto=format&q=60',
    'polymers': 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&h=800&fit=crop&auto=format&q=60',
    'acids': 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&h=800&fit=crop&auto=format&q=60',
    'solvents': 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&h=800&fit=crop&auto=format&q=60',
    'textile machinery': 'https://images.unsplash.com/photo-1558769132-cb1aea6d7d6e?w=800&h=800&fit=crop&auto=format&q=60',
    'food processing': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop&auto=format&q=60',
    'packaging': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=800&fit=crop&auto=format&q=60',
    'ppe': 'https://images.unsplash.com/photo-1574757988474-1be3a1172763?w=800&h=800&fit=crop&auto=format&q=60',
    'lockout': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop&auto=format&q=60',
    'fire': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop&auto=format&q=60',
    'bearing': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop&auto=format&q=60',
    'bearings': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop&auto=format&q=60',
    'drive belts': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&auto=format&q=60',

    // ─── MINERALS ───
    'precious': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=800&fit=crop&auto=format&q=60',
    'base metals': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop&auto=format&q=60',
    'energy minerals': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop&auto=format&q=60',
    'mining': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop&auto=format&q=60',
    'ore': 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&h=800&fit=crop&auto=format&q=60',
    'iron ore': 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&h=800&fit=crop&auto=format&q=60',
    'copper ore': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop&auto=format&q=60',
    'lithium': 'https://images.unsplash.com/photo-1619641805634-98e5c7d37f7f?w=800&h=800&fit=crop&auto=format&q=60',
    'platinum': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=800&fit=crop&auto=format&q=60',
    'zinc': 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=800&fit=crop&auto=format&q=60',
    'uranium': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop&auto=format&q=60',
    'sand': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=800&fit=crop&auto=format&q=60',
    'gravel': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=800&fit=crop&auto=format&q=60',
    'limestone': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop&auto=format&q=60',

    // ─── OIL & GAS ───
    'upstream': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=800&fit=crop&auto=format&q=60',
    'midstream': 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&h=800&fit=crop&auto=format&q=60',
    'downstream': 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&h=800&fit=crop&auto=format&q=60',
    'services': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=800&fit=crop&auto=format&q=60',
    'trading': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop&auto=format&q=60',
    'rig': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=800&fit=crop&auto=format&q=60',
    'pipeline': 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&h=800&fit=crop&auto=format&q=60',
    'pipelines': 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&h=800&fit=crop&auto=format&q=60',
    'refinery': 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&h=800&fit=crop&auto=format&q=60',
    'refining': 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&h=800&fit=crop&auto=format&q=60',
    'drilling': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=800&fit=crop&auto=format&q=60',
    'tanker': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=800&fit=crop&auto=format&q=60',
    'exploration': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=800&fit=crop&auto=format&q=60',
    'terminal': 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=800&fit=crop&auto=format&q=60',
    'terminals': 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=800&fit=crop&auto=format&q=60',
    'osv': 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=800&fit=crop&auto=format&q=60',
    'fuel': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop&auto=format&q=60',
    'hse': 'https://images.unsplash.com/photo-1574757988474-1be3a1172763?w=800&h=800&fit=crop&auto=format&q=60',
    'epc': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop&auto=format&q=60',

    // ─── REAL ESTATE ───
    'commercial': 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=800&fit=crop&auto=format&q=60',
    'residential': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=800&fit=crop&auto=format&q=60',
    'facilities': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=800&fit=crop&auto=format&q=60',
    'office': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop&auto=format&q=60',
    'offices': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop&auto=format&q=60',
    'building': 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=800&fit=crop&auto=format&q=60',
    'apartment': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=800&fit=crop&auto=format&q=60',
    'apartments': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=800&fit=crop&auto=format&q=60',
    'villa': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=800&fit=crop&auto=format&q=60',
    'villas': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=800&fit=crop&auto=format&q=60',
    'warehouse': 'https://images.unsplash.com/photo-1590247813913-a5d4e9e7a50a?w=800&h=800&fit=crop&auto=format&q=60',
    'warehouses': 'https://images.unsplash.com/photo-1590247813913-a5d4e9e7a50a?w=800&h=800&fit=crop&auto=format&q=60',
    'retail': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop&auto=format&q=60',
    'construction': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop&auto=format&q=60',
    'community': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=800&fit=crop&auto=format&q=60',
    'mixed use': 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=800&fit=crop&auto=format&q=60',
    'parks': 'https://images.unsplash.com/photo-1569163139394-de4e5f43e5ca?w=800&h=800&fit=crop&auto=format&q=60',
    'sez': 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=800&fit=crop&auto=format&q=60',
    'fm': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=800&fit=crop&auto=format&q=60',
    'leasing': 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=800&fit=crop&auto=format&q=60',
    'advisory': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop&auto=format&q=60',

    // ─── SOURCING ───
    'manufacturing': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop&auto=format&q=60',
    'inspection': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=800&fit=crop&auto=format&q=60',
    'logistics': 'https://images.unsplash.com/photo-1590247813913-a5d4e9e7a50a?w=800&h=800&fit=crop&auto=format&q=60',
    'cargo': 'https://images.unsplash.com/photo-1590247813913-a5d4e9e7a50a?w=800&h=800&fit=crop&auto=format&q=60',
    'shipping': 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=800&fit=crop&auto=format&q=60',
    'consulting': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop&auto=format&q=60',
    'strategy': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop&auto=format&q=60',
    'sustainable': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=800&fit=crop&auto=format&q=60',
    'quality': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=800&fit=crop&auto=format&q=60',
    'quality control': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=800&fit=crop&auto=format&q=60',
    'global sourcing': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=800&fit=crop&auto=format&q=60',
    'supplier discovery': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=800&fit=crop&auto=format&q=60',
    'vetting': 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=800&fit=crop&auto=format&q=60',
    'negotiation': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop&auto=format&q=60',
    'inspections': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=800&fit=crop&auto=format&q=60',
    'audits': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=800&fit=crop&auto=format&q=60',
    'testing': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=800&fit=crop&auto=format&q=60',
    'freight': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=800&fit=crop&auto=format&q=60',
    'customs': 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=800&fit=crop&auto=format&q=60',
    'warehousing': 'https://images.unsplash.com/photo-1590247813913-a5d4e9e7a50a?w=800&h=800&fit=crop&auto=format&q=60',
    'optimization': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=800&fit=crop&auto=format&q=60',
    'risk management': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop&auto=format&q=60',

    // ─── FINANCE ───
    'trade finance': 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=800&h=800&fit=crop&auto=format&q=60',
    'digital payments': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop&auto=format&q=60',
    'invoicing': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&fit=crop&auto=format&q=60',
    'risk': 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=800&fit=crop&auto=format&q=60',
    'finance': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=800&fit=crop&auto=format&q=60',
    'bank': 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=800&h=800&fit=crop&auto=format&q=60',
    'payment': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop&auto=format&q=60',
    'wallet': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop&auto=format&q=60',
    'invoice': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=800&fit=crop&auto=format&q=60',
    'compliance': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=800&fit=crop&auto=format&q=60',
    'kyc': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=800&fit=crop&auto=format&q=60',
    'analytics': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop&auto=format&q=60',
    'hpay': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop&auto=format&q=60',
    'lc': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop&auto=format&q=60',
    'sblc': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop&auto=format&q=60',
    'forfaiting': 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=800&fit=crop&auto=format&q=60',
    'wallets': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop&auto=format&q=60',
    'payments': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop&auto=format&q=60',
    'gateway': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop&auto=format&q=60',
    'bills': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=800&fit=crop&auto=format&q=60',
    'reconciliation': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop&auto=format&q=60',
    'reports': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=800&fit=crop&auto=format&q=60',
    'scoring': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=800&fit=crop&auto=format&q=60',
    'aml': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=800&fit=crop&auto=format&q=60',

    // ─── AI & TECHNOLOGY ───
    'forecasting': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop&auto=format&q=60',
    'computer vision': 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=800&fit=crop&auto=format&q=60',
    'conversational': 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=800&fit=crop&auto=format&q=60',
    'integration': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=800&fit=crop&auto=format&q=60',
    'ai': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop&auto=format&q=60',
    'ai solutions': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=800&fit=crop&auto=format&q=60',
    'forecast': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop&auto=format&q=60',
    'vision': 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=800&fit=crop&auto=format&q=60',
    'chat': 'https://images.unsplash.com/photo-1531746790095-76c87e6b4b1b?w=800&h=800&fit=crop&auto=format&q=60',
    'data': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop&auto=format&q=60',
    'erp': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop&auto=format&q=60',
    'mobile': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=800&fit=crop&auto=format&q=60',
    'blockchain': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=800&fit=crop&auto=format&q=60',
    'technology': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=800&fit=crop&auto=format&q=60',
    'support': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=800&fit=crop&auto=format&q=60',
    'training': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=800&fit=crop&auto=format&q=60',
    'docs': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=800&fit=crop&auto=format&q=60',
    'slas': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=800&fit=crop&auto=format&q=60',
    'apis': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=800&fit=crop&auto=format&q=60',
    'e-commerce': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop&auto=format&q=60',

    // ─── SOURCING EXTRA ───
    'brand': 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=800&fit=crop&auto=format&q=60',
    'label': 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=800&fit=crop&auto=format&q=60',
    'design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=800&fit=crop&auto=format&q=60',
    'eco': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=800&fit=crop&auto=format&q=60',
    'green': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=800&fit=crop&auto=format&q=60',
    'government': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop&auto=format&q=60',
    'infrastructure': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop&auto=format&q=60',

    // ─── DEFAULT ───
    'default': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop&auto=format&q=60',
  }

  useEffect(() => {
    // If we already have a src, use it
    if (src) {
      setImageSrc(src)
      setIsLoading(false)
      return
    }

    // If keyword provided, use it directly
    if (keyword) {
      const searchText = keyword.toLowerCase()
      let matchedUrl = PRODUCT_IMAGES.default

      // 1. Exact match first
      if (PRODUCT_IMAGES[searchText]) {
        matchedUrl = PRODUCT_IMAGES[searchText]
      } else {
        // 2. Longest key that the searchText includes (most specific partial match)
        let bestKey = ''
        for (const key of Object.keys(PRODUCT_IMAGES)) {
          if (searchText.includes(key) && key.length > bestKey.length) {
            bestKey = key
          }
        }
        if (bestKey) {
          matchedUrl = PRODUCT_IMAGES[bestKey]
        }
      }

      setImageSrc(matchedUrl)
      setIsLoading(false)
      return
    }

    // If no context provided, use fallback
    if (!context || (!context.product && !context.category)) {
      setImageSrc(fallbackSrc)
      setIsLoading(false)
      return
    }

    // Find matching image from keywords
    const searchText = `${context.product || ''} ${context.category || ''}`.toLowerCase()
    let matchedUrl = PRODUCT_IMAGES.default

    // Longest key that appears in searchText (most specific match wins)
    let bestKey = ''
    for (const key of Object.keys(PRODUCT_IMAGES)) {
      if (searchText.includes(key) && key.length > bestKey.length) {
        bestKey = key
      }
    }
    if (bestKey) matchedUrl = PRODUCT_IMAGES[bestKey]

    setImageSrc(matchedUrl)
    setIsLoading(false)
  }, [src, keyword, context, fallbackSrc])

  // Skeleton loader
  if (isLoading && showSkeleton) {
    return (
      <div
        className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`}
        style={{
          animation: 'shimmer 1.5s infinite',
        }}
      >
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <img
      src={imageSrc || fallbackSrc}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        if (!hasError) {
          setHasError(true)
          setImageSrc(fallbackSrc)
        }
      }}
      loading="lazy"
      decoding="async"
    />
  )
}

export default SmartImage

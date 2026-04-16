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
  fallbackSrc = '/Images/placeholder.png',
  showSkeleton = true,
  style,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(src || null)
  const [isLoading, setIsLoading] = useState(!src)
  const [hasError, setHasError] = useState(false)

  // Static Unsplash image map for reliable loading — all 10 verticals
  const PRODUCT_IMAGES: Record<string, string> = {
    // ─── TEXTILES & APPAREL ───
    'apparel': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=800&fit=crop',
    'fabrics': 'https://images.unsplash.com/photo-1528459105426-b9548367069b?w=800&h=800&fit=crop',
    'accessories': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop',
    'bags': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop',
    'belts': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
    'scarves': 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&h=800&fit=crop',
    'polyester': 'https://images.unsplash.com/photo-1528459105426-b9548367069b?w=800&h=800&fit=crop',
    'blends': 'https://images.unsplash.com/photo-1528459105426-b9548367069b?w=800&h=800&fit=crop',
    'curtains': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=800&fit=crop',
    'shirt': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop',
    'silk': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=800&fit=crop',
    'scarf': 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&h=800&fit=crop',
    'denim': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop',
    'jeans': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop',
    'linen': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=800&fit=crop',
    'dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop',
    'sweater': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop',
    'leather': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop',
    'jacket': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop',
    'textile': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=800&fit=crop',
    'fabric': 'https://images.unsplash.com/photo-1528459105426-b9548367069b?w=800&h=800&fit=crop',
    'menswear': '/Industries Picture/Textile and Apparels/Mens .jpg',
    'womenswear': '/Industries Picture/Textile and Apparels/Ladies wear .jpg',
    'mens wear': '/Industries Picture/Textile and Apparels/Mens .jpg',
    'ladies wear': '/Industries Picture/Textile and Apparels/Ladies wear .jpg',
    'kids wear': '/Industries Picture/Textile and Apparels/Kids wear.jpg',
    'sportswear': '/Industries Picture/Textile and Apparels/Sports Wear.jpg',
    'home textiles': '/Industries Picture/Textile and Apparels/Home textile .jpg',
    'bed linen': '/Industries Picture/Textile and Apparels/Home textile .jpg',
    'bath linen': '/Industries Picture/Textile and Apparels/Home textile .jpg',
    'suit': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop',
    'polo': 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&h=800&fit=crop',
    'blazer': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=800&fit=crop',
    'overcoat': 'https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=800&h=800&fit=crop',
    'sports wear': '/Industries Picture/Textile and Apparels/Sports Wear.jpg',
    'gown': 'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=800&h=800&fit=crop',
    'blouse': 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&h=800&fit=crop',
    'handbag': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop',
    'hoodie': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
    'sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    'boots': 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&h=800&fit=crop',
    'bedsheet': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=800&fit=crop',
    'towel': 'https://images.unsplash.com/photo-1583845112203-29329902332e?w=800&h=800&fit=crop',
    'cushion': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop',
    'curtain': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=800&fit=crop',
    'chinos': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=800&fit=crop',
    'parka': 'https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=800&h=800&fit=crop',
    'knitwear': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=800&fit=crop',
    'men': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop',
    'women': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop',
    'wool': 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&h=800&fit=crop',
    'fashion': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=800&fit=crop',
    'technical': 'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=800&h=800&fit=crop',
    'pack': 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&h=800&fit=crop',
    'school': 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=800&fit=crop',
    'decor': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop',
    'kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop',

    // ─── FMCG ───
    'food': 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&h=800&fit=crop',
    'personal care': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop',
    'home care': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&h=800&fit=crop',
    'distribution': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=800&fit=crop',
    'grains': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=800&fit=crop',
    'snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=800&fit=crop',
    'beverages': 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&h=800&fit=crop',
    'haircare': 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&h=800&fit=crop',
    'hygiene': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop',
    'detergents': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&h=800&fit=crop',
    'cleaners': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=800&fit=crop',
    'paper': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=800&fit=crop',
    'tools': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop',
    'wholesale': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=800&fit=crop',
    'storage': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=800&fit=crop',
    'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop',
    'flour': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=800&fit=crop',
    'grain': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=800&fit=crop',
    'lentils': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=800&h=800&fit=crop',
    'oats': 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800&h=800&fit=crop',
    'oil': 'https://images.unsplash.com/photo-1474979266404-7eaacdc948b6?w=800&h=800&fit=crop',
    'olive': 'https://images.unsplash.com/photo-1474979266404-7eaacdc948b6?w=800&h=800&fit=crop',
    'ghee': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&h=800&fit=crop',
    'spices': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=800&fit=crop',
    'noodles': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=800&fit=crop',
    'cookies': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=800&fit=crop',
    'chips': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&h=800&fit=crop',
    'snack': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=800&fit=crop',
    'milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&h=800&fit=crop',
    'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=800&fit=crop',
    'juice': 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&h=800&fit=crop',
    'coffee': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=800&fit=crop',
    'toothpaste': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop',
    'soap': 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=800&h=800&fit=crop',
    'shampoo': 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&h=800&fit=crop',
    'detergent': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&h=800&fit=crop',
    'beverage': 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&h=800&fit=crop',
    'skincare': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop',
    'cosmetics': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop',
    'red': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=800&h=800&fit=crop',
    'butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&h=800&fit=crop',
    'bowl': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=800&fit=crop',
    'carton': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&h=800&fit=crop',
    'block': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=800&fit=crop',
    'glass': 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&h=800&fit=crop',
    'jar': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=800&fit=crop',
    'laundry': 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&h=800&fit=crop',

    // ─── COMMODITIES ───
    'agri': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=800&fit=crop',
    'energy': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=800&fit=crop',
    'metals': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop',
    'softs': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&h=800&fit=crop',
    'proteins': 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=800&h=800&fit=crop',
    'crude oil': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=800&fit=crop',
    'natural gas': 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&h=800&fit=crop',
    'lng': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=800&fit=crop',
    'cotton': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop',
    'wheat': 'https://images.unsplash.com/photo-1437252611977-07f74518abd7?w=800&h=800&fit=crop',
    'corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&h=800&fit=crop',
    'soybean': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop',
    'sugar': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=800&fit=crop',
    'cocoa': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&h=800&fit=crop',
    'gold': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=800&fit=crop',
    'silver': 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&h=800&fit=crop',
    'copper': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop',
    'steel': 'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&h=800&fit=crop',
    'iron': 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&h=800&fit=crop',
    'aluminum': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop',
    'crude': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=800&fit=crop',
    'coal': 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=800&fit=crop',
    'beef': 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop',
    'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=800&fit=crop',
    'fish': 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=800&h=800&fit=crop',
    'palm': 'https://images.unsplash.com/photo-1474979266404-7eaacdc948b6?w=800&h=800&fit=crop',
    'fertilizer': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=800&fit=crop',

    'field': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=800&fit=crop',
    'farm': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=800&fit=crop',
    'pile': 'https://images.unsplash.com/photo-1518110925495-5fe2c8dcf2f5?w=800&h=800&fit=crop',
    'yellow': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=800&fit=crop',
    'mine': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop',
    'truck': 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=800&fit=crop',
    'bars': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=800&fit=crop',
    'metal': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop',
    'meat': 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop',
    'ocean': 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=800&fit=crop',

    // ─── INDUSTRIAL ───
    'chemicals': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=800&fit=crop',
    'machinery': 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=800&fit=crop',
    'mro': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop',
    'machine': 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=800&fit=crop',
    'cnc': 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=800&fit=crop',
    'factory': 'https://images.unsplash.com/photo-1581091877018-dac6a371d50f?w=800&h=800&fit=crop',
    'safety': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop',
    'helmet': 'https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=800&h=800&fit=crop',
    'industrial': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop',
    'chemical': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=800&fit=crop',
    'polymer': 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&h=800&fit=crop',
    'polymers': 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&h=800&fit=crop',
    'acids': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=800&fit=crop',
    'solvents': 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&h=800&fit=crop',
    'textile machinery': 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=800&fit=crop',
    'food processing': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop',
    'packaging': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=800&fit=crop',
    'ppe': 'https://images.unsplash.com/photo-1574757988474-1be3a1172763?w=800&h=800&fit=crop',
    'lockout': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop',
    'fire': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop',
    'bearing': 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=800&fit=crop',
    'bearings': 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=800&fit=crop',
    'drive belts': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',

    // ─── MINERALS ───
    'precious': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=800&fit=crop',
    'base metals': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop',
    'energy minerals': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop',
    'mining': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop',
    'ore': 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&h=800&fit=crop',
    'iron ore': 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&h=800&fit=crop',
    'copper ore': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop',
    'lithium': 'https://images.unsplash.com/photo-1619641805634-98e5c7d37f7f?w=800&h=800&fit=crop',
    'platinum': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=800&fit=crop',
    'zinc': 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=800&fit=crop',
    'uranium': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=800&fit=crop',
    'sand': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=800&fit=crop',
    'gravel': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=800&fit=crop',
    'limestone': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop',

    // ─── OIL & GAS ───
    'upstream': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=800&fit=crop',
    'midstream': 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&h=800&fit=crop',
    'downstream': 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&h=800&fit=crop',
    'services': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=800&fit=crop',
    'trading': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop',
    'rig': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=800&fit=crop',
    'pipeline': 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&h=800&fit=crop',
    'pipelines': 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&h=800&fit=crop',
    'refinery': 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&h=800&fit=crop',
    'refining': 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&h=800&fit=crop',
    'drilling': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=800&fit=crop',
    'tanker': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=800&fit=crop',
    'exploration': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=800&fit=crop',
    'terminal': 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=800&fit=crop',
    'terminals': 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=800&fit=crop',
    'osv': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=800&fit=crop',
    'fuel': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop',
    'hse': 'https://images.unsplash.com/photo-1574757988474-1be3a1172763?w=800&h=800&fit=crop',
    'epc': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop',

    // ─── REAL ESTATE ───
    'commercial': 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=800&fit=crop',
    'residential': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=800&fit=crop',
    'facilities': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=800&fit=crop',
    'office': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop',
    'offices': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop',
    'building': 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=800&fit=crop',
    'apartment': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=800&fit=crop',
    'apartments': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=800&fit=crop',
    'villa': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=800&fit=crop',
    'villas': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=800&fit=crop',
    'warehouse': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=800&fit=crop',
    'warehouses': 'https://images.unsplash.com/photo-1590247813913-a5d4e9e7a50a?w=800&h=800&fit=crop',
    'retail': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop',
    'construction': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop',
    'community': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=800&fit=crop',
    'mixed use': 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=800&fit=crop',
    'parks': 'https://images.unsplash.com/photo-1569163139394-de4e5f43e5ca?w=800&h=800&fit=crop',
    'sez': 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=800&fit=crop',
    'fm': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=800&fit=crop',
    'leasing': 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=800&fit=crop',
    'advisory': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop',

    // ─── SOURCING ───
    'manufacturing': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop',
    'inspection': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=800&fit=crop',
    'logistics': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=800&fit=crop',
    'cargo': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=800&fit=crop',
    'shipping': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=800&fit=crop',
    'consulting': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop',
    'strategy': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=800&fit=crop',
    'sustainable': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=800&fit=crop',
    'quality': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=800&fit=crop',
    'quality control': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=800&fit=crop',
    'global sourcing': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=800&fit=crop',
    'supplier discovery': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=800&fit=crop',
    'vetting': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=800&fit=crop',
    'negotiation': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop',
    'inspections': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=800&fit=crop',
    'audits': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&fit=crop',
    'testing': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=800&fit=crop',
    'freight': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=800&fit=crop',
    'customs': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=800&fit=crop',
    'warehousing': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=800&fit=crop',
    'optimization': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&fit=crop',
    'risk management': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&fit=crop',

    // ─── FINANCE ───
    'trade finance': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=800&fit=crop',
    'digital payments': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop',
    'invoicing': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=800&fit=crop',
    'risk': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&fit=crop',
    'finance': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=800&fit=crop',
    'bank': 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=800&h=800&fit=crop',
    'payment': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop',
    'wallet': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop',
    'invoice': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=800&fit=crop',
    'compliance': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&fit=crop',
    'kyc': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&fit=crop',
    'analytics': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=800&fit=crop',
    'hpay': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop',
    'lc': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=800&fit=crop',
    'sblc': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&fit=crop',
    'forfaiting': 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=800&fit=crop',
    'wallets': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop',
    'payments': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop',
    'gateway': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop',
    'bills': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=800&fit=crop',
    'reconciliation': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&fit=crop',
    'reports': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&fit=crop',
    'scoring': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&fit=crop',
    'aml': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&fit=crop',

    // ─── AI & TECHNOLOGY ───
    'forecasting': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&fit=crop',
    'computer vision': 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=800&fit=crop',
    'conversational': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop',
    'integration': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=800&fit=crop',
    'ai': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop',
    'ai solutions': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop',
    'forecast': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&fit=crop',
    'vision': 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=800&fit=crop',
    'chat': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop',
    'data': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&fit=crop',
    'erp': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=800&fit=crop',
    'mobile': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=800&fit=crop',
    'blockchain': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=800&fit=crop',
    'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop',
    'support': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=800&fit=crop',
    'training': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=800&fit=crop',
    'docs': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=800&fit=crop',
    'slas': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=800&fit=crop',
    'apis': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop',
    'e-commerce': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop',

    // ─── SOURCING EXTRA ───
    'brand': 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=800&fit=crop',
    'label': 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=800&fit=crop',
    'design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=800&fit=crop',
    'eco': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=800&fit=crop',
    'green': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=800&fit=crop',
    'government': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop',
    'infrastructure': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop',

    // ─── DEFAULT ───
    'default': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop',
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

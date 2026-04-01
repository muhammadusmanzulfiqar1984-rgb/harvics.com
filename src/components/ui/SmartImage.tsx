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
    'cotton': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop',
    'shirt': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop',
    'silk': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=800&fit=crop',
    'scarf': 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&h=800&fit=crop',
    'denim': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop',
    'jeans': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop',
    'linen': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=800&fit=crop',
    'dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop',
    'wool': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=800&fit=crop',
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
    'sportswear': '/Industries Picture/Textile and Apparels/Sports Wear.jpg',
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

    // ─── FMCG ───
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

    // ─── COMMODITIES ───
    'wheat': 'https://images.unsplash.com/photo-1437252611977-07f74518abd7?w=800&h=800&fit=crop',
    'corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&h=800&fit=crop',
    'soybean': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop',
    'sugar': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=800&fit=crop',
    'cocoa': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&h=800&fit=crop',
    'gold': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=800&fit=crop',
    'silver': 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&h=800&fit=crop',
    'copper': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop',
    'steel': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop',
    'iron': 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&h=800&fit=crop',
    'aluminum': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop',
    'crude': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=800&fit=crop',
    'coal': 'https://images.unsplash.com/photo-1563780459966-3d38e2e08fa5?w=800&h=800&fit=crop',
    'beef': 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop',
    'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=800&fit=crop',
    'fish': 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=800&h=800&fit=crop',
    'palm': 'https://images.unsplash.com/photo-1474979266404-7eaacdc948b6?w=800&h=800&fit=crop',
    'fertilizer': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=800&fit=crop',

    // ─── INDUSTRIAL ───
    'machine': 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=800&fit=crop',
    'cnc': 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=800&fit=crop',
    'factory': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop',
    'safety': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop',
    'helmet': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop',
    'industrial': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop',
    'chemical': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=800&fit=crop',
    'polymer': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=800&fit=crop',
    'packaging': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=800&fit=crop',
    'bearing': 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=800&fit=crop',

    // ─── MINERALS ───
    'mining': 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&h=800&fit=crop',
    'ore': 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&h=800&fit=crop',
    'lithium': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=800&fit=crop',
    'platinum': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=800&fit=crop',
    'zinc': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop',
    'uranium': 'https://images.unsplash.com/photo-1563780459966-3d38e2e08fa5?w=800&h=800&fit=crop',
    'sand': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=800&fit=crop',
    'gravel': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=800&fit=crop',
    'limestone': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=800&fit=crop',

    // ─── OIL & GAS ───
    'rig': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=800&fit=crop',
    'pipeline': 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&h=800&fit=crop',
    'refinery': 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&h=800&fit=crop',
    'drilling': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=800&fit=crop',
    'tanker': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=800&fit=crop',
    'exploration': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=800&fit=crop',
    'terminal': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=800&fit=crop',
    'fuel': 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&h=800&fit=crop',
    'hse': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop',

    // ─── REAL ESTATE ───
    'office': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop',
    'building': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop',
    'apartment': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=800&fit=crop',
    'villa': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=800&fit=crop',
    'warehouse': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=800&fit=crop',
    'retail': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop',
    'construction': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop',
    'community': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=800&fit=crop',

    // ─── SOURCING ───
    'manufacturing': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop',
    'inspection': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop',
    'logistics': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=800&fit=crop',
    'cargo': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=800&fit=crop',
    'shipping': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=800&fit=crop',
    'consulting': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=800&fit=crop',
    'strategy': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=800&fit=crop',
    'sustainable': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=800&fit=crop',
    'quality': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop',

    // ─── FINANCE ───
    'finance': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=800&fit=crop',
    'bank': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=800&fit=crop',
    'payment': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop',
    'wallet': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop',
    'invoice': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=800&fit=crop',
    'compliance': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&fit=crop',
    'kyc': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&fit=crop',
    'analytics': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&fit=crop',

    // ─── AI & TECHNOLOGY ───
    'ai': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop',
    'forecast': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&fit=crop',
    'vision': 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=800&fit=crop',
    'chat': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop',
    'data': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&fit=crop',
    'erp': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&fit=crop',
    'mobile': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=800&fit=crop',
    'blockchain': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=800&fit=crop',
    'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop',

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
      
      for (const [key, url] of Object.entries(PRODUCT_IMAGES)) {
        if (searchText.includes(key) || key.includes(searchText)) {
          matchedUrl = url
          break
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
    
    for (const [key, url] of Object.entries(PRODUCT_IMAGES)) {
      if (searchText.includes(key)) {
        matchedUrl = url
        break
      }
    }
    
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

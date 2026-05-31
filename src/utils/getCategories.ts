import 'server-only';
import { getAllCategories, CategoryData } from '@/utils/folderScanner';

const CDN = process.env.NEXT_PUBLIC_CDN_URL || 'https://media.harvics.com';
const MANIFEST_URL = `${CDN}/manifest.json`;

interface ManifestEntry {
  url: string;
  key: string;
  vertical: string;
  category: string;
  subcategory?: string;
  prompt: string;
  engine: string;
  generatedAt: number;
}

// Folder name → category key mapping (mirrors folderScanner categoryMapping)
const FOLDER_TO_KEY: Record<string, string> = {
  'bakery': 'bakery',
  'beverages': 'beverages',
  'confectionery': 'confectionery',
  'culinary': 'culinary',
  'frozen-foods': 'frozenFoods',
  'pastas': 'pasta',
  'snacks': 'snacks',
};

async function fetchManifest(): Promise<ManifestEntry[]> {
  try {
    const res = await fetch(MANIFEST_URL, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Returns merged categories — local images + R2 generated images
export async function getMergedCategories(): Promise<CategoryData[]> {
  const [localCategories, manifest] = await Promise.all([
    getAllCategories(),
    fetchManifest(),
  ]);

  if (!manifest.length) return localCategories;

  // Group R2 images by category key and (when present) subcategory slug
  const r2ByCat: Record<string, string[]> = {};
  const r2BySub: Record<string, Record<string, string[]>> = {};
  for (const entry of manifest) {
    if (entry.vertical !== 'fmcg') continue;
    const key = FOLDER_TO_KEY[entry.category] ?? entry.category;
    (r2ByCat[key] ||= []).push(entry.url);
    if (entry.subcategory) {
      (r2BySub[key] ||= {})[entry.subcategory] ||= [];
      r2BySub[key][entry.subcategory].push(entry.url);
    }
  }

  return localCategories.map(cat => {
    const catImages = r2ByCat[cat.key];
    if (!catImages?.length) return cat;

    const subMap = r2BySub[cat.key] ?? {};
    const updatedSubs = cat.subcategories.map((sub) => {
      const subImages = subMap[sub.slug];
      if (!subImages?.length) return sub;
      return {
        ...sub,
        images: [...subImages, ...sub.images],
        imageCount: sub.imageCount + subImages.length,
      };
    });

    return {
      ...cat,
      image: catImages[0],
      subcategories: updatedSubs,
    };
  });
}

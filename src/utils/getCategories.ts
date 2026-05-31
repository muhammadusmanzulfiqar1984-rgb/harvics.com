import 'server-only';
import { getAllCategories, CategoryData } from '@/utils/folderScanner';

const CDN = process.env.NEXT_PUBLIC_CDN_URL || 'https://media.harvics.com';
const MANIFEST_URL = `${CDN}/manifest.json`;

interface ManifestEntry {
  url: string;
  key: string;
  vertical: string;
  category: string;
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

  // Group R2 images by category key
  const r2ByKey: Record<string, string[]> = {};
  for (const entry of manifest) {
    if (entry.vertical !== 'fmcg') continue;
    // entry.category is the folder name e.g. "wafer", "bakery"
    const key = FOLDER_TO_KEY[entry.category] ?? entry.category;
    if (!r2ByKey[key]) r2ByKey[key] = [];
    r2ByKey[key].push(entry.url);
  }

  // Inject R2 images into matching categories
  return localCategories.map(cat => {
    const r2Images = r2ByKey[cat.key];
    if (!r2Images?.length) return cat;

    // Prepend R2 images to first subcategory's image list + update category hero image
    const updatedSubs = cat.subcategories.map((sub, i) => {
      if (i !== 0) return sub;
      return {
        ...sub,
        images: [...r2Images, ...sub.images],
        imageCount: sub.imageCount + r2Images.length,
      };
    });

    return {
      ...cat,
      image: r2Images[0], // R2 generated image becomes hero
      subcategories: updatedSubs,
    };
  });
}

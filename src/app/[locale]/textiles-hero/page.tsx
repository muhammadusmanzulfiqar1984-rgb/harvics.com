import TextileCinematicHero from '@/components/verticals/TextileCinematicHero'

export const dynamic = 'force-static'

export default async function TextilesHeroPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <main className="min-h-screen bg-[#3D1212]">
      <TextileCinematicHero
        locale={locale}
        label="Textiles & Apparels"
        tagline="Apparel, Fabrics & Home Textiles"
      />
      <p className="py-4 text-center text-xs uppercase tracking-[0.2em] text-[#C3A35E]/70">
        Hero preview — video should loop above
      </p>
    </main>
  )
}
